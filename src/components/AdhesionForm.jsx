import { useCallback, useId, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";

import styles from "./AdhesionForm.module.scss";
import AdhesionSteps from "./AdhesionSteps";
import { useNyassobiSettings } from "../hooks/useNyassobiSettings";
import { SUBMIT_MEMBERSHIP, writeContext } from "../api/nyassobiMembership";
import { checkParentalFile, isMinor, normaliseDiscord, readAsBase64, validateMembership } from "../api/adhesion";

const initialValues = {
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

function Field({ id, label, optional = false, hint, error, children }) {
  return (
    <div className={styles.formField}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (facultatif)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Demande d'adhésion. Elle part au WordPress de l'association, qui la soumet
 * au vote du conseil d'administration sur Discord : le CA n'y voit que le
 * pseudo, l'identité reste réservée au bureau.
 */
function AdhesionForm({ fees, discordJoin = false }) {
  const { settings } = useNyassobiSettings();
  const ids = useId();
  const fileInput = useRef(null);
  const [values, setValues] = useState(initialValues);
  const [parental, setParental] = useState(null);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [submitMembership, { loading }] = useMutation(SUBMIT_MEMBERSHIP, { context: writeContext });

  const minor = isMinor(values.birthDate);
  const id = (name) => `${ids}-${name}`;

  const update = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const field = (name) => ({
    id: id(name),
    name,
    value: values[name],
    onChange: (event) => update(name, event.target.value),
    className: styles.input,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": `${id(name)}-msg`,
  });

  const chooseFile = (file) => {
    if (!file) return;
    const problem = checkParentalFile(file);
    setParental(problem ? null : file);
    setErrors((current) => ({ ...current, parental: problem ?? undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validateMembership(values, parental);
    setErrors(found);
    setResult(null);
    if (Object.keys(found).length > 0) {
      // Après l'affichage des erreurs, pour que le champ porte déjà son état.
      requestAnimationFrame(() => form.querySelector("[aria-invalid=true]")?.focus());
      return;
    }
    // Champ piège invisible : seul un robot le remplit.
    if (values.website) return;

    try {
      const parentalAuthorization =
        minor && parental ? { fileName: parental.name, mimeType: parental.type, base64: await readAsBase64(parental) } : null;
      const { data } = await submitMembership({
        variables: {
          input: {
            pseudo: values.pseudo.trim(),
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            birthDate: values.birthDate,
            email: values.email.trim(),
            discordUsername: normaliseDiscord(values.discordUsername),
            // Un mineur relève toujours du tarif réduit.
            reducedRate: values.reducedRate || minor,
            acceptsRules: values.acceptsRules,
            acceptsPrivacy: values.acceptsPrivacy,
            parentalAuthorization,
          },
        },
      });
      const response = data?.submitNyassobiMembership;
      setResult({ success: Boolean(response?.success), message: response?.message ?? "" });
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "La demande n'a pas pu être envoyée." });
    }
  };

  if (result?.success) {
    return (
      <>
        <div className={styles.success} role="status">
          <p className={styles.successTitle}>Demande envoyée !</p>
          <p>
            {result.message ||
              "Le conseil d'administration va étudier ta demande. Tu recevras sa réponse par e-mail, puis le lien pour régler ta cotisation. Un e-mail de confirmation vient de partir : s'il n'est pas dans ta boîte de réception, regarde dans tes spams et ajoute notre adresse à tes contacts, pour ne pas rater la suite."}
          </p>
        </div>
        <AdhesionSteps current={1} title="Et maintenant" />
      </>
    );
  }

  return (
    <>
      <AdhesionSteps />
      <form className={styles.adhesionForm} onSubmit={handleSubmit} noValidate aria-label="Demande d'adhésion">
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Qui es-tu ?</legend>
          <Field
            id={id("pseudo")}
            label="Pseudo"
            hint="C'est le seul élément que le conseil d'administration verra pour voter, et le nom avec lequel on t'écrira."
            error={errors.pseudo}
          >
            <input type="text" autoComplete="nickname" placeholder="Nyasso Bichon" {...field("pseudo")} />
          </Field>

          <div className={styles.row}>
            <Field id={id("firstName")} label="Prénom" error={errors.firstName}>
              <input type="text" autoComplete="given-name" {...field("firstName")} />
            </Field>
            <Field id={id("lastName")} label="Nom" error={errors.lastName}>
              <input type="text" autoComplete="family-name" {...field("lastName")} />
            </Field>
          </div>

          <div className={styles.row}>
            <Field id={id("birthDate")} label="Date de naissance" error={errors.birthDate}>
              <input type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} {...field("birthDate")} />
            </Field>
            <Field id={id("email")} label="Adresse e-mail" hint="Pour te prévenir de la décision." error={errors.email}>
              <input type="email" inputMode="email" autoComplete="email" placeholder="vous@example.com" {...field("email")} />
            </Field>
          </div>

          {/* Avec le lien « Rejoindre le Discord » envoyé après le paiement, c'est
          Discord qui dit qui rejoint : inutile de demander le pseudo. */}
          {!discordJoin && (
            <Field
              id={id("discordUsername")}
              label="Pseudo Discord"
              optional
              hint="Pour recevoir le rôle « Adhérent » sur notre serveur dès ta cotisation réglée. Le CA ne le voit pas."
              error={errors.discordUsername}
            >
              <input type="text" autoComplete="off" spellCheck={false} placeholder="ton_pseudo" {...field("discordUsername")} />
            </Field>
          )}

          {minor && (
            <div className={styles.parental}>
              <p>
                Tu as moins de 18 ans : il faut l'accord d'un parent. Imprime{" "}
                <a href={settings.parentalAgreementUrl} target="_blank" rel="noopener noreferrer">
                  l'autorisation parentale
                </a>
                , fais-la signer, puis joins-la ici (un scan ou une photo bien lisible). Le tarif réduit s'applique d'office.
              </p>
              {parental ? (
                <div className={styles.fileChosen}>
                  <span>
                    {parental.name} · {Math.max(1, Math.round(parental.size / 1024))} Ko
                  </span>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => {
                      setParental(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <div className={styles.formField}>
                  <label htmlFor={id("parental")} className={styles.label}>
                    Autorisation parentale signée
                  </label>
                  <input
                    ref={fileInput}
                    id={id("parental")}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    className={styles.fileInput}
                    aria-invalid={errors.parental ? true : undefined}
                    aria-describedby={`${id("parental")}-msg`}
                    onChange={(event) => chooseFile(event.target.files?.[0])}
                  />
                  <p id={`${id("parental")}-msg`} className={errors.parental ? styles.error : styles.hint}>
                    {errors.parental ?? "PDF ou photo, 5 Mo au plus."}
                  </p>
                </div>
              )}
            </div>
          )}

          <p className={styles.privacy}>
            <span aria-hidden="true">🔒</span> Ton nom, ton prénom et ta date de naissance ne sont vus que par le bureau, et gardés chiffrés. Le CA
            vote en ne voyant que ton pseudo.
          </p>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Ta cotisation</legend>
          <p className={styles.hint}>
            Valable une saison, du 1er septembre au 31 août. Rien n'est à payer maintenant : le paiement vient après l'accord du CA.
          </p>
          <div className={styles.rateCards} role="radiogroup" aria-label="Tarif">
            <label className={`${styles.rateCard} ${minor ? styles.rateCardDisabled : ""}`}>
              <input
                type="radio"
                name="rate"
                checked={!values.reducedRate && !minor}
                disabled={minor}
                onChange={() => update("reducedRate", false)}
              />
              <span className={styles.rateAmount}>{fees.normal} €</span>
              <span className={styles.rateName}>Tarif normal</span>
            </label>
            <label className={styles.rateCard}>
              <input type="radio" name="rate" checked={values.reducedRate || minor} onChange={() => update("reducedRate", true)} />
              <span className={styles.rateAmount}>{fees.reduced} €</span>
              <span className={styles.rateName}>Tarif réduit</span>
              <span className={styles.rateWho}>Mineur·e, étudiant·e, demandeur·deuse d'emploi, aides sociales</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Tes engagements</legend>
          <div className={styles.formField}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={values.acceptsRules}
                onChange={(event) => update("acceptsRules", event.target.checked)}
                aria-invalid={errors.acceptsRules ? true : undefined}
              />
              <span>
                J'ai lu les{" "}
                <a href={settings.associationStatusUrl} target="_blank" rel="noopener noreferrer">
                  statuts
                </a>{" "}
                et le{" "}
                <a href={settings.internalRulesUrl} target="_blank" rel="noopener noreferrer">
                  règlement intérieur
                </a>
                , et je m'engage à les respecter.
              </span>
            </label>
            {errors.acceptsRules && <p className={styles.error}>{errors.acceptsRules}</p>}
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={values.acceptsPrivacy}
                onChange={(event) => update("acceptsPrivacy", event.target.checked)}
                aria-invalid={errors.acceptsPrivacy ? true : undefined}
              />
              <span>
                J'accepte que Nyassobi traite mes nom, prénom et date de naissance pour gérer mon adhésion, comme expliqué dans la page{" "}
                <a href="/status-rgpd">Statuts &amp; RGPD</a>.
              </span>
            </label>
            {errors.acceptsPrivacy && <p className={styles.error}>{errors.acceptsPrivacy}</p>}
          </div>
        </fieldset>

        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Site web
            <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
          </label>
        </div>

        {result && !result.success && (
          <p className={`${styles.statusMessage} ${styles.statusError}`} role="alert">
            {result.message}
          </p>
        )}

        <button type="submit" className={styles.submitButton} disabled={loading} aria-busy={loading || undefined}>
          {loading ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </form>
    </>
  );
}

export default AdhesionForm;
