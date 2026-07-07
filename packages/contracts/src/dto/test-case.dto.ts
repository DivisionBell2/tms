export enum TestCaseStatus {
    Draft = 'draft',
    Manual = 'manual',
    Automated = 'automated'
};

export interface TestCaseDto {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    description: string;
    status: TestCaseStatus;
    preconditions: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTestCaseRequestDto {
    authorId: string;
    authorName: string;
    title: string;
    description: string;
    status: TestCaseStatus;
    preconditions: string;
}

export interface ListTestCasesRequestDto {
    authorId?: string;
    page: number;
    pageSize: number;
    sort?: 'createdAt' | 'updatedAt' | 'title' | 'status' | 'authorName';
    order?: 'asc' | 'desc';
    status?: TestCaseStatus;
    author?: string;
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    filter?: string;
    
}

export interface ListTestCasesResponseDto {
    items: TestCaseDto[];
    total: number;
    page: number;
    pageSize: number;
}

export interface TestCaseCreatedEventDto {
    id: string;
    authorId: string;
}