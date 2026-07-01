export type ZetaPlan = {
  name: string;
  slug: string;
  value: number;
  description: string;
};

export const zetaPlans: ZetaPlan[] = [
  {
    name: "Zeta Site",
    slug: "zeta-site",
    value: 120,
    description: "Site institucional ou página de venda para publicar sua presença digital.",
  },
  {
    name: "Zeta CRM",
    slug: "zeta-crm",
    value: 159,
    description: "CRM sob medida para organizar contatos, leads e rotina comercial.",
  },
  {
    name: "Zeta OS",
    slug: "zeta-os",
    value: 229,
    description: "Sistema operacional web para estruturar atendimento, agenda e processos.",
  },
  {
    name: "Tudo junto",
    slug: "tudo-junto",
    value: 469.99,
    description: "Site, CRM e operação digital em um pacote completo.",
  },
];

export function findZetaPlan(planName?: string | null) {
  return (
    zetaPlans.find((plan) => plan.name === planName || plan.slug === planName) ?? zetaPlans[0]
  );
}
