import type { Metadata } from "next";
import { CreatePage } from "./create-page";

export const metadata: Metadata = {
  title: "Criar",
  description: "Escolha um produto Zeta e conte sobre o seu negócio.",
};

export default function Page() {
  return <CreatePage />;
}
