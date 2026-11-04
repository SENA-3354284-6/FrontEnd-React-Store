import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={cn("card", className)}>{children}</div>;
}

interface CardHeaderProps {
  title?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, actions }: CardHeaderProps) {
  return (
    <div className="row-between" style={{ marginBottom: "0.75rem" }}>
      <h3 className="card-title mb-0">{title}</h3>
      {actions}
    </div>
  );
}
