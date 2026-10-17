// Fine-line icons, one 1.6px stroke weight across the set.
type Props = { className?: string };

const base = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ArrowUpRight = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

export const ArrowDown = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </svg>
);

export const ArrowUp = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M8 13V3M4 7l4-4 4 4" />
  </svg>
);

export const ChevronRight = ({ className }: Props) => (
  <svg {...base} viewBox="0 0 12 12" strokeWidth={1.6} className={className}>
    <path d="M4.5 2.5 8 6l-3.5 3.5" />
  </svg>
);
