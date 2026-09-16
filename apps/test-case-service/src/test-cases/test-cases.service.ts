import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientProxy } from "@nestjs/microservices";
import { TestCase, TestCaseStep, TestCaseTask } from "../generated/prisma/client";
import {
    CreateTestCaseRequestDto,
    CreateTestCaseTaskRequestDto,
    DeleteTestCaseRequestDto,
    DeleteTestCaseTaskRequestDto,
    EVENT_TEST_CASE_CREATED,
    GetTestCaseRequestDto,
    ListTestCasesRequestDto,
    ListTestCasesResponseDto,
    ListTestCaseTasksRequestDto,
    ListTestCaseTasksResponseDto,
    TestCaseCreatedEventDto,
    TestCaseDetailDto,
    TestCaseDto,
    TestCaseStatus,
    TestCaseStepDto,
    TestCaseTaskDto,
    UpdateTestCaseRequestDto,
    UpdateTestCaseTaskRequestDto,
    UpsertTestCaseStepsRequestDto,
    TestCaseTaskStatus
} from "@tms/contracts";

@Injectable()
export class TestCasesService {

    constructor(
        private readonly prisma: PrismaService,
        @Inject('NATS_CLIENT') private readonly nats: ClientProxy
    ) { }

    private toDto(row: TestCase): TestCaseDto {
        return {
            id: row.id,
            authorId: row.authorId,
            authorName: row.authorName,
            title: row.title,
            description: row.description,
            status: row.status as TestCaseStatus,
            preconditions: row.preconditions,
            tags: row.tags,
            isCritical: row.isCritical,
            sectionId: row.sectionId,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString()
        }
    }

    private toStepDto(row: TestCaseStep): TestCaseStepDto {
        return {
            id: row.id,
            testCaseId: row.testCaseId,
            order: row.order,
            action: row.action,
            expectedResult: row.expectedResult
        }
    }

    private toDetailDto(
        row: TestCase & { steps: TestCaseStep[] }
    ): TestCaseDetailDto {
        return {
            ...this.toDto(row),
            steps: row.steps.map((s) => this.toStepDto(s))
        }
    }

    async create(dto: CreateTestCaseRequestDto): Promise<TestCaseDto> {
        const row = await this.prisma.testCase.create({
            data: {
                authorId: dto.authorId,
                authorName: dto.authorName,
                title: dto.title,
                description: dto.description,
                status: dto.status,
                preconditions: dto.preconditions,
                tags: dto.tags ?? [],
                isCritical: dto.isCritical ?? false,
                sectionId: dto.sectionId
            }
        });

        const event: TestCaseCreatedEventDto = { id: row.id, authorId: row.authorId };
        this.nats.emit(EVENT_TEST_CASE_CREATED, event);

        return this.toDto(row);
    }

    async list(dto: ListTestCasesRequestDto): Promise<ListTestCasesResponseDto> {
        const page = Math.max(1, dto.page);
        const pageSize = Math.min(100, Math.max(1, dto.pageSize));

        const where = {
            authorId: dto.authorId,
            ...(dto.filter ? { title: { contains: dto.filter, mode: 'insensitive' as const } } : {}),
            ...(dto.status ? { status: dto.status } : {}),
            ...(dto.author ? { authorName: { contains: dto.author, mode: 'insensitive' as const } } : {}),
            ...(dto.tag ? { tags: { has: dto.tag } } : {}),
            ...(dto.isCritical !== undefined ? { isCritical: dto.isCritical } : {}),
            ...(dto.sectionId !== undefined ? { sectionId: dto.sectionId } : {}),
            ...this.dateRange('createdAt', dto.createdFrom, dto.createdTo),
            ...this.dateRange('updatedAt', dto.updatedFrom, dto.updatedTo),
        }

        const orderBy = { [dto.sort ?? 'createdAt']: dto.order ?? 'desc' }

        const [items, total] = await Promise.all([
            this.prisma.testCase.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            this.prisma.testCase.count({ where })
        ]);

        return { items: items.map((r) => this.toDto(r)), total, page, pageSize }
    }

    async get(dto: GetTestCaseRequestDto): Promise<TestCaseDetailDto> {
        const row = await this.prisma.testCase.findUnique({
            where: { id: dto.id },
            include: { steps: { orderBy: { order: 'asc' } }}
        });

        if (!row) throw new NotFoundException('TestCase not found');

        return this.toDetailDto(row);
    }

