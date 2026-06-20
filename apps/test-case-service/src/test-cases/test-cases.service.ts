import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientProxy } from "@nestjs/microservices";
import { TestCase } from "../generated/prisma/client";
import { CreateTestCaseRequestDto, EVENT_TEST_CASE_CREATED, ListTestCasesRespononseDto, ListTestCasesRequestDto, TestCaseCreatedEventDto, TestCaseDto, TestCasesStatus } from "@tms/contracts";

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
            title: row.title,
            description: row.description,
            status: row.status as TestCasesStatus,
            preconditions: row.preconditions,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString()
        }
    }

    async create(dto: CreateTestCaseRequestDto): Promise<TestCaseDto> {
        const row = await this.prisma.testCase.create({
            data: {
                authorId: dto.authorId,
                title: dto.title,
                description: dto.description,
                status: dto.status,
                preconditions: dto.preconditions
            }
        });

        const event: TestCaseCreatedEventDto = { id: row.id, authorId: row.authorId };
        this.nats.emit(EVENT_TEST_CASE_CREATED, event);

        return this.toDto(row);
    }

    async list(dto: ListTestCasesRequestDto): Promise<ListTestCasesRespononseDto> {
        const page = Math.max(1, dto.page);
        const pageSize = Math.min(100, Math.max(1, dto.pageSize));

        const where = {
            authorId: dto.authorId,
            ...(dto.filter ? { title: { contains: dto.filter, mode: 'insensitive' as const } } : {})
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
}