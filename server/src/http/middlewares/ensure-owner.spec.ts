import { describe, it, beforeAll, expect } from "vitest";
import Fastify from "fastify";
import jwtPlugin from "@/http/plugins/jwt";
import { verifyJWT } from "./verify-jwt";
import { ensureOwner } from "./ensure-owner";

describe("Ownership & Auth Guards", () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    app = Fastify();
    await app.register(jwtPlugin);

    app.get(
      "/restaurants/:restaurantId/protected",
      { preHandler: [verifyJWT, ensureOwner] },
      async () => ({ ok: true }),
    );

    await app.ready();
  });

  it("returns 401 when no token is provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/restaurants/550e8400-e29b-41d4-a716-446655440000/protected",
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 403 when token restaurantId is different", async () => {
    const token = app.jwt.sign({
      sub: "user-1",
      restaurantId: "550e8400-e29b-41d4-a716-446655440001",
      email: "owner@example.com",
      name: "Owner",
    });

    const response = await app.inject({
      method: "GET",
      url: "/restaurants/550e8400-e29b-41d4-a716-446655440002/protected",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("returns 200 when token restaurantId matches param", async () => {
    const restaurantId = "550e8400-e29b-41d4-a716-446655440003";
    const token = app.jwt.sign({
      sub: "user-1",
      restaurantId,
      email: "owner@example.com",
      name: "Owner",
    });

    const response = await app.inject({
      method: "GET",
      url: `/restaurants/${restaurantId}/protected`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
