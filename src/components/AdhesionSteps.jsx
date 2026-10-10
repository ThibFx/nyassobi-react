import styles from "./AdhesionSteps.module.scss";

const STEPS = [
  { title: "Ta demande", text: "Ce formulaire, deux minutes." },
  { title: "Le vote du CA", text: "Il ne voit que ton pseudo. Réponse par e-mail." },
  { title: "Ta cotisation", text: "En ligne, avec le lien reçu par e-mail." },
  { title: "Bienvenue !", text: "Ton rôle « Adhérent » sur notre Discord." },
];

/**
 * Les quatre étapes d'une adhésion. Montrées avant le formulaire pour qu'on
 * sache à quoi s'attendre, puis sur la page de cotisation pour dire où on en
 * est : `current` est l'étape en cours (0 à 3), 4 quand tout est fait.
 */
function AdhesionSteps({ current = 0, title = "Comment ça se passe" }) {
  return (
    <section className={styles.steps} aria-label={title}>
      {title && <p className={styles.heading}>{title}</p>}
      <ol className={styles.list}>
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.title}
              className={`${styles.step} ${done ? styles.done : ""} ${active ? styles.active : ""}`}
              aria-current={active ? "step" : undefined}
            >
              <span className={styles.marker} aria-hidden="true">
                {done ? "✓" : index + 1}
              </span>
              <span className={styles.body}>
                <span className={styles.title}>
                  {step.title}
                  {done && <span className={styles.srOnly}> (fait)</span>}
                </span>
                <span className={styles.text}>{step.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default AdhesionSteps;
