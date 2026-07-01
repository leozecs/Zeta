import type { Metadata } from "next";
import { PaymentPage } from "./payment-page";

export const metadata: Metadata = {
  title: "Pagamento",
  description: "Checkout Zeta preparado para integração com Asaas.",
};

export default function Page() {
  return <PaymentPage />;
}
