import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  variant?: "default" | "success" | "error" | "warning";
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

function getVariantStyles(variant: string) {
  switch (variant) {
    case "success":
      return {
        border: "border-[#4ec9b0]",
        textColor: "text-[#4ec9b0]",
        bg: "bg-[#1f4620]",
      };
    case "error":
      return {
        border: "border-[#f48771]",
        textColor: "text-[#f48771]",
        bg: "bg-[#4a1a1a]",
      };
    case "warning":
      return {
        border: "border-[#cca700]",
        textColor: "text-[#cca700]",
        bg: "bg-[#2d2416]",
      };
    case "default":
    default:
      return {
        border: "border-[#3e3e42]",
        textColor: "text-[#3794ff]",
        bg: "bg-[#1e1f2b]",
      };
  }
}

export function StatsCard({
  title,
  value,
  icon,
  variant = "default",
  subtitle,
  trend,
}: StatsCardProps) {
  const styles = getVariantStyles(variant);

  return (
    <div
      className={`flex flex-col p-4 rounded border ${styles.border} ${styles.bg} hover:border-[#505052] transition-colors`}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#cccccc]">{title}</span>
        {icon && <div className={styles.textColor}>{icon}</div>}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${styles.textColor}`}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.direction === "up" ? "text-[#4ec9b0]" : "text-[#f48771]"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span className="text-xs text-[#858585] mt-2">{subtitle}</span>
      )}
    </div>
  );
}
