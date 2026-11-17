import { defer, of, throwError } from "rxjs";
import { TestCaseAttachmentsHttpController } from "./test-case-attachments-http.controller";
import { CMD_FILE_DELETE_MANY, CMD_FILE_GET_META, CMD_TEST_CASE_ATTACHMENT_DETACH, CMD_TEST_CASE_ATTACHMENT_LIST } from "@tms/contracts";

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

    it('склеивает связку и метаданные в один объект, порядок сохраняется', async () => {
        const { controller } = setup({
            [CMD_TEST_CASE_ATTACHMENT_LIST]: () => [link('a1', 'f1'), link('a2', 'f2')],
            [CMD_FILE_GET_META]: ({ fileId }) => meta(fileId, `${fileId}.txt`)
        });

        const result = await controller.list('tc1');

        expect(result.items).toEqual([
            {
                id: 'a1',
                testCaseId: 'tc1',
                fileId: 'f1',
                filename: 'f1.txt',
                mime: 'image/png',
                size: 1536,
                createdAt: '2026-01-01T00:00:00.000Z'
            },
            expect.objectContaining({ id: 'a2', fileId: 'f2', filename: 'f2.txt' })
        ]);
    });

    it('если кейса нет, ошибка test-case-service уходит наружу как есть', async () => {
        const { controller } = setup({
            [CMD_TEST_CASE_ATTACHMENT_LIST]: () => {
                throw { statusCode: 404, message: 'Test case not found' }
            }
        });

        await expect(controller.list('nope')).rejects.toEqual({
            statusCode: 404,
            message: 'Test case not found'
        });
    });
});

describe('DELETE rmove', () => {
    const happy = (): Replies => ({
        [CMD_TEST_CASE_ATTACHMENT_DETACH]: () => link('a1', 'f1'),
        [CMD_FILE_DELETE_MANY]: () => ({ deleted: 1 })
    });

    it('отвязывает вложение от кейса', async () => {
        const { controller, send } = setup(happy());

        await controller.remove('tc1', 'a1');

        expect(send).toHaveBeenNthCalledWith(1, CMD_TEST_CASE_ATTACHMENT_DETACH, {
            id: 'a1',
            testCaseId: 'tc1'
        });
    });

    it('потом удаляет файл, fileId берет из ответа отвязки', async () => {
        const { controller, send } = setup(happy());
        
        await controller.remove('tc1', 'a1');

        expect(send).toHaveBeenNthCalledWith(2, CMD_FILE_DELETE_MANY, { fileIds: ['f1'] });
    });

    it('отвечает { ok: true }', async () => {
        const { controller } = setup(happy());

        await expect(controller.remove('tc1', 'a1')).resolves.toEqual({ ok: true });
    });

    it('если вложения нет, файл не удаляется, а ошибка уходит наружу', async () => {
        const failure = { statusCode: 404, message: 'Atachment not found' }
        const { controller, send } = setup({
            ...happy(),
            [CMD_TEST_CASE_ATTACHMENT_DETACH]: () => {
                throw failure;
            }
        });

        await expect(controller.remove('tc1', 'nope')).rejects.toEqual(failure);
        expect(patterns(send)).toEqual([CMD_TEST_CASE_ATTACHMENT_DETACH])
    });
});