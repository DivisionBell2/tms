import { defer, of, throwError } from "rxjs";
import { TestCaseAttachmentsHttpController } from "./test-case-attachments-http.controller";
import { CMD_FILE_GET_META, CMD_TEST_CASE_ATTACHMENT_LIST } from "@tms/contracts";

type Replies = Record<string, (payload: any) => unknown>;

const link = (id: string, fileId: string) => ({
    id,
    testCaseId: 'tc1',
    fileId,
    createdAt: '2026-01-01T00:00:00.000Z'
});

const meta = (id: string, filename = `${id}.png`) => ({
    id,
    ownerId: 'u1',
    filename,
    mime: 'image/png',
    size: 1536,
    createdAt: '2026-01-01T00:00:00.000Z'
});

function setup(replies: Replies = {}) {
    const send = jest.fn((pattern: string, payload: unknown) => {
        const reply = replies[pattern];

        if (!reply) return throwError(() => new Error(`Нет ответа для ${pattern}`));

        return defer(() => of(reply(payload)));
    });

    return { send, controller: new TestCaseAttachmentsHttpController({ send } as never)};
}

const patterns = (send: jest.Mock) => send.mock.calls.map(([pattern]) => pattern);

describe('GET list', () => {
    it('просит у test-case-service связки этого кейса', async () => {
        const { controller, send } = setup({ [CMD_TEST_CASE_ATTACHMENT_LIST]: () => [] });

        await controller.list('tc1');

        expect(send).toHaveBeenCalledWith(CMD_TEST_CASE_ATTACHMENT_LIST, { testCaseId: 'tc1' });
    });

    it('без вложений не обращается к file-service', async () => {
        const { controller, send } = setup({ [CMD_TEST_CASE_ATTACHMENT_LIST]: () => [] });

        const result = await controller.list('tc1');

        expect(result).toEqual({ items: [] });
        expect(patterns(send)).toEqual([CMD_TEST_CASE_ATTACHMENT_LIST]);
    });

    it('для каждой связки спрашивает метаданные файла', async () => {
        const { controller, send } = setup({
            [CMD_TEST_CASE_ATTACHMENT_LIST]: () => [link('a1', 'f1'), link('a2', 'f2')],
            [CMD_FILE_GET_META]: ({ fileId }) => meta(fileId)
        });

        await controller.list('tc1');

        expect(send).toHaveBeenCalledWith(CMD_FILE_GET_META, { fileId: 'f1' });
        expect(send).toHaveBeenCalledWith(CMD_FILE_GET_META, { fileId: 'f2' });
    });
});