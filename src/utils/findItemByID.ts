import { MenuProps } from "@/types/menu";

export default function findItemByID(
  menu: MenuProps[],
  id: string | number
): MenuProps | null {
  for (const item of menu) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemByID(item.children, id);
      if (found) return found;
    }
  }
  return null;
}
