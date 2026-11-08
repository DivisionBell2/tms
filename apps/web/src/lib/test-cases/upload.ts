export interface UploadResult {
    status: number;
    body: unknown;
}

export async function uploadFile(
    url: string,
    file: File,
    onProgress: (percent: number) => void
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        const form = new FormData();
        form.append('file', file);

        xhr.open('POST', url);
        xhr.send(form);
    });
}