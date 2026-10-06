import type { ReactNode } from "react";
import { site } from "@/data/site";

type BtnProps = { href: string; children: ReactNode; className?: string };

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold leading-none transition-transform hover:-translate-y-0.5";

function Ext({ href, children, className }: BtnProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export function LineIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.6 1.6 4.9 4 6.4L5.5 21l4.1-2.3c.8.2 1.6.3 2.4.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
    </svg>
  );
}

export function LineButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Ext href={site.line} className={`${base} bg-line text-white shadow-[0_6px_0_#04913f] ${className}`}>
      <LineIcon />
      {children}
    </Ext>
  );
}

export function SignalButton({ href, children, className = "" }: BtnProps) {
  return (
    <Ext href={href} className={`${base} bg-signal text-ink shadow-[0_6px_0_#c99700] ${className}`}>
      {children}
    </Ext>
  );
}

export function GhostButton({ href, children, className = "" }: BtnProps) {
  const cls = `${base} border-2 border-ink text-ink ${className}`;
  return href.startsWith("http") ? (
    <Ext href={href} className={cls}>{children}</Ext>
  ) : (
    <a href={href} className={cls}>{children}</a>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-code text-2xl font-semibold tracking-[0.08em] ${className}`}>
      WAHONNECT<span className="text-signal">.</span>
    </span>
  );
}
