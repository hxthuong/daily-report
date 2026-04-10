export type File = {
  id?: string; // uniqueidentifier
  filename?: string;
  filetype?: string | null;
  filesize?: number | null; // bigint -> number (hoặc string nếu rất lớn)
  filepath: string;
  description?: string | null;
  referenceid?: string | null;
  tablename?: string | null;
  createdat?: string | null; // datetime -> ISO string
};

export type FileUpload = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
};
