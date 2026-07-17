import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Quotely — Professional Project Quoting",
  description:
    "Get an instant, accurate quote for your next project. Build hand-crafted proposals in minutes.",
  icons: {
    icon: "/brand/quotely-mark.png",
    apple: "/brand/quotely-mark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
