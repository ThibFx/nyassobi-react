import { describe, expect, it } from "vitest";

import { ageOn, validateMembership } from "./MembershipForm";
import { checkParentalFile, PARENTAL_MAX_BYTES } from "./ParentalUpload";

const VALID = {
  pseudo: "Neko Test",
  firstName: "Camille",
  lastName: "Exemple",
  birthDate: "2000-05-12",
  email: "camille@example.org",
  discordUsername: "",
  reducedRate: false,
  acceptsRules: true,
  acceptsPrivacy: true,
  website: "",
};

describe("ageOn", () => {
  it("compte l'anniversaire seulement une fois passé", () => {
    const today = new Date(2026, 9, 5);
    expect(ageOn("2008-10-05", today)).toBe(18);
    expect(ageOn("2008-10-06", today)).toBe(17);
    expect(ageOn("", today)).toBeNull();
  });
});

describe("validateMembership", () => {
  it("accepte une demande complète", () => {
    expect(validateMembership(VALID)).toEqual({});
  });

  it("exige les deux consentements", () => {
    const errors = validateMembership({ ...VALID, acceptsRules: false, acceptsPrivacy: false });
    expect(Object.keys(errors).sort()).toEqual(["acceptsPrivacy", "acceptsRules"]);
  });

  it("refuse une adresse ou une date fantaisistes", () => {
    const errors = validateMembership({ ...VALID, email: "camille@", birthDate: "1850-01-01" });
    expect(errors.email).toBeDefined();
    expect(errors.birthDate).toBeDefined();
  });
});

describe("pseudo Discord", () => {
  it("est facultatif, et accepte la forme avec @", () => {
    expect(validateMembership(VALID).discordUsername).toBeUndefined();
    expect(validateMembership({ ...VALID, discordUsername: "@Neko_Test.42" }).discordUsername).toBeUndefined();
  });

  it("refuse ce qui ne peut pas être un pseudo Discord", () => {
    expect(validateMembership({ ...VALID, discordUsername: "neko test#1234" }).discordUsername).toBeDefined();
  });
});

describe("mineurs", () => {
  const minor = { ...VALID, birthDate: `${new Date().getFullYear() - 15}-01-01` };

  it("exigent l'autorisation parentale", () => {
    expect(validateMembership(minor).parental).toBeDefined();
    expect(validateMembership(minor, new File(["x"], "autorisation.pdf", { type: "application/pdf" })).parental).toBeUndefined();
  });

  it("pas les majeurs", () => {
    expect(validateMembership(VALID).parental).toBeUndefined();
  });
});

describe("checkParentalFile", () => {
  it("accepte un PDF ou une photo, même HEIC sans type", () => {
    expect(checkParentalFile(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBeNull();
    expect(checkParentalFile(new File(["x"], "photo.jpg", { type: "image/jpeg" }))).toBeNull();
    expect(checkParentalFile(new File(["x"], "IMG_0001.HEIC", { type: "" }))).toBeNull();
  });

  it("refuse les autres formats, les fichiers vides ou trop lourds", () => {
    expect(checkParentalFile(new File(["x"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))).not.toBeNull();
    expect(checkParentalFile(new File([], "vide.pdf", { type: "application/pdf" }))).not.toBeNull();
    const lourd = new File([new Uint8Array(PARENTAL_MAX_BYTES + 1)], "lourd.pdf", { type: "application/pdf" });
    expect(checkParentalFile(lourd)).not.toBeNull();
  });
});
