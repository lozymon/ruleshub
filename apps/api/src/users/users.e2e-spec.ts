import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestApp } from "../../test/app.factory";
import { PrismaService } from "../prisma/prisma.service";
import { clearDatabase } from "../../test/db.utils";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await prisma.user.create({
      data: {
        githubId: "gh-h7-secret",
        username: "h7user",
        avatarUrl: null,
        bio: "hi",
        isAdmin: true,
      },
    });
  });

  afterAll(async () => {
    await clearDatabase(prisma);
    await app.close();
  });

  it("returns 404 for unknown user", async () => {
    await request(app.getHttpServer())
      .get("/v1/users/does-not-exist")
      .expect(404);
  });

  it("returns the public profile shape and never leaks internal fields", async () => {
    const res = await request(app.getHttpServer())
      .get("/v1/users/h7user")
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(String),
      username: "h7user",
      avatarUrl: null,
      bio: "hi",
      verified: false,
      isAdmin: true,
      createdAt: expect.any(String),
    });
    expect(res.body).not.toHaveProperty("githubId");
    expect(res.body).not.toHaveProperty("blocked");
    expect(res.body).not.toHaveProperty("updatedAt");
  });
});
