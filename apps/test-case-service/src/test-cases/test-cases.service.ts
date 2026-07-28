import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientProxy } from "@nestjs/microservices";
import { TestCase } from "../generated/prisma/client";
import { CreateTestCaseRequestDto, EVENT_TEST_CASE_CREATED, ListTestCasesResponseDto, ListTestCasesRequestDto, TestCaseCreatedEventDto, TestCaseDto, TestCaseStatus } from "@tms/contracts";

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
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString()
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
                isCritical: dto.isCritical ?? false
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

    private dateRange(field: 'createdAt' | 'updatedAt', from?: string, to?: string) {
        if (!from && !to) return {};
        const range: { gte?: Date; lte?: Date } = {};
        if (from) range.gte = new Date(from);
        if (to) range.lte = new Date(to);

        return { [field]: range };
    }
}