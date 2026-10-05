import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { sendContactMessage } from "@/lib/content";
import { buttonClass } from "@/ui/Button";
import { FormStatus, TextArea, TextField } from "@/ui/Field";

const EMPTY = { fullname: "", email: "", subject: "", message: "", website: "" };
type Values = typeof EMPTY;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.fullname.trim()) errors.fullname = "Indique ton nom ou ton pseudo.";
  if (!EMAIL.test(values.email.trim())) errors.email = "Cette adresse e-mail ne semble pas valide.";
  if (!values.subject.trim()) errors.subject = "Donne un objet à ton message.";
  if (values.message.trim().length < 10) errors.message = "Ton message est un peu court.";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const mutation = useMutation({ mutationFn: sendContactMessage });

  const bind = (name: keyof Values) => ({
    name,
    value: values[name],
    onChange: (event: { target: { value: string } }) => {
      setValues((current) => ({ ...current, [name]: event.target.value }));
      if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      // Après le rendu, pour que les champs portent déjà leur état d'erreur.
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    // Champ piège invisible : seul un robot le remplit. On fait mine d'envoyer.
    if (values.website) {
      setValues(EMPTY);
      return;
    }
    const { website: _website, ...input } = values;
    void _website;
    mutation.mutate(
      { fullname: input.fullname.trim(), email: input.email.trim(), subject: input.subject.trim(), message: input.message.trim() },
      { onSuccess: (result) => result.success && setValues(EMPTY) },
    );
  };

  const result = mutation.data;

  return (
    <form onSubmit={submit} noValidate className="not-prose my-6 grid gap-5" aria-label="Formulaire de contact">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom ou pseudo" autoComplete="name" error={errors.fullname} {...bind("fullname")} />
        <TextField label="E-mail" type="email" autoComplete="email" inputMode="email" error={errors.email} {...bind("email")} />
      </div>
      <TextField label="Objet" error={errors.subject} {...bind("subject")} />
      <TextArea label="Message" error={errors.message} {...bind("message")} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" {...bind("website")} />
        </label>
      </div>
      {mutation.isError && <FormStatus tone="bad">Le message n'est pas parti : {mutation.error.message} Réessaie dans un instant.</FormStatus>}
      {result && <FormStatus tone={result.success ? "good" : "bad"}>{result.message || (result.success ? "Merci, ton message est bien parti !" : "Le message n'est pas parti.")}</FormStatus>}
      <div>
        <button type="submit" className={buttonClass("primary")} disabled={mutation.isPending} aria-busy={mutation.isPending || undefined}>
          <PaperPlaneTilt size={19} weight="fill" aria-hidden />
          {mutation.isPending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}
