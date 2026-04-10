// loại bỏ dấu, chuẩn hóa Unicode, trim khoảng trắng
export const normalizeText = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // loại bỏ các dấu
    .replace(/\s+/g, " ") // chuẩn hóa khoảng trắng
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9.-]/g, "_") // ký tự lạ -> _
    .toLowerCase();
