import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type Variant = "error" | "success" | "info";

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
}

export function Alert({ variant = "info", children }: AlertProps) {
  return <div className={cn("alert", `alert-${variant}`)}>{children}</div>;
}
