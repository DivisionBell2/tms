export type TestCasesStatus = 'draft' | 'manual' | 'automated';

export interface TestCaseDto {
    id: string;
    authorId: string;
    title: string;
    description: string;
    status: TestCasesStatus;
    preconditions: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTestCaseRequestDto {
    authorId: string;
    title: string;
    description: string;
    status: TestCasesStatus;
    preconditions: string;
}

export interface ListTestCasesRequestDto {
    authorId: string;
    page: number;
    pageSize: number;
    sort?: 'createdAt' | 'updatedAt' | 'title';
    order?: 'asc' | 'desc';
    filter?: string;
}

export interface ListTesCasesRespononseDto {
    items: TestCaseDto[];
    total: number;
    page: number;
    pageSize: number;
}

export interface TestCaseCreatedEventDto {
    id: string;
    authorId: string;
}