import "./globals.css";
import { Inter } from "next/font/google";

import { DialogProvider } from "@/lib/client/DialogProvider";
import Providers from "@/lib/client/Providers";

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
    <Providers>
      <html lang="en" data-theme="dark">
        <body className={inter.className}>
          <DialogProvider>
            <main className="min-h-screen h-screen">{children}</main>
          </DialogProvider>
        </body>
      </html>
    </Providers>
  );
}

export const runtime = "edge";
