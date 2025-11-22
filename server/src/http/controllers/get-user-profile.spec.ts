import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { getUserProfile } from "./get-user-profile";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";

vi.mock("@/use-cases/factories/make-get-user-profile-use-case", () => ({
  makeGetUserProfileUseCase: vi.fn(),
}));

describe("Get User Profile Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user profile", async () => {
    const mockUser = {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
    };

    const mockExecute = vi.fn().mockResolvedValue({ user: mockUser });
    const { makeGetUserProfileUseCase } = await import(
      "@/use-cases/factories/make-get-user-profile-use-case"
    );
    vi.mocked(makeGetUserProfileUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await getUserProfile(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({ userId: "user-123" });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
    });
  });

  it("should return 401 when user is not authenticated", async () => {
    const mockRequest = {
      user: undefined,
    } as unknown as FastifyRequest;

    await getUserProfile(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 401 when user.sub is missing", async () => {
    const mockRequest = {
      user: {},
    } as FastifyRequest;

    await getUserProfile(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should handle user not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new ResourceNotFoundError());
    const { makeGetUserProfileUseCase } = await import(
      "@/use-cases/factories/make-get-user-profile-use-case"
    );
    vi.mocked(makeGetUserProfileUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      user: {
        sub: "non-existent-user",
      },
    } as FastifyRequest;

    await getUserProfile(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});

