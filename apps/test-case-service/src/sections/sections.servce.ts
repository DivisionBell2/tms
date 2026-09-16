import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TestCaseSection } from "../generated/prisma/client";
import { CreateTestCaseSectionRequestDto, ListTestCaseSectionsRequestDto, ListTestCaseSectionsResponseDto, SetTestCaseSectionPinRequestDto, TestCaseSectionDto } from "@tms/contracts";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SectionsService {
    constructor(private readonly prisma: PrismaService) { }

    private toDto(row: TestCaseSection): TestCaseSectionDto {
        return {
            id: row.id,
            name: row.name,
            parentId: row.parentId,
            isPinned: row.isPinned,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString()
        }
    }

    async create(dto: CreateTestCaseSectionRequestDto): Promise<TestCaseSectionDto> {
        const name = dto.name.trim();

        if (!name) throw new BadRequestException('Name is required');

        if (dto.parentId) await this.assertSectionExists(dto.parentId);

        const row = await this.prisma.testCaseSection.create({
            data: {
                name,
                parentId: dto.parentId ?? null
            }
        });

        return this.toDto(row);
    }

    async list(dto: ListTestCaseSectionsRequestDto): Promise<ListTestCaseSectionsResponseDto> {
        const orderBy = { [ dto.sort ?? 'name']: dto.order ?? 'asc' };

        const items = await this.prisma.testCaseSection.findMany({ orderBy });

        return { items: items.map((r) => this.toDto(r)) }
    }

    async setPin(dto: SetTestCaseSectionPinRequestDto): Promise<TestCaseSectionDto> {
        await this.assertSectionExists(dto.id);

        const row = await this.prisma.testCaseSection.update({
            where: { id: dto.id },
            data: { isPinned: dto.isPinned }
        })

        return this.toDto(row);
    }

    private async assertSectionExists(id: string) {
        const row = await this.prisma.testCaseSection.findUnique({
            where: { id }
        });

        if (!row) throw new NotFoundException('Section not found');
    }
}