import { useState, useEffect } from "react";

export function useScreen() {
  const [screen, setScreen] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setScreen({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize(); // set initial value

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screen;
}
