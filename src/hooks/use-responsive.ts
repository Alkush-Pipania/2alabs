"use client";

import { useState, useEffect } from "react";

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowSize.width < 768; // md breakpoint
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024; // lg breakpoint  
  const isDesktop = windowSize.width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: windowSize.width,
  };
}
