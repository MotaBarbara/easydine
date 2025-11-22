import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { createRestaurant } from "./create";
import { RestaurantAlreadyExistsError } from "@/use-cases/errors/restaurant-already-exists-error";

vi.mock("@/use-cases/factories/make-create-restaurant-use-case", () => ({
  makeCreateRestaurantUseCase: vi.fn(),
}));

describe("Create Restaurant Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a restaurant successfully", async () => {
    const mockRestaurant = {
      id: "restaurant-123",
      name: "Test Restaurant",
      logo: "https://example.com/logo.png",
      primaryColor: "#FF0000",
      settings: null,
    };

    const mockExecute = vi.fn().mockResolvedValue({ restaurant: mockRestaurant });
    const { makeCreateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-create-restaurant-use-case"
    );
    vi.mocked(makeCreateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        name: "Test Restaurant",
        logo: "https://example.com/logo.png",
        primaryColor: "#FF0000",
      },
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await createRestaurant(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      ownerId: "user-123",
      name: "Test Restaurant",
      logo: "https://example.com/logo.png",
      primaryColor: "#FF0000",
      settings: null,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({ restaurant: mockRestaurant });
  });

  it("should use x-user-id header when user is not authenticated", async () => {
    const mockRestaurant = {
      id: "restaurant-123",
      name: "Test Restaurant",
      logo: null,
      primaryColor: null,
      settings: null,
    };

    const mockExecute = vi.fn().mockResolvedValue({ restaurant: mockRestaurant });
    const { makeCreateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-create-restaurant-use-case"
    );
    vi.mocked(makeCreateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        name: "Test Restaurant",
      },
      user: undefined,
      headers: {
        "x-user-id": "user-456",
      },
    } as unknown as FastifyRequest;

    await createRestaurant(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      ownerId: "user-456",
      name: "Test Restaurant",
      logo: null,
      primaryColor: null,
      settings: null,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
  });

  it("should return 401 when no owner id is provided", async () => {
    const mockRequest = {
      body: {
        name: "Test Restaurant",
      },
      user: undefined,
      headers: {},
    } as unknown as FastifyRequest;

    await createRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should handle restaurant already exists error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new RestaurantAlreadyExistsError());
    const { makeCreateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-create-restaurant-use-case"
    );
    vi.mocked(makeCreateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        name: "Existing Restaurant",
      },
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await createRestaurant(mockRequest, mockReply);

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
        logo: "not-a-url",
        primaryColor: "invalid-color",
      },
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await createRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

