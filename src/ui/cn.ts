/** Assemble des classes conditionnelles, sans dépendance. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
