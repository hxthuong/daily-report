"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type HeaderState = {
  image?: string;
  images?: string[] | [];
  imageHeight?: number;
  title?: string;
  size?: number;
  description?: string;
  children?: ReactNode;
};

type HeaderContextType = HeaderState & {
  setHeader: (header: HeaderState) => void;
};

const defaultHeader: HeaderState = {
  image: "/images/bg.jpg",
  images: [],
  imageHeight: 500,
  title: "",
  size: 36,
  description: "",
  children: null,
};

export const HeaderContext = createContext<HeaderContextType>({
  ...defaultHeader,
  setHeader: () => {},
});

export const useHeader = () => useContext(HeaderContext);

export default function HeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<HeaderState>(defaultHeader);

  return (
    <HeaderContext.Provider value={{ ...header, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}
