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

        xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;

            onProgress(Math.round((e.loaded / e.total) * 100));
        }

        xhr.onload = () => {
            let body: unknown = {};

            try {
                body = JSON.parse(xhr.responseText);
            } catch {
                body = {}
            }

            resolve({ status: xhr.status, body });
        }

        xhr.onerror = () => reject(new Error('Нет связи с сервером'));

        xhr.timeout = 60_000;
        xhr.ontimeout = () => reject(new Error('Сервер не ответил вовремя'));

        const form = new FormData();
        form.append('file', file);

        xhr.open('POST', url);
        xhr.send(form);
    });
}