export default function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span style={{ color: 'rgba(255,255,255,.55)', fontSize: 11 }}>{label}</span>
      <strong>
        {payload[0].value}
        {suffix}
      </strong>
    </div>
  );
}
