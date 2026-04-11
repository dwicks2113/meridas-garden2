import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Merida's Garden | Zone 10b Plant Guide | Clearwater, FL",
  description: "Merida's Garden — a complete plant database, medicinal herb guide, and planting journal for USDA Zone 10b in Clearwater, Florida.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
