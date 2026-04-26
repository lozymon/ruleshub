import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestApp } from "../../test/app.factory";
import { PrismaService } from "../prisma/prisma.service";
import { clearDatabase } from "../../test/db.utils";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await clearDatabase(prisma);
    await app.close();
  });

  describe("GET /v1/auth/me", () => {
    it("returns 401 when no token is provided", async () => {
      await request(app.getHttpServer()).get("/v1/auth/me").expect(401);
    });

    it("returns 401 when an invalid token is provided", async () => {
      await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });

  describe("POST /v1/auth/logout", () => {
    it("returns 204 (JWT is stateless — client discards the token)", async () => {
      await request(app.getHttpServer()).post("/v1/auth/logout").expect(204);
    });
  });
});
