import { test, expect } from "@playwright/test"
import {
  AUTH_ROUTES,
  DEFAULT_SIGNED_IN_ROUTE,
  PROTECTED_ROUTES,
  matchesRoute,
  safeRedirect,
} from "../apps/frontend/lib/auth-config"

test.describe("safeRedirect", () => {
  test("keeps same-origin paths", () => {
    expect(safeRedirect("/dashboard/bot/abc")).toBe("/dashboard/bot/abc")
    expect(safeRedirect("/dashboard?tab=train")).toBe("/dashboard?tab=train")
  })

  test("rejects anything that could leave the origin", () => {
    for (const hostile of [
      "//evil.com",
      "///evil.com",
      "https://evil.com",
      "http://evil.com/dashboard",
      "javascript:alert(1)",
      "dashboard",
      "",
      null,
      undefined,
      42,
    ]) {
      expect(safeRedirect(hostile)).toBe(DEFAULT_SIGNED_IN_ROUTE)
    }
  })
})

test.describe("matchesRoute", () => {
  test("guards protected pages and their children", () => {
    expect(matchesRoute("/dashboard", PROTECTED_ROUTES)).toBe(true)
    expect(matchesRoute("/dashboard/bot/abc/train", PROTECTED_ROUTES)).toBe(true)
    expect(matchesRoute("/reset-password", PROTECTED_ROUTES)).toBe(true)
  })

  test("leaves public pages alone", () => {
    expect(matchesRoute("/", PROTECTED_ROUTES)).toBe(false)
    expect(matchesRoute("/login", PROTECTED_ROUTES)).toBe(false)
    // A path that merely starts with the same characters is not a child route.
    expect(matchesRoute("/dashboards-public", PROTECTED_ROUTES)).toBe(false)
  })

  test("signed-in users are bounced off auth pages, but not off password recovery", () => {
    expect(matchesRoute("/login", AUTH_ROUTES)).toBe(true)
    expect(matchesRoute("/signup", AUTH_ROUTES)).toBe(true)
    expect(matchesRoute("/forgot-password", AUTH_ROUTES)).toBe(true)
    expect(matchesRoute("/reset-password", AUTH_ROUTES)).toBe(false)
  })
})
