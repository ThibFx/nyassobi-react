import { CheckCircle, ShieldCheck, UserCirclePlus } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";

import { membershipOpenQuery, MembershipUnavailable, submitMembership, useFees, useSettings } from "@/lib/content";
import { Nybi } from "@/nybi/Nybi";
import { ButtonLink, buttonClass, SmartLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { Checkbox, FormStatus, TextField } from "@/ui/Field";

import { ParentalUpload, readAsBase64 } from "./ParentalUpload";

const EMPTY = {
  pseudo: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  discordUsername: "",
  reducedRate: false,
  acceptsRules: false,
  acceptsPrivacy: false,
  website: "",
};
type Values = typeof EMPTY;
type Errors = Partial<Record<keyof Values | "parental", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Âge à la date du jour, à partir d'une date AAAA-MM-JJ. */
export function ageOn(birthDate: string, today = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age;
}

export function validateMembership(values: Values, parental: File | null = null): Errors {
  const errors: Errors = {};
  if (!values.pseudo.trim()) errors.pseudo = "Indique ton pseudo.";
  if (!values.firstName.trim()) errors.firstName = "Indique ton prénom.";
  if (!values.lastName.trim()) errors.lastName = "Indique ton nom.";
  const age = ageOn(values.birthDate);
  if (age === null) errors.birthDate = "Indique ta date de naissance.";
  else if (age < 0 || age > 120) errors.birthDate = "Cette date ne semble pas juste.";
  if (!EMAIL.test(values.email.trim())) errors.email = "Cette adresse e-mail ne semble pas valide.";
  const discord = values.discordUsername.trim().replace(/^@/, "").toLowerCase();
  if (discord && !/^[a-z0-9_.]{2,32}$/.test(discord)) errors.discordUsername = "Un pseudo Discord ne contient que des lettres, des chiffres, des points et des tirets bas.";
  if (age !== null && age >= 0 && age < 18 && !parental) errors.parental = "Joins l'autorisation parentale signée.";
  if (!values.acceptsRules) errors.acceptsRules = "Il faut avoir lu les statuts et le règlement.";
  if (!values.acceptsPrivacy) errors.acceptsPrivacy = "Il faut accepter le traitement de tes données pour adhérer.";
  return errors;
}

/**
 * Demande d'adhésion. La demande part au WordPress de l'association, qui la
 * soumet au vote du conseil d'administration sur Discord. Le CA ne voit que le
 * pseudo : l'identité civile reste dans l'administration, réservée au bureau.
 */
export function MembershipForm() {
  const settings = useSettings();
  const fees = useFees();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [parental, setParental] = useState<File | null>(null);
  const open = useQuery(membershipOpenQuery);
  const mutation = useMutation({ mutationFn: submitMembership });
  const age = ageOn(values.birthDate);
  const minor = age !== null && age >= 0 && age < 18;

  const set = <K extends keyof Values>(name: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const text = (name: "pseudo" | "firstName" | "lastName" | "birthDate" | "email" | "discordUsername") => ({
    name,
    value: values[name],
    onChange: (event: { target: { value: string } }) => set(name, event.target.value),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validateMembership(values, parental);
    setErrors(found);
    if (Object.keys(found).length) {
      // Après le rendu, pour que les champs portent déjà leur état d'erreur.
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    if (values.website) return;
    const { website: _website, ...input } = values;
    void _website;
    void (async () => {
      // Le document n'est lu qu'à l'envoi, et seulement pour un mineur.
      const parentalAuthorization = minor && parental ? { fileName: parental.name, mimeType: parental.type, base64: await readAsBase64(parental) } : null;
      mutation.mutate({
        ...input,
        pseudo: input.pseudo.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        discordUsername: input.discordUsername.trim().replace(/^@/, "").toLowerCase(),
        // Un mineur relève toujours du tarif réduit.
        reducedRate: input.reducedRate || minor,
        parentalAuthorization,
      });
    })();
  };

  if (mutation.isSuccess && mutation.data.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-[30px] bg-teal-wash px-6 py-10 text-center"
        role="status"
      >
        <Nybi pose="calin" size={150} motion="bounce" />
        <h3 className="font-display text-[28px] font-semibold text-ink">Demande envoyée !</h3>
        <p className="max-w-[46ch] text-ink-2">
          {mutation.data.message ||
            "Le conseil d'administration va étudier ta demande. Tu recevras un e-mail dès qu'il aura voté, avec la marche à suivre pour régler ta cotisation."}
        </p>
      </motion.div>
    );
  }

  if (open.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement du formulaire" className="grid gap-5">
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton h-[52px] w-full rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (open.data === false || mutation.error instanceof MembershipUnavailable) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[30px] bg-accent-wash px-6 py-8">
        <p className="text-ink">
          Les demandes d'adhésion passent encore par notre formulaire Framaforms le temps de finir la mise en place du nouveau circuit.
        </p>
        <ButtonLink to={settings.signupFormUrl} icon={<UserCirclePlus size={20} weight="fill" aria-hidden />}>
          Ouvrir le formulaire d'adhésion
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Demande d'adhésion" className="grid gap-6">
      <fieldset className="grid gap-5">
        <legend className="mb-4 font-display text-[21px] font-semibold text-ink">Qui es-tu ?</legend>
        <TextField
          label="Pseudo"
          autoComplete="nickname"
          hint="C'est le seul élément que le conseil d'administration verra pour voter."
          error={errors.pseudo}
          {...text("pseudo")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Prénom" autoComplete="given-name" error={errors.firstName} {...text("firstName")} />
          <TextField label="Nom" autoComplete="family-name" error={errors.lastName} {...text("lastName")} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Date de naissance" type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} error={errors.birthDate} {...text("birthDate")} />
          <TextField
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            hint="Pour te prévenir de la décision."
            error={errors.email}
            {...text("email")}
          />
        </div>
        <TextField
          label="Pseudo Discord"
          optional
          autoComplete="off"
          spellCheck={false}
          placeholder="ton_pseudo"
          hint="Pour recevoir le rôle « Adhérent » sur notre serveur dès ta cotisation réglée. Le CA ne le voit pas."
          error={errors.discordUsername}
          {...text("discordUsername")}
        />
      </fieldset>

      <AnimatePresence initial={false}>
        {minor && (
          <motion.fieldset initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <legend className="sr-only">Autorisation parentale</legend>
            <div className="grid gap-4 rounded-[22px] bg-teal-wash px-5 py-5">
              <p className="text-[15.5px] text-ink">
                Tu as moins de 18 ans : il faut l'accord d'un parent. Imprime{" "}
                <a href={settings.parentalAgreementUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-ink underline underline-offset-3">
                  l'autorisation parentale
                </a>
                , fais-la signer, puis joins-la ici (un scan ou une photo bien lisible). Le tarif réduit s'applique d'office.
              </p>
              <ParentalUpload
                file={parental}
                error={errors.parental}
                onChange={(file) => {
                  setParental(file);
                  if (errors.parental) setErrors((current) => ({ ...current, parental: undefined }));
                }}
              />
            </div>
          </motion.fieldset>
        )}
      </AnimatePresence>

      <fieldset className="grid gap-1">
        <legend className="mb-3 font-display text-[21px] font-semibold text-ink">Cotisation</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { reduced: false, price: `${fees.normal} €`, title: "Tarif normal", detail: "par an, du 1er septembre au 31 août" },
            { reduced: true, price: `${fees.reduced} €`, title: "Tarif réduit", detail: "mineur·e, étudiant·e, demandeur·deuse d'emploi, aides sociales" },
          ].map((option) => {
            const checked = (values.reducedRate || minor) === option.reduced;
            const disabled = minor && !option.reduced;
            return (
              <label
                key={option.title}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-[20px] px-5 py-4 transition-[background-color,box-shadow]",
                  checked ? "bg-accent-wash shadow-[inset_0_0_0_2px_var(--accent)]" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--accent)]",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="radio"
                  name="rate"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => set("reducedRate", option.reduced)}
                  className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-[26px] leading-none font-semibold text-ink">{option.price}</span>
                    <span className="font-display font-semibold text-ink-2">{option.title}</span>
                  </span>
                  <span className="mt-1 block text-[14px] text-ink-3">{option.detail}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-[14px] text-ink-3">Rien n'est à payer maintenant : le paiement vient après l'accord du conseil d'administration.</p>
      </fieldset>

      <div className="grid gap-1">
        <Checkbox
          checked={values.acceptsRules}
          onChange={(event) => set("acceptsRules", event.target.checked)}
          error={errors.acceptsRules}
          label={
            <>
              J'ai lu les{" "}
              <a href={settings.associationStatusUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-ink underline underline-offset-3">
                statuts
              </a>{" "}
              et le{" "}
              <a href={settings.internalRulesUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-ink underline underline-offset-3">
                règlement intérieur
              </a>
              , et je m'engage à les respecter.
            </>
          }
        />
        <Checkbox
          checked={values.acceptsPrivacy}
          onChange={(event) => set("acceptsPrivacy", event.target.checked)}
          error={errors.acceptsPrivacy}
          label={
            <>
              J'accepte que Nyassobi traite mes nom, prénom et date de naissance pour gérer mon adhésion, comme expliqué dans la{" "}
              <SmartLink to="/status-rgpd" className="font-medium text-accent-ink underline underline-offset-3">
                page RGPD
              </SmartLink>
              .
            </>
          }
        />
      </div>

      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => set("website", event.target.value)} />
        </label>
      </div>

      {mutation.isError && <FormStatus tone="bad">La demande n'est pas partie : {mutation.error.message} Réessaie dans un instant.</FormStatus>}
      {mutation.data && !mutation.data.success && <FormStatus tone="bad">{mutation.data.message}</FormStatus>}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className={buttonClass("primary")} disabled={mutation.isPending} aria-busy={mutation.isPending || undefined}>
          {mutation.isPending ? "Envoi…" : "Envoyer ma demande"}
          {!mutation.isPending && <CheckCircle size={20} weight="fill" aria-hidden />}
        </button>
        <p className="flex items-center gap-1.5 text-[14px] text-ink-3">
          <ShieldCheck size={17} weight="fill" aria-hidden className="text-teal" />
          Ton identité n'est visible que du bureau.
        </p>
      </div>
    </form>
  );
}
