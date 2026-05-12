import { kpis } from "@/lib/mock-data";
import { fmtMoney, fmtPct, pnlColor } from "@/lib/utils";

export function Header() {
  return (
    <header className="border-b border-border bg-bg-elevated">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">NAV</span>
            <span className="numeric font-semibold">{fmtMoney(kpis.navCurrent)}</span>
          </div>
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">Día</span>
            <span className={`numeric font-semibold ${pnlColor(kpis.dailyReturnPct)}`}>{fmtPct(kpis.dailyReturnPct)}</span>
          </div>
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">MTD</span>
            <span className={`numeric font-semibold ${pnlColor(kpis.mtdPct)}`}>{fmtPct(kpis.mtdPct)}</span>
          </div>
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">YTD</span>
            <span className={`numeric font-semibold ${pnlColor(kpis.ytdPct)}`}>{fmtPct(kpis.ytdPct)}</span>
          </div>
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">α YTD</span>
            <span className={`numeric font-semibold ${pnlColor(kpis.alphaYtdPct)}`}>{fmtPct(kpis.alphaYtdPct)}</span>
          </div>
          <div className="text-sm">
            <span className="text-fg-muted text-2xs uppercase tracking-wide mr-2">Cash</span>
            <span className="numeric font-semibold">{fmtPct(kpis.cashPct).replace("+", "")}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-border bg-bg-panel text-xs text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-pos animate-pulse" />
            Markets · live (mock)
          </div>
          <div className="h-7 w-7 rounded-full bg-bg-hover text-fg flex items-center justify-center text-xs font-medium">PM</div>
        </div>
      </div>
    </header>
  );
}
