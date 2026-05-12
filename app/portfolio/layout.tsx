import { SubNav } from "@/components/layout/SubNav";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SubNav
        items={[
          { href: "/portfolio", label: "Posiciones" },
          { href: "/portfolio/transactions", label: "Operaciones" },
          { href: "/portfolio/performance", label: "Performance" },
          { href: "/portfolio/exposures", label: "Exposiciones" },
        ]}
      />
      {children}
    </div>
  );
}
