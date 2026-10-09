import { useEffect, useId, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import styles from "./ConventionsPage.module.scss";
import pageStyles from "./WordPressPage.module.scss";
import formStyles from "../components/AdhesionForm.module.scss";
import buttonStyles from "../components/NyassoButtonTwo.module.scss";
import TitleNyasso from "../TitleNyasso";
import Footer from "../Footer";
import Loader from "../components/Loader";
import { writeContext } from "../api/nyassobiMembership";
import { GET_CONVENTIONS, GET_CONVENTION_SESSION, SUBMIT_CONVENTION_RESPONSE } from "../api/nyassobiConventions";

const SESSION_KEY = "nyassobiConventionSession";

// Une personne vient soit en staff, soit pour une animation, jamais les deux.
const ROLES = {
  staff: "Staff du stand",
  animation: "Animation",
};
const NEEDS = {
  "les-deux": "Staff ou animation",
  staff: "Staff",
  animation: "Animation",
};
// Pour les animateurs : une animation dure environ une heure.
const SLOTS = {
  matin: "Matin (10 h – 12 h)",
  midi: "Midi (12 h – 14 h)",
  aprem: "Après-midi (14 h – 16 h)",
  fin: "Fin de journée (16 h – 19 h)",
};
const TRAVEL = {
  "1h": "Moins d'1 h",
  "2h": "Moins de 2 h",
  "4h": "Moins de 4 h",
  plus: "Plus de 4 h",
};
const LOGIN_ERRORS = {
  annule: "Connexion annulée sur Discord. Tu peux réessayer quand tu veux.",
  discord: "Discord n'a pas pu confirmer ta connexion. Réessaie dans quelques minutes.",
  config: "La connexion avec Discord n'est pas encore disponible.",
};

/** Le stockage peut être refusé (navigation privée) : la page marche sans. */
function storage(action, value) {
  try {
    if (action === "get") return sessionStorage.getItem(SESSION_KEY) ?? "";
    if (action === "set") sessionStorage.setItem(SESSION_KEY, value);
    if (action === "clear") sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Rien à faire : il faudra se reconnecter au prochain chargement.
  }
  return "";
}

/**
 * Au retour de Discord, la clé de session arrive après le # de l'adresse :
 * le navigateur ne l'envoie à aucun serveur. On la range, puis on la retire
 * de l'adresse pour qu'elle ne reste ni dans l'historique ni dans un lien copié.
 */
function readReturn() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const session = hash.get("session") ?? "";
  const error = hash.get("erreur") ?? "";
  if (session || error) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  if (session) storage("set", session);
  return { session: session || storage("get"), error };
}

