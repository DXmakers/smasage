import type { ElementType, HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
}

export function Card({
  as: Component = "section",
  children,
  className,
  ...props
}: CardProps) {
  const classes = ["bento-card", className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
