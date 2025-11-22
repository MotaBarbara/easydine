import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { authenticate } from "./authenticate";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error";

vi.mock("@/use-cases/factories/make-authenticate-use-case", () => ({
  makeAuthenticateUseCase: vi.fn(),
}));

describe("Authenticate Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    jwtSign: vi.fn(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should authenticate user and return token", async () => {
    const mockUser = {
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
    };

    const mockExecute = vi.fn().mockResolvedValue({ user: mockUser });
    const { makeAuthenticateUseCase } = await import(
      "@/use-cases/factories/make-authenticate-use-case"
    );
    vi.mocked(makeAuthenticateUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    vi.mocked(mockReply.jwtSign).mockResolvedValue("mock-jwt-token" as any);

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "123456",
      },
    } as FastifyRequest;

    await authenticate(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "123456",
    });
    expect(mockReply.jwtSign).toHaveBeenCalledWith({
      sub: "user-123",
      email: "john@example.com",
      name: "John Doe",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ token: "mock-jwt-token" });
  });

  it("should handle invalid credentials error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new InvalidCredentialsError());
    const { makeAuthenticateUseCase } = await import(
      "@/use-cases/factories/make-authenticate-use-case"
    );
    vi.mocked(makeAuthenticateUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "wrong-password",
      },
    } as FastifyRequest;

    await authenticate(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Incorrect email or password.",
    });
  });

  it("should handle validation errors", async () => {
    const mockRequest = {
      body: {
        email: "invalid-email",
        password: "123",
      },
    } as FastifyRequest;

    await authenticate(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

