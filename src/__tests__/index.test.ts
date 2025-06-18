import { describe, expect, it } from "bun:test";
import app from "../index";

let mockEnv = {
  KEY: "test-key",
  DB: {
    prepare: () => ({
      bind: () => ({
        run: async () => {},
      }),
      all: async () => ({
        results: [
          {
            latitude: 1,
            longitude: 1,
            created_at: new Date(),
          },
        ],
      }),
      error: null,
      run: async () => {},
    }),
  },
};

describe("loci", () => {
  describe("GET /locations", () => {
    it("returns 200 for correct request", async () => {
      const res = await app.request(
        "http://localhost:8787/locations?key=test-key",
        {},
        mockEnv,
      );
      expect(res.status).toBe(200);
    });
    it("returns 401 for incorrect key", async () => {
      const res = await app.request(
        "http://localhost:8787/locations?key=invalid",
        {},
        mockEnv,
      );
      expect(res.status).toBe(401);
    });
    it("returns 500 for server error", async () => {
      const res = await app.request(
        "http://localhost:8787/locations?key=test-key",
        {},
        {
          ...mockEnv,
          DB: {
            ...mockEnv.DB,
            prepare: () => ({
              all: async () => ({
                error: true,
              }),
            }),
          },
        },
      );
      expect(res.status).toBe(500);
    });
  });

  describe("GET /update/:latitude/:longitude", () => {
    it("returns 200 for correct request", async () => {
      const res = await app.request(
        "http://localhost:8787/update/1/1?key=test-key",
        {},
        mockEnv,
      );
      expect(res.status).toBe(200);
    });

    it("returns 401 for incorrect key", async () => {
      const res = await app.request(
        "http://localhost:8787/update/1/1?key=invalid",
        {},
        mockEnv,
      );

      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid latitude or longitude", async () => {
      const res = await app.request(
        "http://localhost:8787/update/1/invalid?key=test-key",
        {},
        mockEnv,
      );

      expect(res.status).toBe(400);
    });

    it("returns 404 for missing latitude", async () => {
      const res = await app.request(
        "http://localhost:8787/update/1?key=test-key",
        {},
        mockEnv,
      );

      expect(res.status).toBe(404);
    });

    it("returns 500 for server error", async () => {
      const res = await app.request(
        "http://localhost:8787/update/1/1?key=test-key",
        {},
        {
          ...mockEnv,
          DB: {
            ...mockEnv.DB,
            prepare: () => ({
              bind: () => ({
                run: async () => {
                  throw new Error("test");
                },
              }),
            }),
          },
        },
      );
      expect(res.status).toBe(500);
    });
  });
});
