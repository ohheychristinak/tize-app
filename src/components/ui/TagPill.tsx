import { Tag } from "@/lib/types";

export default function TagPill({ tag }: { tag: Tag | undefined }) {
  if (!tag) return null;
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0"
      style={{
        color: tag.color,
        background: tag.bg,
        border: `1px solid ${tag.border}`,
        borderRadius: 4,
        padding: "1px 6px",
        letterSpacing: ".05em",
      }}
    >
      {tag.label}
    </span>
  );
}
