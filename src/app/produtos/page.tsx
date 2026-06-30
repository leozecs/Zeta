import type { Metadata } from "next";
import { ProductsPage } from "./products-page";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Planos do Zeta para site, CRM, sistema web e pacote completo.",
};

export default function Page() {
  return <ProductsPage />;
}
