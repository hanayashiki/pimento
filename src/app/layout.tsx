import "./globals.css";
import { Inter } from "next/font/google";

import { getUser } from "./_actions";
import { MeProvider } from "@/lib/client/MeProvider";
import Providers from "@/lib/client/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pimento",
  description: "Simple Password Manager",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getUser();

  return (
    <Providers>
      <MeProvider value={{ me }}>
        <html lang="en" data-theme="dark">
          <body className={inter.className}>
            <main className="min-h-screen h-screen">{children}</main>
          </body>
        </html>
      </MeProvider>
    </Providers>
  );
}
