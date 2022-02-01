import { prisma } from "#lib/prisma";
import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "../server";

describe("Authentication", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;

  beforeAll(PlatformTest.bootstrap(Server));
  beforeAll(() => {
    request = SuperTest(PlatformTest.callback());
  });
  beforeAll(async () => {
    await prisma.cad.deleteMany();
    await prisma.user.deleteMany();
  });
  afterAll(PlatformTest.reset);

  describe("GET /", () => {
    it("Should return 200 response with 200 OK text", async () => {
      const response = await request.get("/").expect(200);
      expect(response.text).toEqual(
        "<html><head><title>SnailyCAD API</title></head><body>200 Success</body></html>",
      );
    });
  });

  describe("POST /auth/login", () => {
    it("Should return an error array when no values passed", async () => {
      const response = await request.post("/v1/auth/login").expect(400);
      expect(response.body.errors).toEqual([{ username: "Required", password: "Required" }]);
    });

    it("Should return an error when user not found", async () => {
      const response = await request
        .post("/v1/auth/login")
        .send({ username: "CasperTheGhost", password: "@@@@@@@@@@@@" })
        .expect(404);

      expect(response.body.errors).toEqual([{ username: "userNotFound" }]);
    });
  });

  describe("POST /auth/register", () => {
    it("Should return an error array when no values passed", async () => {
      const response = await request.post("/v1/auth/register").expect(400);
      expect(response.body.errors).toEqual([{ username: "Required", password: "Required" }]);
    });

    it("Should return the created userId and isOwner properties", async () => {
      const response = await request
        .post("/v1/auth/register")
        .send({ username: "CasperTheGhost", password: "@@@@@@@@@@@@" })
        .expect(200);

      // first account is owner
      expect(response.body.userId).toMatch(/([a-z])\w+/gi);
      expect(response.body.isOwner).toBeTruthy();
    });
  });
});
