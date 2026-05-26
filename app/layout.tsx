import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HuntMode — ECE Internship Engine",
  description: "Personal internship engine for Ann Moni George · Singapore · ECE · Jan 2027",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
