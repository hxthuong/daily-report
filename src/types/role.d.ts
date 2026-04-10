type PermissionState = Record<
  string,
  {
    label: string;
    actions: Action[];
  }
>;

export type Role = {
  id?: number | null; // tương ứng p_id integer DEFAULT NULL
  rolename?: string | null; // tương ứng p_rolename text DEFAULT NULL
  description?: string | null; // tương ứng p_description text DEFAULT NULL
  permissions?: PermissionState | null;
  isactive?: boolean | null; // tương ứng p_isactive boolean DEFAULT NULL
};
