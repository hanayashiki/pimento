import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { pipe } from "remeda";

import { MeProvider } from "@/lib/client/MeProvider";
import { Service } from "@/lib/server/Service";
import { UserService } from "@/lib/server/UserService";

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
  const me = await pipe(cookies().get("token"), (token) =>
    token?.value ? Service.get(UserService).getMeByToken(token.value) : null,
  );

  return (
    <MeProvider value={{ me }}>
      <html lang="en" data-theme="emerald">
        <body className={inter.className}>
          <main className="min-h-screen h-screen">{children}</main>
        </body>
      </html>
    </MeProvider>
  );
}
