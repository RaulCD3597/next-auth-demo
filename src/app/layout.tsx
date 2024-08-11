import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "next-auth demo",
  description: "Learn next-auth basics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "dark flex flex-col h-screen bg-background",
          inter.className,
        )}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex justify-center items-start p-6 flex-grow">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
