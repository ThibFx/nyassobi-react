/** Règles du formulaire d'adhésion, gardées à part pour rester lisibles. */

export const PARENTAL_MAX_BYTES = 5 * 1024 * 1024;
const PARENTAL_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Âge à la date du jour, à partir d'une date AAAA-MM-JJ (null si la date est absente). */
export function ageOn(birthDate, today = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate ?? "");
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age;
}

export function isMinor(birthDate) {
  const age = ageOn(birthDate);
  return age !== null && age >= 0 && age < 18;
}

/** Pseudo Discord ramené à sa forme canonique (sans « @ », en minuscules). */
export function normaliseDiscord(value) {
  return (value ?? "").trim().replace(/^@/, "").toLowerCase();
}

export function validateMembership(values, parental = null) {
  const errors = {};
  if (!values.pseudo.trim()) errors.pseudo = "Merci d'indiquer ton pseudo.";
  if (!values.firstName.trim()) errors.firstName = "Merci d'indiquer ton prénom.";
  if (!values.lastName.trim()) errors.lastName = "Merci d'indiquer ton nom.";
  const age = ageOn(values.birthDate);
  if (age === null) errors.birthDate = "Merci d'indiquer ta date de naissance.";
  else if (age < 0 || age > 120) errors.birthDate = "Cette date ne semble pas juste.";
  if (!EMAIL.test(values.email.trim())) errors.email = "Cette adresse e-mail ne semble pas valide.";
  const discord = normaliseDiscord(values.discordUsername);
  if (discord && !/^[a-z0-9_.]{2,32}$/.test(discord)) {
    errors.discordUsername = "Un pseudo Discord ne contient que des lettres, des chiffres, des points et des tirets bas.";
  }
  if (isMinor(values.birthDate) && !parental) errors.parental = "Merci de joindre l'autorisation parentale signée.";
  if (!values.acceptsRules) errors.acceptsRules = "Il faut avoir lu les statuts et le règlement intérieur.";
  if (!values.acceptsPrivacy) errors.acceptsPrivacy = "Il faut accepter le traitement de tes données pour adhérer.";
  return errors;
}

/** Message d'erreur pour l'autorisation parentale choisie, ou null si elle convient. */
export function checkParentalFile(file) {
  // Certains téléphones ne donnent pas de type aux photos HEIC : l'extension suffit alors.
  const typeOk = PARENTAL_TYPES.includes(file.type) || (!file.type && /\.(heic|heif)$/i.test(file.name));
  if (!typeOk) return "Formats acceptés : PDF ou photo (JPEG, PNG, WebP, HEIC).";
  if (file.size === 0) return "Ce fichier est vide.";
  if (file.size > PARENTAL_MAX_BYTES) return "Le fichier dépasse 5 Mo : une photo moins grande ou un PDF plus léger fera l'affaire.";
  return null;
}

export function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}
