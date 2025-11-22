import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyJWT } from "./verify-jwt";

describe("verifyJWT middleware", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows request when jwt is valid", async () => {
    const mockRequest = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
    } as unknown as FastifyRequest;

    await verifyJWT(mockRequest, mockReply);

    expect(mockRequest.jwtVerify).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it("returns 401 when jwt is invalid", async () => {
    const mockRequest = {
      jwtVerify: vi.fn().mockRejectedValue(new Error("Invalid token")),
    } as unknown as FastifyRequest;

    await verifyJWT(mockRequest, mockReply);

    expect(mockRequest.jwtVerify).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("returns 401 when jwt is missing", async () => {
    const mockRequest = {
      jwtVerify: vi.fn().mockRejectedValue(new Error("No token")),
    } as unknown as FastifyRequest;

    await verifyJWT(mockRequest, mockReply);

    expect(mockRequest.jwtVerify).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});

