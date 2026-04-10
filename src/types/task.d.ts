export type Task = {
  id: string; // uniqueidentifier
  userid: string;
  avatar?: string;
  workdate: string; // ISO date (yyyy-mm-dd)
  workat?: string | null;
  content: string;
  starttime?: string | null; // ISO datetime
  endtime?: string | null;
  workduration?: number | null; // computed (minutes)
  handlingdirection?: string | null;
  status?: string | null;
  createdby?: string | null;
  createdat?: string | null;
  modifiedby?: string | null;
  updatedat?: string | null;
  isdeleted?: boolean | null;
  deletedby?: string | null;
  deletedat?: string | null;
  fullname?: string;
};
