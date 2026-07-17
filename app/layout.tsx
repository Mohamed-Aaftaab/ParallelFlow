import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParallelFlow - Monad Workflow Builder",
  description: "Automate Monad Workflows in 1 Second",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
