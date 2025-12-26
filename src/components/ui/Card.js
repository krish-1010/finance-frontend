import { cn } from "@/lib/utils";

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white text-slate-950 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, title, description }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      <h3 className="text-lg font-semibold leading-none tracking-tight">
        {title}
      </h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
