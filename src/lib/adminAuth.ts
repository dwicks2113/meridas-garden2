import { NextRequest } from "next/server";

/**
 * Server-side helper — call inside any API route that requires admin access.
 * Checks the x-admin-password header against the ADMIN_PASSWORD env variable.
 */
export function isAdmin(req: NextRequest): boolean {
  const pw = req.headers.get("x-admin-password");
  return !!pw && !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;
}
