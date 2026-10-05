import { FileArrowUp, FilePdf, Image as ImageIcon, WarningCircle, X } from "@phosphor-icons/react";
import { useId, useRef, useState, type DragEvent } from "react";

import { cn } from "@/ui/cn";

export const PARENTAL_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Erreur à afficher pour ce fichier, ou null s'il convient. */
export function checkParentalFile(file: File): string | null {
  // Certains téléphones ne donnent pas de type aux photos HEIC : l'extension suffit alors.
  const typeOk = ACCEPTED.includes(file.type) || (!file.type && /\.(heic|heif)$/i.test(file.name));
  if (!typeOk) return "Formats acceptés : PDF ou photo (JPEG, PNG, WebP, HEIC).";
  if (file.size > PARENTAL_MAX_BYTES) return "Le fichier dépasse 5 Mo : une photo moins grande ou un PDF plus léger fera l'affaire.";
  if (file.size === 0) return "Ce fichier est vide.";
  return null;
}

export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

/**
 * Dépôt de l'autorisation parentale : on clique pour choisir (sur téléphone,
 * l'appareil photo est proposé) ou on glisse le fichier sur la zone.
 */
export function ParentalUpload({ file, error, onChange }: { file: File | null; error?: string; onChange: (file: File | null) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const shownError = localError ?? error;

  const take = (candidate: File | undefined) => {
    if (!candidate) return;
    const problem = checkParentalFile(candidate);
    setLocalError(problem);
    onChange(problem ? null : candidate);
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files[0]);
  };

  if (file) {
    const Icon = file.type === "application/pdf" ? FilePdf : ImageIcon;
    return (
      <div className="flex items-center gap-3 rounded-[16px] bg-surface px-4 py-3 shadow-[inset_0_0_0_1.5px_var(--teal)]">
        <Icon size={26} weight="duotone" aria-hidden className="shrink-0 text-teal-ink" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{file.name}</p>
          <p className="text-[13.5px] text-ink-3">{formatSize(file.size)} · prêt à être envoyé</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (input.current) input.current.value = "";
          }}
          aria-label="Retirer ce fichier"
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-bad-wash hover:text-bad"
        >
          <X size={18} weight="bold" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={input}
        id={id}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        aria-invalid={shownError ? true : undefined}
        aria-describedby={shownError ? `${id}-msg` : undefined}
        onChange={(event) => take(event.target.files?.[0])}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={cn(
          "flex min-h-[110px] peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent peer-focus-visible:outline-solid cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed px-4 py-5 text-center transition-colors",
          dragging ? "border-teal bg-surface" : "border-[color-mix(in_srgb,var(--teal)_45%,transparent)] bg-surface/60 hover:bg-surface",
          shownError && "border-bad",
        )}
      >
        <FileArrowUp size={30} weight="duotone" aria-hidden className="text-teal-ink" />
        <span className="font-display text-[16.5px] font-semibold text-ink">Joindre l'autorisation signée</span>
        <span className="text-[13.5px] text-ink-3">PDF ou photo, 5 Mo au plus</span>
      </label>
      {shownError && (
        <p id={`${id}-msg`} className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium text-bad">
          <WarningCircle size={16} weight="fill" aria-hidden />
          {shownError}
        </p>
      )}
    </div>
  );
}
