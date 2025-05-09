import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", workSans.variable)}>
        <ThemeProvider>
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
