import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { createPrismaService } from "@tms/nest-common";


@Injectable()
export class PrismaService extends createPrismaService(PrismaClient) {}