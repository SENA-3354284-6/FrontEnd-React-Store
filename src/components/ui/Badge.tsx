import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type Tone = "default" | "success" | "danger" | "warning" | "info" | "primary";

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = "default", children }: BadgeProps) {
  return <span className={cn("badge", tone !== "default" && `badge-${tone}`)}>{children}</span>;
}
