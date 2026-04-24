import bcrypt from "bcryptjs";
import type { SessionUser } from "./auth.types";

type DbUser = {
  id: bigint;
  id_roles: bigint;
  nama: string;
  email: string;
  password: string;
  address: string | null;
  phone: string | null;
  photo_profile_path: string | null;
  roles: {
    id: bigint;
    nama_roles: string;
  };
};

export function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function verifyPassword(
  plainPassword: string,
  storedPassword: string
) {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
}

export function sanitizeSessionPhotoProfilePath(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("data:image")) {
    return null;
  }

  return value;
}

export function mapDbUserToSessionUser(user: DbUser): SessionUser {
  return {
    id: user.id.toString(),
    nama: user.nama,
    email: user.email,
    roleId: user.roles.id.toString(),
    roleName: user.roles.nama_roles,
    address: user.address,
    phone: user.phone,
    photoProfilePath: sanitizeSessionPhotoProfilePath(
      user.photo_profile_path
    ),
  };
}