type Props = {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn" | "danger";
  hint?: string;
};

export function MetricCard({ label, value, tone = "default", hint }: Props) {
  const accentClass =
    tone === "good" ? "pill good" : tone === "warn" ? "pill warn" : tone === "danger" ? "pill danger" : "pill";
  return (
    <div className="stat-card">
      <div className="row">
        <div className="stat-label">{label}</div>
        {hint ? <span className={accentClass}>{hint}</span> : null}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

