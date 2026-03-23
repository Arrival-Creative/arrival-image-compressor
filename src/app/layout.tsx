import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Image Machine | Arrival Creative",
  description: "Compress and resize images in one step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-[#31070d] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}