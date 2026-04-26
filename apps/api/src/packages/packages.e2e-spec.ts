import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestApp } from "../../test/app.factory";
import { PrismaService } from "../prisma/prisma.service";
import { clearDatabase } from "../../test/db.utils";

describe("Packages (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await clearDatabase(prisma);
    await app.close();
  });

  describe("GET /v1/packages", () => {
    it("returns a paginated list with default pagination", async () => {
      const res = await request(app.getHttpServer())
        .get("/v1/packages")
        .expect(200);

      expect(res.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      });
    });

    it("accepts a search query param", async () => {
      const res = await request(app.getHttpServer())
        .get("/v1/packages?q=nestjs")
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("filters by type", async () => {
      const res = await request(app.getHttpServer())
        .get("/v1/packages?type=rule")
        .expect(200);

      for (const pkg of res.body.data) {
        expect(pkg.type).toBe("rule");
      }
    });

    it("returns 400 for an invalid type", async () => {
      await request(app.getHttpServer())
        .get("/v1/packages?type=invalid-type")
        .expect(400);
    });

    it("filters by scope=pack", async () => {
      const res = await request(app.getHttpServer())
        .get("/v1/packages?scope=pack")
        .expect(200);

      for (const pkg of res.body.data) {
        expect(pkg.type).toBe("pack");
      }
    });

    it("filters by scope=individual", async () => {
      const res = await request(app.getHttpServer())
        .get("/v1/packages?scope=individual")
        .expect(200);

      for (const pkg of res.body.data) {
        expect(pkg.type).not.toBe("pack");
      }
    });
  });

  describe("GET /v1/packages/:namespace/:name", () => {
    it("returns 404 for a non-existent package", async () => {
      await request(app.getHttpServer())
        .get("/v1/packages/nobody/does-not-exist")
        .expect(404);
    });

    describe("with a seeded package", () => {
      beforeAll(async () => {
        const user = await prisma.user.create({
          data: {
            githubId: "gh-test-1",
            username: "testuser",
            avatarUrl: null,
          },
        });
        const pkg = await prisma.package.create({
          data: {
            namespace: "testuser",
            name: "test-rule",
            type: "rule",
            description: "A test rule package",
            ownerType: "user",
            ownerUserId: user.id,
            supportedTools: ["claude-code"],
          },
        });
        await prisma.packageVersion.create({
          data: {
            packageId: pkg.id,
            version: "1.0.0",
            manifestJson: JSON.stringify({
              name: "testuser/test-rule",
              version: "1.0.0",
              type: "rule",
              description: "A test rule package",
              license: "MIT",
              targets: { "claude-code": { file: "CLAUDE.md" } },
            }),
            storageKey: "testuser/test-rule/1.0.0.zip",
          },
        });
      });

      afterAll(async () => {
        await clearDatabase(prisma);
      });

      it("returns the package by namespace and name", async () => {
        const res = await request(app.getHttpServer())
          .get("/v1/packages/testuser/test-rule")
          .expect(200);

        expect(res.body).toMatchObject({
          namespace: "testuser",
          name: "test-rule",
          type: "rule",
          description: "A test rule package",
        });
      });

      it("includes version info", async () => {
        const res = await request(app.getHttpServer())
          .get("/v1/packages/testuser/test-rule")
          .expect(200);

        expect(res.body.latestVersion).toMatchObject({ version: "1.0.0" });
        expect(res.body.versions).toHaveLength(1);
      });

      it("shows up in search results", async () => {
        const res = await request(app.getHttpServer())
          .get("/v1/packages?q=test-rule")
          .expect(200);

        const found = res.body.data.find(
          (p: { name: string }) => p.name === "test-rule",
        );
        expect(found).toBeDefined();
      });
    });
  });

  describe("DELETE /v1/packages/:namespace/:name/:version", () => {
    it("returns 401 when not authenticated", async () => {
      await request(app.getHttpServer())
        .delete("/v1/packages/testuser/test-rule/1.0.0")
        .expect(401);
    });
  });
});
