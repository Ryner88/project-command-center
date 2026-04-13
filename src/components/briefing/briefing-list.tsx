import type { BriefingItem } from "@/types/briefing";

export function BriefingList({ items }: { items: BriefingItem[] }) {
  return (
    <div className="list">
      {items.map((item) => (
        <div className="card" key={item.id}>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <span className="pill">{item.source}</span>
        </div>
      ))}
    </div>
  );
}
