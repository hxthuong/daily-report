export type User = {
  id: string; // UUID
  username: string; // TEXT
  fullname: string; // TEXT
  email: string; // TEXT
  passwordhash: Uint8Array; // BYTEA
  role: string | null; // TEXT nullable
  roleid: number | null; // INT nullable
  role_description: string | null; // TEXT nullable (from join dr_roles)
  isactive: boolean | null; // BOOLEAN nullable
  avatar: string | null; // TEXT nullable
  createdby: string | null; // UUID nullable
  createdat: string; // TIMESTAMPTZ (ISO string)
  updatedat: string | null; // TIMESTAMPTZ nullable
};
