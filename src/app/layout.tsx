import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zaryan",
  description: "Finance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="dark"
        suppressHydrationWarning
        style={{
          colorScheme: "dark",
        }}
      >
        <body
          className={`${inter.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <Toaster richColors position="bottom-right" />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
