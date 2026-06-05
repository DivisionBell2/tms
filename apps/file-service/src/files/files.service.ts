import { Injectable, NotFoundException } from "@nestjs/common";
import { join } from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { FileGetMetaRequestDto, FileMetaDto, FileUploadRequestDto, FileDeleteRequestDto } from "@tms/contracts";
import { mkdir, unlink, writeFile } from "node:fs/promises";

const STORAGE_DIR = join(process.cwd(), 'storage');

@Injectable()
export class FilesService {
    constructor(private readonly prisma: PrismaService) {}

    private toMeta(row: {
        id: string;
        ownerId: string;
        mime: string;
        size: number;
        createdAt: Date;
    }): FileMetaDto {
        return {
            id: row.id,
            ownerId: row.ownerId,
            mime: row.mime,
            size: row.size,
            createdAt: row.createdAt.toISOString()
        }
    }

    async upload(dto: FileUploadRequestDto): Promise<FileMetaDto> {
        await mkdir(STORAGE_DIR, { recursive: true });
        const buffer = Buffer.from(dto.dataBase64, 'base64');
        const row  = await this.prisma.file.create({
            data: {
                ownerId: dto.ownerId,
                mime: dto.mime,
                size: buffer.length,
                path: ''
            }
        });
        const filename = row.id;
        const fullPath = join(STORAGE_DIR, filename);
        await writeFile(fullPath, buffer);
        const updated = await this.prisma.file.update({
            where: { id: row.id },
            data: { path: filename }
        });

        return this.toMeta(updated);
    }

    async getMeta(dot: FileGetMetaRequestDto): Promise<FileMetaDto> {
        const row = await this.prisma.file.findUnique({ where: { id: dot.fileId }});

        if (!row) throw new NotFoundException('File not found');

        return this.toMeta(row);
    }

    async getAbsolutePath(fileId: string): Promise<string> {
        const row = await this.prisma.file.findUnique({ where: { id: fileId }});

        if (!row) throw new NotFoundException('File not found');

        return join(STORAGE_DIR, row.path);
    }

    async delete(dto: FileDeleteRequestDto): Promise<{ ok: boolean }> {
        const row = await this.prisma.file.findUnique({ where: { id: dto.fileId }});

        if (!row || row.ownerId !== dto.ownerId) throw new NotFoundException();

        try {
            await unlink(join(STORAGE_DIR, row.path));
        } catch {}

        await this.prisma.file.delete({ where: { id: dto.fileId }});
        return { ok: true }
    }
}