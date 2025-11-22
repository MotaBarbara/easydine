import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { register } from "./register";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error";

vi.mock("@/use-cases/factories/make-register-use-case", () => ({
  makeRegisterUseCase: vi.fn(),
}));

describe("Register Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user", async () => {
    const mockExecute = vi.fn().mockResolvedValue(undefined);
    const { makeRegisterUseCase } = await import(
      "@/use-cases/factories/make-register-use-case"
    );
    vi.mocked(makeRegisterUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
      },
    } as FastifyRequest;

    await register(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it("should handle user already exists error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new UserAlreadyExistsError());
    const { makeRegisterUseCase } = await import(
      "@/use-cases/factories/make-register-use-case"
    );
    vi.mocked(makeRegisterUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
      },
    } as FastifyRequest;

    await register(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should handle validation errors", async () => {
    const mockRequest = {
      body: {
        name: "",
        email: "invalid-email",
        password: "123",
      },
    } as FastifyRequest;

    await register(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

