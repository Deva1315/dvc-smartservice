export type SessionUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type AuthTokenPayload = {
  sub: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
  iat?: number;
  exp?: number;
};