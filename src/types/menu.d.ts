// export type MenuProps = {
//   id: string;
//   name: string;
//   href: string;
//   visible?: boolean;
//   level?: number;
//   children?: MenuProps[] | [];
//   allowedIds?: string[];
//   hasChildren?: boolean; // có children tiềm năng
//   loaded?: boolean; // đã fetch children chưa
// };

import { NewsProps } from "./news";

export type MenuProps = {
  id: string;
  name: string;
  href: string;
  level?: number;
  icon?: React.ReactNode;
  image?: string;
  type?: string;
  children?: MenuProps[];
};

export type MenuNewsProps = NewsProps & {
  href: string;
  level?: number;
  children?: MenuNewsProps[];
  type?: string;
};
