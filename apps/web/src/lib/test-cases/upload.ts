export interface UploadResult {
    status: number;
    body: unknown;
}

// Заглушка
export async function uploadFile(
    _url: string,
    _file: File,
    _onProgress: (percent: number) => void
): Promise<UploadResult> {
    throw new Error('uploadFile еще не написан');
}