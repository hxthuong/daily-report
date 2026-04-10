import secureLocalStorage from "react-secure-storage";

// Lưu dữ liệu bình thường
export const saveData = <T extends string | number | boolean | object>(
  key: string,
  data: T
) => {
  secureLocalStorage.setItem(key, data);
};

// Lấy dữ liệu bình thường
export const loadData = <T extends string | number | boolean | object>(
  key: string
): T | null => {
  return secureLocalStorage.getItem(key) as T | null;
};

// Xóa dữ liệu
export const clearData = (key: string) => {
  secureLocalStorage.removeItem(key);
};

/**
 * Lưu dữ liệu kèm thời hạn (TTL)
 * @param key khóa
 * @param data dữ liệu
 * @param ttlSeconds thời hạn (giây)
 */
export const saveDataWithTTL = <T extends string | number | boolean | object>(
  key: string,
  data: T,
  ttlSeconds: number
) => {
  const item = {
    data,
    expiry: Date.now() + ttlSeconds * 1000, // thời gian hết hạn
  };
  secureLocalStorage.setItem(key, item);
};

/**
 * Lấy dữ liệu có TTL
 * Nếu hết hạn sẽ tự xóa và trả về null
 */
export const loadDataWithTTL = <T extends string | number | boolean | object>(
  key: string
): T | null => {
  const item = secureLocalStorage.getItem(key) as {
    data: T;
    expiry: number;
  } | null;

  if (!item) return null;

  if (Date.now() > item.expiry) {
    secureLocalStorage.removeItem(key);
    return null;
  }

  return item.data;
};
