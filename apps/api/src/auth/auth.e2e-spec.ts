import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestApp } from "../../test/app.factory";
import { PrismaService } from "../prisma/prisma.service";
import { clearDatabase } from "../../test/db.utils";
import { AuthService } from "./auth.service";

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
    it("returns 401 when called without auth", async () => {
      await request(app.getHttpServer()).post("/v1/auth/logout").expect(401);
    });

    it("revokes existing JWTs for the user (L1)", async () => {
      const auth = app.get(AuthService);
      const user = await prisma.user.create({
        data: { githubId: "gh-l1-revoke", username: "l1revoker" },
      });
      const token = auth.login(user).accessToken;

      // Token works before logout.
      await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      // Same token is now rejected — `tokensInvalidAfter` is set, so the
      // JwtStrategy compares against the JWT's `iat` and refuses it.
      await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);
    });
  });
});
