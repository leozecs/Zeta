import type { Metadata } from "next";
import { EntryPage } from "./entry-page";

export const metadata: Metadata = {
  title: "Entrar ou criar conta",
  description: "Tela visual para entrar ou criar uma conta na Zeta.",
};

export default function Page() {
  return <EntryPage />;
}
