"use client";
import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <>
      <Button
        variant="outline"
        className="dark:hidden cursor-pointer"
        size="icon"
        onClick={() => setTheme("dark")}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      </Button>
      <Button
        variant="outline"
        className="hidden dark:flex cursor-pointer"
        size="icon"
        onClick={() => setTheme("light")}
      >
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </>
  );
};

export default ModeToggle;
