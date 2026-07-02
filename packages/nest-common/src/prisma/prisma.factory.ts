import { Module, OnModuleDestroy, DynamicModule, Type } from "@nestjs/common";
import { OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

interface PrismaLifecycleClient {
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
}

type PrismaClientCtor = new (...args: any[]) => PrismaLifecycleClient;

export function createPrismaService<TCtor extends PrismaClientCtor>(PrismaClient: TCtor): new () => InstanceType<TCtor> & OnModuleInit & OnModuleDestroy {
    class PrismaServiceBase extends PrismaClient implements OnModuleInit, OnModuleDestroy {
        constructor(...args: any[]) {
            const connectionString = process.env.DATABASE_URL;

            if (!connectionString) {
                throw new Error('DATABASE_URL is not set');
            }

            super({ adapter: new PrismaPg({ connectionString }) });
        }

        async onModuleInit(): Promise<void> {
            await this.$connect();
        }

        async onModuleDestroy(): Promise<void> {
            await this.$disconnect();
        }
    }

    return PrismaServiceBase as unknown as new () => InstanceType<TCtor> & OnModuleInit & OnModuleDestroy;
}

@Module({})
class PrismaModule {}

export function createPrismaModule(prismaService: Type<unknown>):
    DynamicModule {
    return {
        module: PrismaModule,
        global: true,
        providers: [prismaService],
        exports: [prismaService]
    }
}