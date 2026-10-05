import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { sanitize, WpContent } from "./WpContent";

function renderContent(html: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <WpContent html={html} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("sanitize", () => {
  it("retire scripts et gestionnaires d'événements", () => {
    const clean = sanitize(`<p onclick="alert(1)">Salut</p><script>alert(2)</script><img src="x" onerror="alert(3)">`);
    expect(clean).not.toMatch(/script|onclick|onerror/);
    expect(clean).toContain("Salut");
  });

  it("garde les vidéos YouTube mais pas les iframes inconnues", () => {
    expect(sanitize(`<iframe src="https://www.youtube.com/embed/abc"></iframe>`)).toContain("youtube.com/embed/abc");
    expect(sanitize(`<iframe src="https://pirate.example/"></iframe>`)).not.toContain("iframe");
  });
});

describe("WpContent", () => {
  it("remplace les marqueurs de widgets par les composants du site", () => {
    renderContent(`<p><wp-component name="NyassoContact"></wp-component></p>`);
    expect(screen.getByRole("form", { name: "Formulaire de contact" })).toBeInTheDocument();
  });

  it("garde les liens WordPress internes dans le site", () => {
    renderContent(`<p><a href="https://admin.nyassobi.fr/adhesion/">Adhérer</a> ou <a href="https://twitch.tv/nyassobi">Twitch</a></p>`);
    expect(screen.getByRole("link", { name: "Adhérer" })).toHaveAttribute("href", "/adhesion");
    expect(screen.getByRole("link", { name: "Twitch" })).toHaveAttribute("target", "_blank");
  });

  it("transforme les séparateurs tapés au clavier", () => {
    const { container } = renderContent(`<p>____________________</p>`);
    expect(container.querySelector("hr")).not.toBeNull();
  });
});
