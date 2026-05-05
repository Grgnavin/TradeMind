import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeMind | AI Journal",
  description: "Improve your trading performance with AI-powered insights and psychology coaching.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#050505] text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