    async update(dto: UpdateTestCaseRequestDto): Promise<TestCaseDetailDto> {
        const existing = await this.prisma.testCase.findUnique({
            where: { id: dto.id },
        });

        if (!existing) throw new NotFoundException('Test case ont found');

        const data = {
            ...(dto.title !== undefined ? { title: dto.title } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.preconditions !== undefined ? { preconditions: dto.preconditions } : {}),
            ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
            ...(dto.isCritical !== undefined ? { isCritical: dto.isCritical } : {})
        }

        await this.prisma.testCase.update({
            where: { id: dto.id },
            data
        });

        return this.get({ id: dto.id });
    }

    async delete(dto: DeleteTestCaseRequestDto): Promise<{ ok: true }> {
        const existing = await this.prisma.testCase.findUnique({
            where: { id: dto.id }
        });

        if (!existing) throw new NotFoundException('Test case not found');

        await this.prisma.testCase.delete({ where: { id: dto.id }});

        return { ok: true };
    }

    async upsertSteps(
        dto: UpsertTestCaseStepsRequestDto
    ): Promise<TestCaseStepDto[]> {
        const existing = await this.prisma.testCaseStep.findUnique({
            where: { id: dto.testCaseId }
        });

        if (!existing) throw new NotFoundException('Test case not found');

        const normalized = dto.steps.map((step, index) => ({
            id: step.id,
            testCaseId: dto.testCaseId,
            order: index + 1,
            action: step.action.trim(),
            expectedResult: step.expectedResult.trim()
        }));

        await this.prisma.$transaction(async (tx) => {
            await tx.testCaseStep.deleteMany({ where: { testCaseId: dto.testCaseId }});

            if (normalized.length > 0) {
                await tx.testCaseStep.createMany({
                    data: normalized.map((s) => ({
                        ...(s.id ? { id: s.id } : {}),
                        testCaseId: dto.testCaseId,
                        order: s.order,
                        action: s.action,
                        expectedResult: s.expectedResult
                    }))
                });
            }

            await tx.testCase.update({
                where: { id: dto.testCaseId },
                data: { updatedAt: new Date() }
            });
        });

        const rows = await this.prisma.testCaseStep.findMany({
            where: { testCaseId: dto.testCaseId },
            orderBy: { order: 'asc' }
        });

        return rows.map((r) => this.toStepDto(r));
    }

    async listTasks(dto: ListTestCaseTasksRequestDto): Promise<ListTestCaseTasksResponseDto> {
        await this.assertTestCaseExists(dto.testCaseId);

        const items = await this.prisma.testCaseTask.findMany({
            where: { testCaseId: dto.testCaseId },
            orderBy: { title: 'asc' }
        });

        return { items: items.map((t) => this.toTaskDto(t))}
    }

    async createTask(dto: CreateTestCaseTaskRequestDto): Promise<TestCaseTaskDto> {
        await this.assertTestCaseExists(dto.testCaseId);

        const title = dto.title.trim();
        
        if (!title) throw new BadRequestException('Title is required');

        const row = await this.prisma.testCaseTask.create({
            data: {
                testCaseId: dto.testCaseId,
                title: title,
                status: dto.status ?? TestCaseTaskStatus.Open
            }
        });

        return this.toTaskDto(row);
    }

    async updateTask(dto: UpdateTestCaseTaskRequestDto): Promise<TestCaseTaskDto> {
        const existing = await this.prisma.testCaseTask.findFirst({
            where: { id: dto.id, testCaseId: dto.testCaseId }
        });

        if (!existing) throw new NotFoundException('Task not found');

        const row = await this.prisma.testCaseTask.update({
            where: { id: dto.id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {})
            }
        });

        return this.toTaskDto(existing);
    }

    async deleteTask(dto: DeleteTestCaseTaskRequestDto): Promise<{ ok: true }> {
        const existing = await this.prisma.testCaseTask.findFirst({
            where: { id: dto.id, testCaseId: dto.testCaseId }
        });

        if (!existing) throw new NotFoundException('Task not found');

        await this.prisma.testCaseTask.delete({
            where: { id: dto.id }
        });

        return { ok: true };
    }

    private dateRange(field: 'createdAt' | 'updatedAt', from?: string, to?: string) {
        if (!from && !to) return {};
        const range: { gte?: Date; lte?: Date } = {};
        if (from) range.gte = new Date(from);
        if (to) range.lte = new Date(to);

        return { [field]: range };
    }

    private async assertTestCaseExists(testCaseId: string) {
        const row = await this.prisma.testCase.findUnique({
            where: { id: testCaseId }
        });

        if (!row) throw new NotFoundException('Test case not found');
    }

    private toTaskDto(row: TestCaseTask): TestCaseTaskDto {
        return {
            id: row.id,
            testCaseId: row.testCaseId,
            title: row.title,
            status: row.status as TestCaseTaskStatus
        }
    }
}