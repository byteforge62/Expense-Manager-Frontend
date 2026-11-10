import { describe, expect, test } from "vitest";
import axiosInstance, { resolveApiBaseUrl } from "../components/Utils/axiosInstance";

describe("axiosInstance configuration", () => {
  test("uses the configured VITE_API_BASE_URL and adds the API suffix when needed", () => {
    expect(resolveApiBaseUrl("https://api.example.com")).toBe("https://api.example.com/api");
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  test("normalizes trailing slashes in the backend base URL", () => {
    expect(resolveApiBaseUrl("https://api.example.com/")).toBe("https://api.example.com/api");
  });
});