const MONTH = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/** « 2026-10-17 » → date locale, sans décalage de fuseau. */
function parseDay(iso) {
  const [year, month, day] = (iso ?? "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

/** « 17–18 » sur « oct. » : la date se lit d'un coup d'œil. Le texte complet est à côté. */
function DateTile({ start, end }) {
  const from = parseDay(start);
  const to = parseDay(end) ?? from;
  if (!from) return null;
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const days = from.getTime() === to.getTime() ? `${from.getDate()}` : `${from.getDate()}–${to.getDate()}`;
  return (
    <span className={styles.dateTile} aria-hidden="true">
      <span className={styles.dateDays}>{days}</span>
      <span className={styles.dateMonth}>{sameMonth ? MONTH.format(from) : `${MONTH.format(from)}–${MONTH.format(to)}`}</span>
      <span className={styles.dateYear}>{to.getFullYear()}</span>
    </span>
  );
}

/** « Dans 12 jours », « Demain », « En ce moment »… */
function countdown(start, end) {
  const from = parseDay(start);
  const to = parseDay(end) ?? from;
  if (!from) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((from - today) / 86400000);
  if (days > 1) return `Dans ${days} jours`;
  if (days === 1) return "Demain";
  if (days === 0) return "Aujourd'hui";
  return today <= to ? "En ce moment" : "";
}

/** Nom, dates, ville et état d'une convention : le haut de sa fiche. */
function ConventionSummary({ convention, heading = false }) {
  const { name, city, dates, needs, open, startDate, endDate } = convention;
  const Name = heading ? "h3" : "span";
  const soon = countdown(startDate, endDate);
  return (
    <span className={styles.summary}>
      <DateTile start={startDate} end={endDate} />
      <span className={styles.summaryText}>
        <Name className={styles.name}>{name}</Name>
        <span className={styles.meta}>
          {dates}
          {city && ` · ${city}`}
        </span>
        <span className={styles.badges}>
          {open ? (
            <span className={`${styles.badge} ${styles.badgeOpen}`}>Inscriptions ouvertes</span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeClosed}`}>Équipe complète</span>
          )}
          <span className={styles.badge}>{NEEDS[needs] ?? needs}</span>
          {soon && <span className={`${styles.badge} ${styles.badgeSoon}`}>{soon}</span>}
        </span>
      </span>
    </span>
  );
}

/** Ce que le CA a ajouté : description, lien, affiche ou photos, annonces. */
function ConventionInfo({ convention, skipPoster = false }) {
  const { name, description, link, news = [] } = convention;
  // L'affiche est déjà en tête de fiche quand skipPoster est vrai.
  const images = (convention.images ?? []).slice(skipPoster ? 1 : 0);
  if (!description && !link && images.length === 0 && news.length === 0) return null;
  return (
    <div className={styles.info}>
      {description && <p className={styles.description}>{description}</p>}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Site de la convention
        </a>
      )}
      {images.length > 0 && (
        <div className={styles.images}>
          {images.map((src, index) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer">
              <img src={src} alt={`${name}, image ${index + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      )}
      {news.length > 0 && (
        <div className={styles.news}>
          <p className={styles.newsTitle}>Annonces</p>
          <ul>
            {news.map((item, index) => (
              <li key={`${item.date}-${index}`}>
                <span className={styles.newsDate}>{item.date}</span>
                {item.text && <p className={styles.description}>{item.text}</p>}
                {item.image && (
                  <a href={item.image} target="_blank" rel="noopener noreferrer">
                    <img src={item.image} alt={`${name}, image de l'annonce`} loading="lazy" className={styles.newsImage} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function rolesFor(needs) {
  return needs === "les-deux" ? Object.keys(ROLES) : [needs];
}

/**
 * Page où les adhérents proposent leur aide pour les conventions : staff du
 * stand, animation, ou les deux. La connexion avec Discord prouve qu'ils ont
 * le rôle Adhérent ; le CA reçoit un récapitulatif sur Discord.
 */
function ConventionsPage() {
  const ids = useId();
  const [{ session, error: loginError }, setLogin] = useState(readReturn);
  const [picks, setPicks] = useState({});
  const [animation, setAnimation] = useState("");
  const [comment, setComment] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState(null);

  const conventionsQuery = useQuery(GET_CONVENTIONS, { context: writeContext, fetchPolicy: "network-only" });
  const sessionQuery = useQuery(GET_CONVENTION_SESSION, {
    variables: { session },
    context: writeContext,
    fetchPolicy: "network-only",
    skip: !session,
  });
  const [submit, { loading: saving }] = useMutation(SUBMIT_CONVENTION_RESPONSE, { context: writeContext });

  const conventions = conventionsQuery.data?.nyassobiConventions ?? [];
  const loginUrl = conventionsQuery.data?.nyassobiConventionsLoginUrl ?? null;
  const me = sessionQuery.data?.nyassobiConventionSession ?? null;
  const expired = Boolean(session) && !sessionQuery.loading && sessionQuery.data && !me;

  // Les choix déjà enregistrés sont repris une seule fois, à l'arrivée.
  useEffect(() => {
    if (!me || loaded) return;
    const initial = {};
    for (const choice of me.choices ?? []) {
      initial[choice.conventionId] = {
        role: choice.role,
        travel: choice.travel,
        transport: choice.transport ?? "",
        days: choice.days ?? [],
        slots: choice.slots ?? [],
      };
    }
    setPicks(initial);
    setAnimation(me.animation ?? "");
    setComment(me.comment ?? "");
    setLoaded(true);
  }, [me, loaded]);

  const logout = () => {
    storage("clear");
    setLogin({ session: "", error: "" });
    setPicks({});
    setLoaded(false);
    setResult(null);
  };

  const toggle = (convention) => {
    setResult(null);
    setPicks((current) => {
      const next = { ...current };
      if (next[convention.id]) {
        delete next[convention.id];
      } else {
        const roles = rolesFor(convention.needs);
        const days = (convention.days ?? []).map((day) => day.date);
        next[convention.id] = {
          role: roles.length === 1 ? roles[0] : "",
          travel: "",
          transport: "",
          // Une convention d'un seul jour n'a pas de jour à choisir.
          days: days.length === 1 ? days : [],
          slots: [],
        };
      }
      return next;
    });
  };

  const change = (id, key, value) => {
    setResult(null);
    setPicks((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  };

  /** Coche ou décoche une valeur d'une liste (jours, horaires). */
  const flip = (id, key, value) => {
    setResult(null);
    setPicks((current) => {
      const list = current[id][key] ?? [];
      const nextList = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [id]: { ...current[id], [key]: nextList } };
    });
  };

  const animates = Object.values(picks).some((pick) => pick.role && pick.role !== "staff");
  const hadAnswer = (me?.choices ?? []).length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Les animations se font à distance : le trajet ne concerne que le staff du stand.
    const noRole = conventions.find((c) => picks[c.id] && !picks[c.id].role);
    if (noRole) {
      setResult({ success: false, message: `Indique ton rôle pour ${noRole.name}.` });
      return;
    }
    const noTravel = conventions.find((c) => picks[c.id]?.role === "staff" && !picks[c.id].travel);
    if (noTravel) {
      setResult({ success: false, message: `Indique ton temps de trajet pour ${noTravel.name}.` });
      return;
    }
    const noDay = conventions.find((c) => picks[c.id] && (picks[c.id].days ?? []).length === 0);
    if (noDay) {
      setResult({ success: false, message: `Coche le ou les jours où tu peux venir à ${noDay.name}.` });
      return;
    }
    const noSlot = conventions.find((c) => picks[c.id]?.role === "animation" && (picks[c.id].slots ?? []).length === 0);
    if (noSlot) {
      setResult({ success: false, message: `Indique tes horaires préférés pour animer à ${noSlot.name}.` });
      return;
    }
    try {
      const { data } = await submit({
        variables: {
          input: {
            session,
            choices: Object.entries(picks).map(([conventionId, pick]) => ({
              conventionId: Number(conventionId),
              role: pick.role,
              travel: pick.role === "staff" ? pick.travel : "",
              transport: pick.role === "staff" ? pick.transport.trim() : "",
              days: pick.days ?? [],
              slots: pick.role === "animation" ? pick.slots ?? [] : [],
            })),
            animation: animates ? animation.trim() : "",
            comment: comment.trim(),
          },
        },
      });
      const response = data?.submitNyassobiConventionResponse;
      setResult({ success: Boolean(response?.success), message: response?.message ?? "" });
      if (response?.success) sessionQuery.refetch();
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "La réponse n'a pas pu être envoyée." });
    }
  };

  return (
    <>
      <div className={pageStyles.pageViewport}>
        <article className={pageStyles.simplePage}>
          <TitleNyasso title="Conventions" />
          <div className={pageStyles.simpleContent}>
            <p>
              Nyassobi tient un stand dans plusieurs conventions. On cherche des adhérents pour le staff (installer et tenir le stand, présenter
              l'association et le VTubing aux visiteurs) et pour proposer des animations. Ça n'engage à rien : le CA choisit l'équipe et te
              recontacte sur Discord. Les frais de déplacement sont défrayés.
            </p>

            {conventionsQuery.loading && <Loader label="Chargement des conventions..." />}
            {conventionsQuery.error && <p className={styles.notice}>La liste n'a pas pu être chargée. Vérifie ta connexion et recharge la page.</p>}
            {LOGIN_ERRORS[loginError] && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{LOGIN_ERRORS[loginError]}</p>}
            {expired && <p className={styles.notice} role="status">Ta connexion a expiré : reconnecte-toi avec Discord pour retrouver ta réponse.</p>}

            {!conventionsQuery.loading && !conventionsQuery.error && conventions.length === 0 && (
              <p className={styles.notice}>Aucune convention à venir pour le moment. Les prochaines seront annoncées sur Discord.</p>
            )}

            {conventions.length > 0 && (!me || !me.member) && (
              <>
                <ul className={styles.list}>
                  {conventions.map((c) => (
                    <li key={c.id} className={`${styles.card} ${c.open ? "" : styles.cardClosed}`}>
                      <div className={styles.cardHead}>
                        <ConventionSummary convention={c} heading />
                        {c.images?.[0] && (
                          <a href={c.images[0]} target="_blank" rel="noopener noreferrer" className={styles.poster}>
                            <img src={c.images[0]} alt={`Affiche de ${c.name}`} loading="lazy" />
                          </a>
                        )}
                      </div>
                      <ConventionInfo convention={c} skipPoster />
                    </li>
                  ))}
                </ul>

                {me && !me.member ? (
                  <div className={styles.notice} role="status">
                    <p>
                      Connecté·e en tant que <strong>{me.name}</strong>, mais ce formulaire est réservé aux adhérents : on ne trouve pas ton rôle
                      « Adhérent » sur notre serveur Discord.
                    </p>
                    <button type="button" className={formStyles.linkButton} onClick={logout}>
                      Changer de compte Discord
                    </button>
                  </div>
                ) : loginUrl ? (
                  <div className={styles.login}>
                    <div className={buttonStyles.nyassoBtn}>
                      <a href={loginUrl} className={`${buttonStyles.button} ${styles.discord}`}>
                        Me connecter avec Discord
                      </a>
                    </div>
                    <p className={formStyles.hint}>
                      Réservé aux adhérents : la connexion vérifie ton rôle « Adhérent » sur notre serveur Discord. On ne récupère que ton pseudo.
                    </p>
                  </div>
                ) : (
                  !session && <p className={styles.notice}>Les inscriptions en ligne ouvrent bientôt. En attendant, contacte le CA sur Discord.</p>
                )}
              </>
            )}

            {me?.member && conventions.length > 0 && (
              <form className={formStyles.adhesionForm} onSubmit={handleSubmit} noValidate aria-label="Proposer mon aide pour les conventions">
                <p className={styles.who}>
                  Connecté·e en tant que <strong>{me.name}</strong>.{" "}
                  <button type="button" className={formStyles.linkButton} onClick={logout}>
                    Se déconnecter
                  </button>
                </p>
                <p className={formStyles.hint}>
                  Coche les conventions qui t'intéressent. Les animations se font à distance ; pour le staff du stand, on te demande ton temps de trajet, jamais ta ville.
                </p>

                {conventions.map((c) => {
                  const pick = picks[c.id];
                  const roles = rolesFor(c.needs);
                  const closed = !c.open && !pick;
                  const fid = `${ids}-${c.id}`;
                  return (
                    <fieldset key={c.id} className={`${styles.card} ${styles.convention} ${pick ? styles.conventionPicked : ""}`} disabled={closed}>
                      <legend className={styles.legend}>
                        <label className={`${formStyles.checkbox} ${styles.pick}`}>
                          <input type="checkbox" checked={Boolean(pick)} onChange={() => toggle(c)} disabled={closed} />
                          <ConventionSummary convention={c} />
                        </label>
                      </legend>

                      <div className={styles.details}>
                        <ConventionInfo convention={c} />
                      </div>

                      {pick && (
                        <div className={styles.details}>
                          {roles.length > 1 ? (
                            <div className={formStyles.formField}>
                              <span className={formStyles.label}>Je viens pour</span>
                              <div className={styles.options}>
                                {roles.map((role) => (
                                  <label key={role} className={formStyles.rate}>
                                    <input type="radio" name={`${fid}-role`} value={role} checked={pick.role === role} onChange={() => change(c.id, "role", role)} />
                                    <span>{ROLES[role]}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className={formStyles.hint}>Pour cette convention, on cherche : {NEEDS[c.needs].toLowerCase()}.</p>
                          )}
                          {(c.days ?? []).length > 1 && (
                            <div className={formStyles.formField}>
                              <span className={formStyles.label}>Les jours où je peux venir</span>
                              <div className={styles.options}>
                                {c.days.map((day) => (
                                  <label key={day.date} className={formStyles.checkbox}>
                                    <input type="checkbox" checked={(pick.days ?? []).includes(day.date)} onChange={() => flip(c.id, "days", day.date)} />
                                    <span>{day.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {pick.role === "animation" && (
                            <div className={formStyles.formField}>
                              <span className={formStyles.label}>Mes horaires préférés pour animer</span>
                              <div className={styles.options}>
                                {Object.entries(SLOTS).map(([value, label]) => (
                                  <label key={value} className={formStyles.checkbox}>
                                    <input type="checkbox" checked={(pick.slots ?? []).includes(value)} onChange={() => flip(c.id, "slots", value)} />
                                    <span>{label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {pick.role === "animation" && (
                            <p className={formStyles.hint}>Les animations se font à distance : pas de trajet à prévoir.</p>
                          )}
                          {pick.role === "staff" && (
                          <div className={formStyles.row}>
                            <div className={formStyles.formField}>
                              <label htmlFor={`${fid}-travel`} className={formStyles.label}>
                                Temps de trajet jusqu'au stand
                              </label>
                              <select id={`${fid}-travel`} className={formStyles.input} value={pick.travel} onChange={(e) => change(c.id, "travel", e.target.value)}>
                                <option value="">Choisir…</option>
                                {Object.entries(TRAVEL).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className={formStyles.formField}>
                              <label htmlFor={`${fid}-transport`} className={formStyles.label}>
                                Moyen de transport <span className={formStyles.optional}>(facultatif)</span>
                              </label>
                              <input
                                id={`${fid}-transport`}
                                type="text"
                                maxLength={80}
                                className={formStyles.input}
                                placeholder="Train, voiture, covoiturage…"
                                value={pick.transport}
                                onChange={(e) => change(c.id, "transport", e.target.value)}
                              />
                            </div>
                          </div>
                          )}
                        </div>
                      )}
                    </fieldset>
                  );
                })}

                {animates && (
                  <div className={formStyles.formField}>
                    <label htmlFor={`${ids}-animation`} className={formStyles.label}>
                      L'animation que tu proposes
                    </label>
                    <textarea
                      id={`${ids}-animation`}
                      rows={4}
                      maxLength={1000}
                      className={formStyles.input}
                      placeholder="Atelier dessin, karaoké, quiz VTubing, présentation…"
                      value={animation}
                      onChange={(e) => setAnimation(e.target.value)}
                    />
                  </div>
                )}

                <div className={formStyles.formField}>
                  <label htmlFor={`${ids}-comment`} className={formStyles.label}>
                    Questions, précisions ou commentaires <span className={formStyles.optional}>(facultatif)</span>
                  </label>
                  <textarea
                    id={`${ids}-comment`}
                    rows={3}
                    maxLength={1000}
                    className={formStyles.input}
                    placeholder="Dispo seulement le samedi, déjà staffé chez…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                {result && (
                  <p className={result.success ? formStyles.statusMessage : formStyles.error} role={result.success ? "status" : "alert"}>
                    {result.message}
                  </p>
                )}

                <button type="submit" className={formStyles.submitButton} disabled={saving} aria-busy={saving || undefined}>
                  {saving ? "Envoi…" : hadAnswer ? "Mettre à jour ma réponse" : "Envoyer"}
                </button>
                {hadAnswer && <p className={formStyles.hint}>Pour retirer ta réponse, décoche toutes les conventions et envoie.</p>}
              </form>
            )}

            {session && sessionQuery.loading && <Loader label="Connexion..." />}
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}

export default ConventionsPage;
