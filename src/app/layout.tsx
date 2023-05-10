import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pimento",
  description: "Simple Password Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="emerald">
      <body className={inter.className}>
        <main className="min-h-screen h-screen">{children}</main>
      </body>
    </html>
  );
}
