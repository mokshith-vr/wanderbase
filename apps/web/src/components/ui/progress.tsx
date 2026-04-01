import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
}

export function Progress({ value, className, color = "primary", showLabel, label }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-text-muted">
          {label && <span>{label}</span>}
          {showLabel && <span>{clampedValue}%</span>}
        </div>
      )}
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color === "primary" && "bg-primary",
            color === "success" && "bg-success",
            color === "warning" && "bg-warning",
            color === "danger" && "bg-danger"
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
