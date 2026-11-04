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