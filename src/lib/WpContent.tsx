import DOMPurify from "dompurify";
import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { useMemo, type ReactNode } from "react";

import { SmartLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { WIDGETS } from "@/widgets/registry";

import { toSitePath } from "./wp";

/** Seules ces sources peuvent être intégrées en iframe dans un contenu. */
const IFRAME_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "youtube.com", "player.twitch.tv", "www.helloasso.com", "open.spotify.com"];

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName !== "iframe") return;
  const src = (node as Element & HTMLElement).getAttribute?.("src") ?? "";
  try {
    if (!IFRAME_HOSTS.includes(new URL(src).hostname)) node.parentNode?.removeChild(node);
  } catch {
    node.parentNode?.removeChild(node);
  }
});

/**
 * Nettoie le HTML venu de WordPress. Un compte rédacteur piraté ne doit pas
 * pouvoir injecter de script dans le site : seules les balises de mise en page
 * passent, plus <wp-component>, le marqueur des widgets du site.
 */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["wp-component", "iframe"],
    ADD_ATTR: ["name", "allow", "allowfullscreen", "frameborder", "target"],
  });
}

function isElement(node: unknown): node is Element {
  return node instanceof Element;
}

function textOf(node: Element): string {
  return node.children.map((child) => ("data" in child ? String(child.data) : isElement(child) ? textOf(child) : "")).join("");
}

const options: HTMLReactParserOptions = {
  replace(node) {
    if (!isElement(node)) return;

    if (node.name === "wp-component") {
      const Widget = WIDGETS[node.attribs.name ?? ""];
      return Widget ? <Widget /> : <></>;
    }

    if (node.name === "p") {
      const elements = node.children.filter(isElement);
      // WordPress enveloppe les widgets dans un <p> : on le retire, un bloc ne
      // peut pas vivre dans un paragraphe.
      if (elements.length === 1 && elements[0]?.name === "wp-component" && !textOf(node).trim()) {
        return <>{domToReact([elements[0]] as DOMNode[], options)}</>;
      }
      const text = textOf(node).trim();
      if (!elements.length && !text) return <></>;
      // Les séparateurs tapés au clavier (« ______ ») deviennent un vrai séparateur.
      if (/^[_\-–—=]{8,}$/.test(text)) return <hr />;
    }

    if (node.name === "a") {
      const href = node.attribs.href ?? "";
      const path = toSitePath(href);
      const children = domToReact(node.children as DOMNode[], options);
      if (path && !href.startsWith("#")) return <SmartLink to={path}>{children}</SmartLink>;
      if (/^https?:/.test(href)) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
    }

    if (node.name === "img") {
      // Les styles de taille en ligne de l'éditeur figent l'image sur mobile.
      const { style: _style, class: className, srcset, ...attribs } = node.attribs;
      void _style;
      return <img {...attribs} srcSet={srcset} className={className} loading="lazy" decoding="async" alt={attribs.alt ?? ""} />;
    }
  },
};

export function WpContent({ html, className }: { html: string; className?: string }): ReactNode {
  const content = useMemo(() => parse(sanitize(html), options), [html]);
  return <div className={cn("prose-wp", className)}>{content}</div>;
}
