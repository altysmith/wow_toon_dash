import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "AltyLab WoW Companion",
  description: "A local prototype for planning and tracking WoW Forever characters.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
