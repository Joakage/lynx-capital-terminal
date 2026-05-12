import { SubNav } from "@/components/layout/SubNav";

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SubNav
        items={[
          { href: "/research", label: "Ideas & Watchlist" },
          { href: "/research/sectors", label: "Sectores" },
        ]}
      />
      {children}
    </div>
  );
}
