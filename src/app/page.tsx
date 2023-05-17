import { redirectToDashboardOrLogin } from "./_actions";
import "./globals.css";

export default async function Home() {
  await redirectToDashboardOrLogin();
}
