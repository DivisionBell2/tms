import { TestCaseStatus } from "@tms/contracts";

export type StatusTone = 'neutral' | 'info' | 'success';

export interface TestCaseStatusMeta {
    label: string;
    icon: string;
    tone: StatusTone;
}

export const TEST_CASE_STATUS_META: Record<TestCaseStatus, TestCaseStatusMeta> = {
    [TestCaseStatus.Draft]: { label: 'Черновик', icon: 'edit_note', tone: 'neutral' },
    [TestCaseStatus.Manual]: { label: 'Ручное тестирование', icon: 'pan_tool', tone: 'info' },
    [TestCaseStatus.Automated]: { label: 'Автоматизирован', icon: 'smart_toy', tone: 'success' }
}

export const TEST_CASE_STATUS_ORDER: TestCaseStatus[] = [
    TestCaseStatus.Draft,
    TestCaseStatus.Manual,
    TestCaseStatus.Automated
];

export const TEST_CASE_STATUS_OPTIONS: { value: TestCaseStatus; label: string }[] =
    TEST_CASE_STATUS_ORDER.map((value) => ({ value, label: TEST_CASE_STATUS_META[value].label }));