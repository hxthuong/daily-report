import React from "react";

export type Option = {
  id: string | number;
  label: string;
  icon?: string | React.ReactNode;
  padding?: number;
  bold?: boolean;
  children?: Option[];
  type?: string;
};

export type DropdownProps = {
  options: Option[];
  placeholder?: string;
  className?: string;
  onSelect?: (value: Option | Option[]) => void;
  width?: number;
  hasSearch?: boolean;
  value?: string | number | string[] | number[]; // <-- defaultValue là id
  zIndex?: number;
  disabled?: boolean;
  multiple?: boolean;
};
