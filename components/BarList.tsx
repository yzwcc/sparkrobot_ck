type Item = { label: string; value: number };

export function BarList({ items, max = Math.max(...items.map((item) => item.value), 1) }: { items: Item[]; max?: number }) {
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div key={item.label} className="bar-item">
          <div className="small">{item.label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <div className="small muted">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

