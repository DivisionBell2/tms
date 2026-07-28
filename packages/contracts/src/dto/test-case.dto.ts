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
    tags: string[];
    isCritical: boolean;
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
    tags?: string[];
    isCritical?: boolean;
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
    tag?: string;
    isCritical?: boolean;
    
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

export enum TestCaseTaskStatus {
    Open = 'open',
    Done = 'done'
}

export interface TestCaseStepDto {
    id: string;
    testCaseId: string;
    order: number;
    action: string;
    expectedResult: string;
}

export interface TestCaseDetailDto extends TestCaseDto {
    steps: TestCaseStepDto[];
}

export interface GetTestCaseRequestDto {
    id: string;
}

export interface UpdateTestCaseRequestDto {
    id: string;
    title?: string;
    description?: string;
    status?: TestCaseStatus;
    preconditions?: string;
    tags?: string[];
    isCritical?: boolean;
}

export interface DeleteTestCaseRequestDto {
    id: string;
}

export interface UpsertTestCaseStepItemDto {
    id?: string;
    order: number;
    action: string;
    expectedResult: string;
}

export interface UpsertTestCaseStepsRequestDto {
    testCaseId: string;
    steps: UpsertTestCaseStepItemDto[];
}


export interface TestCaseTaskDto {
    id: string;
    testCaseId: string;
    title: string;
    status: TestCaseTaskStatus;
}

export interface CreateTestCaseTaskRequestDto {
    testCaseId: string;
    title: string;
    status?: TestCaseTaskStatus;
}

export interface UpdateTestCaseTaskRequestDto {
    id: string;
    testCaseId: string;
    title?: string;
    status?: TestCaseTaskStatus;
}

export interface DeleteTestCaseTaskRequestDto {
    id: string;
    testCaseId: string;
}

export interface ListTestCaseTasksRequestDto {
    testCaseId: string;
}

export interface ListTestCaseTasksResponseDto {
    items: TestCaseTaskDto[];
}

