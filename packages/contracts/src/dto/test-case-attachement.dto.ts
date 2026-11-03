export interface TestCaseAttachmentDto {
    id: string;
    testCaseId: string;
    filedId: string;
    fileName: string;
    mime: string;
    size: number;
    createdAt: string;
}

export interface ListTestCaseAttachmentsResponseDto {
    items: TestCaseAttachmentDto[];
}