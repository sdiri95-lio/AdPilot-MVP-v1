import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdPilot Africa | COD Business Intelligence OS",
  description: "AI-driven operational system for African Cash-on-Delivery e-commerce entrepreneurs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen text-foreground bg-background">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
