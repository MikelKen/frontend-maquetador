"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      className="group"
      duration={5000}
      toastOptions={{
        className: "toast-custom",
        style: {
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(96, 165, 250, 0.3)",
          borderRadius: "0.75rem",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          color: "white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
