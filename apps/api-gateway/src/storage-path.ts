import { join, isAbsolute } from "node:path";

export function resolveStorageDir(): string {
    const rel = process.env.FILE_STORAGE_DIR ?? 'apps/file-service/storage';

    if (isAbsolute(rel)) return rel;

    const repoRoot = join(process.cwd(), '..', '..');

    return join(repoRoot, rel);
}