import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AUTH_SESSION_EXPIRES_IN } from "./auth.constants";
import type { AuthTokenPayload, SessionUser } from "./auth.types";

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET belum di-set di environment.");
  }

  return new TextEncoder().encode(jwtSecret);
}

function parseTokenPayload(payload: JWTPayload): AuthTokenPayload | null {
  const rawPayload = payload as JWTPayload & {
    nama?: unknown;
    email?: unknown;
    roleId?: unknown;
    roleName?: unknown;
    address?: unknown;
    phone?: unknown;
    photoProfilePath?: unknown;
  };

  if (
    typeof payload.sub !== "string" ||
    typeof rawPayload.nama !== "string" ||
    typeof rawPayload.email !== "string" ||
    typeof rawPayload.roleId !== "string" ||
    typeof rawPayload.roleName !== "string"
  ) {
    return null;
  }

  return {
    sub: payload.sub,
    nama: rawPayload.nama,
    email: rawPayload.email,
    roleId: rawPayload.roleId,
    roleName: rawPayload.roleName,
    address:
      rawPayload.address === null || typeof rawPayload.address === "string"
        ? rawPayload.address
        : null,
    phone:
      rawPayload.phone === null || typeof rawPayload.phone === "string"
        ? rawPayload.phone
        : null,
    photoProfilePath:
      rawPayload.photoProfilePath === null ||
      typeof rawPayload.photoProfilePath === "string"
        ? rawPayload.photoProfilePath
        : null,
    iat: payload.iat,
    exp: payload.exp,
  };
}

export async function signAuthToken(user: SessionUser) {
  return new SignJWT({
    nama: user.nama,
    email: user.email,
    roleId: user.roleId,
    roleName: user.roleName,
    address: user.address,
    phone: user.phone,
    photoProfilePath: user.photoProfilePath,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(AUTH_SESSION_EXPIRES_IN)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const parsed = parseTokenPayload(payload);

    if (!parsed) {
      return null;
    }

    return {
      id: parsed.sub,
      nama: parsed.nama,
      email: parsed.email,
      roleId: parsed.roleId,
      roleName: parsed.roleName,
      address: parsed.address,
      phone: parsed.phone,
      photoProfilePath: parsed.photoProfilePath,
    };
  } catch {
    return null;
  }
}