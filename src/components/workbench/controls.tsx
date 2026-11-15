"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Section(props: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{props.title}</h3>
        {props.action}
      </header>
      {props.children}
    </section>
  );
}

export function Field(props: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1 text-xs text-muted-foreground", props.className)}>
      {props.label}
      {props.children}
    </label>
  );
}

export function Choice(props: {
  value: string;
  options: (string | { value: string; label: string })[];
  onChange: (value: string) => void;
  disabled?: boolean;
  empty?: string;
  label?: string;
}) {
  return (
    <select
      aria-label={props.label}
      className="h-10 w-full min-w-0 rounded-md border bg-background px-2 text-sm text-foreground disabled:opacity-60"
      value={props.value}
      disabled={props.disabled}
      onChange={(event) => props.onChange(event.target.value)}
    >
      {props.empty !== undefined && <option value="">{props.empty}</option>}
      {props.options.map((option) => {
        const { value, label } = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

/** A text input that commits on blur or Enter, so half-typed names are never applied. */
export function Text(props: {
  value: string;
  onCommit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Input
      key={props.value}
      aria-label={props.label}
      className={cn("h-10 min-w-0", props.className)}
      defaultValue={props.value}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onBlur={(event) => event.target.value !== props.value && props.onCommit(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && (event.target as HTMLInputElement).blur()}
    />
  );
}

export function Act(props: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  title?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={props.variant ?? "outline"}
      className={cn("h-10 px-3", props.className)}
      disabled={props.disabled}
      title={props.title}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

const TONES: Record<string, string> = {
  holds: "bg-emerald-100 text-emerald-900",
  active: "bg-emerald-100 text-emerald-900",
  added: "bg-emerald-100 text-emerald-900",
  broken: "bg-red-100 text-red-900",
  ambiguous: "bg-red-100 text-red-900",
  high: "bg-red-100 text-red-900",
  removed: "bg-red-100 text-red-900",
  suspended: "bg-red-100 text-red-900",
  missing: "bg-amber-100 text-amber-900",
  medium: "bg-amber-100 text-amber-900",
  modified: "bg-amber-100 text-amber-900",
  scoped: "bg-amber-100 text-amber-900",
  "last-valid": "bg-amber-100 text-amber-900",
  pending: "bg-slate-200 text-slate-800",
  low: "bg-slate-200 text-slate-800",
};

export function Tone(props: { value: string; children?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[props.value] ?? "bg-slate-100 text-slate-800",
      )}
    >
      {props.children ?? props.value}
    </span>
  );
}

export function Code(props: { children: ReactNode }) {
  return <code className="break-all rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">{props.children}</code>;
}
