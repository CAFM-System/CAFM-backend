import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../models/residentProfile.model.js", () => ({
  getResidentProfile: vi.fn(),
  updateResidentProfile: vi.fn(),
}));

import { updateProfile } from "../controllers/residentProfile.controller.js";
import { updateResidentProfile } from "../models/residentProfile.model.js";

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const runUpdateProfile = async (body) => {
  const req = {
    body,
    user: { id: "resident-user-1" },
  };
  const res = createResponse();

  for (const middleware of updateProfile) {
    if (middleware.length >= 3) {
      await new Promise((resolve, reject) => {
        middleware(req, res, (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      continue;
    }

    await middleware(req, res);
  }

  return { req, res };
};

describe("residentProfile.controller updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateResidentProfile.mockResolvedValue({ first_name: "Jane" });
  });

  it("omits blank optional values instead of failing validation", async () => {
    const { res } = await runUpdateProfile({
      first_name: "Jane",
      gender: null,
      marital_status: "",
      resident_count: null,
    });

    expect(res.statusCode).toBe(200);
    expect(updateResidentProfile).toHaveBeenCalledWith("resident-user-1", {
      first_name: "Jane",
    });
  });

  it("normalizes capitalized enum values before updating", async () => {
    const { res } = await runUpdateProfile({
      gender: "Female",
      marital_status: "Widowed",
    });

    expect(res.statusCode).toBe(200);
    expect(updateResidentProfile).toHaveBeenCalledWith("resident-user-1", {
      gender: "female",
      marital_status: "widowed",
    });
  });

  it("returns a message alongside validation errors", async () => {
    const { res } = await runUpdateProfile({
      marital_status: "complicated",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid marital status");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Invalid marital status" }),
      ])
    );
    expect(updateResidentProfile).not.toHaveBeenCalled();
  });
});
