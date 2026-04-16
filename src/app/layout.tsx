import type { Metadata } from "next";
import { dmSans, dmSerif } from "./fonts";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Hood Studio | Homes, Crafted by Pros",
  description: "Book trusted service professionals or offer your skills as a provider in Hood Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className={`${dmSans.className} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
