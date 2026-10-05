import { describe, expect, it } from "vitest";

import { ageOn, validateMembership } from "./MembershipForm";

const VALID = {
  pseudo: "Neko Test",
  firstName: "Camille",
  lastName: "Exemple",
  birthDate: "2000-05-12",
  email: "camille@example.org",
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
