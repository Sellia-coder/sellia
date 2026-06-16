import { SELLIA_NUM_CLASS } from "@/lib/format-num";

export default function SelliaNum({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`${SELLIA_NUM_CLASS}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
