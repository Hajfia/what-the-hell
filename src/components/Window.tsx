import type { ReactNode } from "react";

// A Windows 9x-style window: title bar plus a bordered body.
export function Window({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "alert";
  children: ReactNode;
}) {
  return (
    <section className={`window ${tone === "alert" ? "window-alert" : ""}`}>
      <div className="titlebar">{title}</div>
      <div className="window-body">{children}</div>
    </section>
  );
}
