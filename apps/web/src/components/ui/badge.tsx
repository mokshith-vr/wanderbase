import { cn } from "@/lib/utils";
import type { VisaType } from "@nomadly/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "primary";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variant === "success" && "bg-success/20 text-success border-success/30",
        variant === "warning" && "bg-warning/20 text-warning border-warning/30",
        variant === "danger" && "bg-danger/20 text-danger border-danger/30",
        variant === "primary" && "bg-primary/20 text-primary border-primary/30",
        variant === "neutral" && "bg-surface-2 text-text-secondary border-border",
        className
      )}
    >
      {children}
    </span>
  );
}

const VISA_BADGE_CONFIG: Record<VisaType, { label: string; variant: BadgeProps["variant"] }> = {
  visa_free: { label: "Visa Free", variant: "success" },
  visa_on_arrival: { label: "Visa on Arrival", variant: "warning" },
  evisa: { label: "e-Visa", variant: "warning" },
  visa_required: { label: "Visa Required", variant: "danger" },
};

export function VisaBadge({ type }: { type: VisaType }) {
  const config = VISA_BADGE_CONFIG[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
