import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TestCasesController } from "./test-cases.controller";
import { TestCasesService } from "./test-cases.service";

const natsUrl = process.env.NATS_URL ?? 'nats://localhost:4222';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'NATS_CLIENT',
                transport: Transport.NATS,
                options: { servers: [natsUrl]}
            }
        ])
    ],
    controllers: [TestCasesController],
    providers: [TestCasesService]
})
export class TestCasesModule {}