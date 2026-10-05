import { WarningCircle } from "@phosphor-icons/react";
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

import { cn } from "./cn";

const CONTROL =
  "w-full rounded-[16px] bg-surface px-4 text-[16px] text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)] outline-none transition-shadow placeholder:text-ink-3 hover:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_45%,var(--line-strong))] focus:shadow-[inset_0_0_0_2px_var(--accent),0_0_0_5px_var(--accent-wash)] aria-invalid:shadow-[inset_0_0_0_2px_var(--bad)]";

interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
}

function Shell({ id, label, hint, error, optional, className, children }: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 font-display text-[16px] font-semibold text-ink">
        {label}
        {optional && <span className="font-sans text-[13.5px] font-normal text-ink-3">facultatif</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium text-bad">
          <WarningCircle size={16} weight="fill" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="mt-1.5 text-[14px] text-ink-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function TextField({ label, hint, error, optional, className, ...input }: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(CONTROL, "h-[52px]")}
        {...input}
      />
    </Shell>
  );
}

export function TextArea({ label, hint, error, optional, className, ...input }: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(CONTROL, "min-h-[150px] resize-y py-3.5 leading-relaxed")}
        {...input}
      />
    </Shell>
  );
}

/** Case à cocher ronde à l'orange de la marque, sur une cible de 44 px. */
export function Checkbox({ label, error, className, ...input }: { label: ReactNode; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[15.5px] text-ink-2">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          className="mt-0.5 size-[22px] shrink-0 cursor-pointer appearance-none rounded-[7px] bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-[background-color,box-shadow] checked:bg-accent checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222.2%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] checked:shadow-none aria-invalid:shadow-[inset_0_0_0_2px_var(--bad)]"
          {...input}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-msg`} className="mt-1 ml-[34px] flex items-center gap-1.5 text-[14px] font-medium text-bad">
          <WarningCircle size={16} weight="fill" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** Message de résultat d'un envoi, annoncé aux lecteurs d'écran. */
export function FormStatus({ tone, children }: { tone: "good" | "bad"; children: ReactNode }) {
  return (
    <p role={tone === "bad" ? "alert" : "status"} className={cn("rounded-[16px] px-4 py-3 text-[15.5px] font-medium", tone === "good" ? "bg-good-wash text-good" : "bg-bad-wash text-bad")}>
      {children}
    </p>
  );
}
