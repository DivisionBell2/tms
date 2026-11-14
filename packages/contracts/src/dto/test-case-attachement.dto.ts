export interface TestCaseAttachmentDto {
    id: string;
    testCaseId: string;
    fileId: string;
    filename: string;
    mime: string;
    size: number;
    createdAt: string;
}

export interface ListTestCaseAttachmentsResponseDto {
    items: TestCaseAttachmentDto[];
}

export interface TestCaseAttachmentLinkDto {
    id: string;
    testCaseId: string;
    fileId: string;
    createdAt: string;
}

export interface ListTestCaseAttachmentLinksRequestDto {
    testCaseId: string;
}

export interface DetachTestCaseFileRequestDto {
    id: string;
    testCaseId: string;
}