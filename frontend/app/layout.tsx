import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecurDI",
  description: "Your holistic Identity Security partner",
};

/**
 * Root layout component for the entire application
 * Provides dark theme by default and global styles
 *
 * @param children - Child components to render
 * @returns Root HTML structure with dark theme enabled
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-securdi-dark-bg text-securdi-text-light">
        {children}
      </body>
    </html>
  );
}
