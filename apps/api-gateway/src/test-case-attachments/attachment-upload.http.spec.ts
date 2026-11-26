import { INestApplication } from "@nestjs/common";
import { CMD_FILE_UPLOAD, CMD_TEST_CASE_ATTACHMENT_ATTACH, CMD_TEST_CASE_ATTACHMENT_LIST, MAX_ATACHMENT_SIZE } from "@tms/contracts"
import { of } from "rxjs";
import { Test } from '@nestjs/testing';
import { TestCaseAttachmentsHttpController } from "./test-case-attachments-http.controller";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HttpExceptionFilter } from "../common/http-exception.filter";
import request from 'supertest';

const send = jest.fn((pattern: string, payload: any) => {
    if (pattern === CMD_TEST_CASE_ATTACHMENT_LIST) return of([]);
    
    if (pattern === CMD_FILE_UPLOAD) {
        return of({
            id: 'f1',
            ownerId: 'u1',
            filename: payload.filename,
            mime: payload.mime,
            size: 3,
            createdAt: '2026-01-01T00:00:00.000Z'
        });
    }

    if (pattern === CMD_TEST_CASE_ATTACHMENT_ATTACH) {
        return of({
            id: 'a1',
            ...payload,
            createdAt: '2026-01-01T00:00:00.000Z'
        });
    }

    return of({});
});

let app: INestApplication;

beforeAll(async () => {
    const module = await Test.createTestingModule({
        controllers: [TestCaseAttachmentsHttpController],
        providers: [{ provide: 'NATS_CLIENT', useValue: { send } }]
    })
        .overrideGuard(JwtAuthGuard)
        .useValue({
            canActivate: (context: any) => {
                context.switchToHttp().getRequest().userId = 'u1';

                return true;
            }
        })
        .compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
});

afterAll(() => app.close());

const upload = () => request(app.getHttpServer()).post('/test-cases/tc1/attachments');

describe('POST /test-cases/:id/attachments (настоящий multipart)', () => {
    it('сохраняет русское имя файла без "кракозябр"', async () => {
        const res = await upload().attach('file', Buffer.from('abc'), 'Скриншот ошибки.png');

        expect(res.status).toBe(201);
        expect(res.body.filename).toBe('Скриншот ошибки.png');
    });

    it('файл больше лимита отклоняется с 413', async () => {
        const res = await upload().attach('file', Buffer.alloc(MAX_ATACHMENT_SIZE + 1), 'big.bin');

        expect(res.status).toBe(413);
    });

    it('запрос без файла отклоняется с 400', async () => {
        const res = await upload();

        expect(res.status).toBe(400);
    });
});