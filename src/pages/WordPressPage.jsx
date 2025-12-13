import { createElement, Fragment, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { wpquery } from "../api/wordPressQuery";
import Loader from "../components/Loader";

import styles from "./WordPressPage.module.scss";
import TitleNyasso from "../TitleNyasso";
import NyassoButtonOne from "../components/NyassoButtonOne";
import DonNyassoWidget from "../components/DonNyassoWidget";
import NyassoButtonTwo from "../components/NyassoButtonTwo";
import NyassoContact from "../components/NyassoContact";
import NyassoSocial from "../components/NyassoSocial";
import PressKitButton from "../components/PressKitButton";


import './WordpressCSS.scss'
import Footer from "../Footer";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const ATTRIBUTE_NAME_MAP = {
  class: "className",
  for: "htmlFor",
  colspan: "colSpan",
  rowspan: "rowSpan",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  autoplay: "autoPlay",
  playsinline: "playsInline",
  frameborder: "frameBorder",
  allowfullscreen: "allowFullScreen",
  srcset: "srcSet",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
};

const camelCaseCssProperty = (property) =>
  property.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).trim();

const parseStyleAttribute = (styleString) => {
  if (!styleString) {
    return {};
  }

  return styleString
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce((accumulator, declaration) => {
      const [property, ...valueParts] = declaration.split(":");
      if (!property || valueParts.length === 0) {
        return accumulator;
      }

      const value = valueParts.join(":").trim();
      if (!value) {
        return accumulator;
      }

      accumulator[camelCaseCssProperty(property)] = value;
      return accumulator;
    }, {});
};

const parseComponentPropValue = (value) => {
  if (value == null) {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const extractComponentProps = (element) => {
  const rawProps = convertAttributes(element);
  delete rawProps.name;
  delete rawProps["data-name"];
  delete rawProps.dataName;

  const componentProps = {};

  Object.entries(rawProps).forEach(([key, value]) => {
    if (key.startsWith("data-prop-")) {
      const propName = camelCaseCssProperty(key.slice("data-prop-".length));
      componentProps[propName] = parseComponentPropValue(value);
      return;
    }

    if (key.startsWith("dataProp")) {
      const propName = key.slice("dataProp".length);
      const normalised =
        propName.length > 0
          ? propName.charAt(0).toLowerCase() + propName.slice(1)
          : propName;
      componentProps[normalised] = parseComponentPropValue(value);
      return;
    }

    componentProps[key] = value;
  });

  return componentProps;
};

const normaliseComponentRegistryKey = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

const parseComponentSpecifier = (specifier) => {
  if (typeof specifier !== "string") {
    return { baseName: "", rawArgs: undefined, syntax: "none" };
  }

  const trimmed = specifier.trim();
  if (!trimmed) {
    return { baseName: "", rawArgs: undefined, syntax: "none" };
  }

  if (trimmed.endsWith(")") && trimmed.includes("(")) {
    const openingIndex = trimmed.indexOf("(");
    const baseName = trimmed.slice(0, openingIndex).trim();
    const rawArgs = trimmed.slice(openingIndex + 1, -1).trim();
    return {
      baseName,
      rawArgs: rawArgs || undefined,
      syntax: "parentheses",
    };
  }

  const queryIndex = trimmed.indexOf("?");
  if (queryIndex !== -1) {
    const baseName = trimmed.slice(0, queryIndex).trim();
    const rawArgs = trimmed.slice(queryIndex + 1).trim();
    return { baseName, rawArgs: rawArgs || undefined, syntax: "query" };
  }

  const pipeIndex = trimmed.indexOf("|");
  if (pipeIndex !== -1) {
    const baseName = trimmed.slice(0, pipeIndex).trim();
    const rawArgs = trimmed.slice(pipeIndex + 1).trim();
    return { baseName, rawArgs: rawArgs || undefined, syntax: "pipe" };
  }

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex !== -1 && trimmed.indexOf("://") === -1) {
    const baseName = trimmed.slice(0, colonIndex).trim();
    const rawArgs = trimmed.slice(colonIndex + 1).trim();
    return { baseName, rawArgs: rawArgs || undefined, syntax: "colon" };
  }

  return { baseName: trimmed, rawArgs: undefined, syntax: "none" };
};

const parseComponentArgs = (rawArgs) => {
  if (rawArgs == null) {
    return undefined;
  }

  const trimmed = rawArgs.trim();
  if (!trimmed) {
    return undefined;
  }

  const literalValue = parseComponentPropValue(trimmed);
  if (typeof literalValue !== "string" || literalValue !== trimmed) {
    return literalValue;
  }

  const candidate = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
  if (candidate.includes("=")) {
    const params = new URLSearchParams(candidate);
    const parsedParams = {};

    params.forEach((value, key) => {
      const parsedValue = parseComponentPropValue(value);
      if (Object.prototype.hasOwnProperty.call(parsedParams, key)) {
        const existing = parsedParams[key];
        if (Array.isArray(existing)) {
          existing.push(parsedValue);
        } else {
          parsedParams[key] = [existing, parsedValue];
        }
      } else {
        parsedParams[key] = parsedValue;
      }
    });

    if (Object.keys(parsedParams).length > 0) {
      return parsedParams;
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((chunk) => parseComponentPropValue(chunk));
  }

  return trimmed;
};

const convertArgsToProps = (args) => {
  if (args == null) {
    return {};
  }

  if (Array.isArray(args)) {
    return { componentArgs: [...args] };
  }

  if (typeof args === "object") {
    return { ...args };
  }

  return { componentArgs: args };
};

const createComponentRegistry = (definitions) => {
  const entries = new Map();

  Object.entries(definitions).forEach(([rawName, rawDefinition]) => {
    if (!rawName) {
      return;
    }

    const baseDefinition =
      typeof rawDefinition === "function"
        ? { component: rawDefinition }
        : rawDefinition ?? {};

    const component =
      typeof baseDefinition.component === "function"
        ? baseDefinition.component
        : typeof rawDefinition === "function"
        ? rawDefinition
        : null;

    const render =
      typeof baseDefinition.render === "function"
        ? baseDefinition.render
        : null;

    if (!component && !render) {
      return;
    }

    const entry = {
      component,
      render,
      defaultProps: baseDefinition.defaultProps ?? undefined,
      mapProps:
        typeof baseDefinition.mapProps === "function"
          ? baseDefinition.mapProps
          : null,
      parseArgs:
        typeof baseDefinition.parseArgs === "function"
          ? baseDefinition.parseArgs
          : null,
    };

    const aliasList = Array.isArray(baseDefinition.aliases)
      ? baseDefinition.aliases
      : [];

    const keys = new Set([rawName, ...aliasList]);

    keys.forEach((key) => {
      const normalised = normaliseComponentRegistryKey(key);
      if (!normalised) {
        return;
      }

      entries.set(normalised, entry);
    });
  });

  const resolve = (specifier, context = {}) => {
    const { componentProps = {}, domNode = null, children = [] } = context;
    const { baseName, rawArgs, syntax } = parseComponentSpecifier(specifier);
    if (!baseName) {
      return null;
    }

    const entry = entries.get(normaliseComponentRegistryKey(baseName));
    if (!entry) {
      return null;
    }

    const args =
      rawArgs !== undefined
        ? entry.parseArgs
          ? entry.parseArgs(rawArgs, {
              specifier,
              domNode,
              syntax,
              componentProps,
              children,
            })
          : parseComponentArgs(rawArgs)
        : undefined;

    const defaultProps =
      typeof entry.defaultProps === "function"
        ? entry.defaultProps({
            args,
            rawArgs,
            specifier,
            domNode,
            componentProps,
            children,
            syntax,
          })
        : entry.defaultProps;

    const baseProps =
      defaultProps &&
      typeof defaultProps === "object" &&
      !Array.isArray(defaultProps)
        ? { ...defaultProps }
        : {};

    const argsProps = convertArgsToProps(args);

    let mergedProps = {
      ...baseProps,
      ...argsProps,
      ...componentProps,
    };

    if (entry.mapProps) {
      mergedProps = entry.mapProps(mergedProps, {
        args,
        rawArgs,
        specifier,
        domNode,
        componentProps,
        children,
        syntax,
      });
    }

    return {
      component: entry.component,
      render: entry.render,
      props: mergedProps,
      args,
      rawArgs,
      specifier,
    };
  };

  return { resolve };
};

const COMPONENT_REGISTRY = createComponentRegistry({
  NyassoButtonOne: { component: NyassoButtonOne },
  NyassoButtonTwo: { component: NyassoButtonTwo },
  DonNyassoWidget: { component: DonNyassoWidget },
  NyassoContact: { component: NyassoContact },
  NyassoSocial: { component: NyassoSocial },
  PressKitButton: { component: PressKitButton },
  PressKit: { component: PressKitButton },
});

const convertAttributes = (element) => {
  const props = {};

  Array.from(element.attributes).forEach((attribute) => {
    const rawName = attribute.name;
    const value = attribute.value;

    if (rawName.startsWith("on")) {
      return;
    }

    if (rawName === "style") {
      const styleObject = parseStyleAttribute(value);
      if (Object.keys(styleObject).length > 0) {
        props.style = styleObject;
      }
      return;
    }

    if (rawName.startsWith("data-") || rawName.startsWith("aria-")) {
      props[rawName] = value;
      return;
    }

    const mappedName =
      ATTRIBUTE_NAME_MAP[rawName] ||
      (rawName.includes("-") ? camelCaseCssProperty(rawName) : rawName);

    props[mappedName] = value;
  });

  return props;
};

const convertChildNodes = (parentNode, keyPrefix) =>
  Array.from(parentNode.childNodes)
    .map((childNode, index) => convertNode(childNode, `${keyPrefix}-${index}`))
    .filter((child) => child !== null && child !== undefined);

const convertNode = (domNode, key) => {
  if (domNode.nodeType === Node.TEXT_NODE) {
    const text = domNode.textContent ?? "";
    if (!text.trim()) {
      return text.includes("\u00a0") ? "\u00a0" : null;
    }

    return text;
  }

  if (domNode.nodeType === Node.COMMENT_NODE || domNode.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tagName = domNode.nodeName.toLowerCase();
  if (tagName === "script" || tagName === "noscript" || tagName === "style") {
    return null;
  }

  const children = convertChildNodes(domNode, key);

  if (tagName === "wp-component") {
    const componentSpecifier =
      domNode.getAttribute("name") || domNode.getAttribute("data-name");
    const { baseName: parsedName } = parseComponentSpecifier(
      componentSpecifier ?? "",
    );
    const componentProps = extractComponentProps(domNode);
    const resolvedComponent =
      componentSpecifier
        ? COMPONENT_REGISTRY.resolve(componentSpecifier, {
            componentProps,
            domNode,
            children,
          })
        : null;

    const Component = resolvedComponent?.component ?? null;
    const resolvedRender = resolvedComponent?.render ?? null;

    if (!Component && !resolvedRender) {
      if (componentSpecifier && typeof console !== "undefined") {
        const reportedName = parsedName || componentSpecifier;
        console.warn(
          `[WordPressPage] composant WordPress "${reportedName}" introuvable.`,
        );
      }

      if (children.length === 0) {
        return null;
      }

      if (children.length === 1) {
        return children[0];
      }

      return createElement(Fragment, { key }, ...children);
    }

    const finalProps = resolvedComponent?.props ?? componentProps;

    if (resolvedRender) {
      return resolvedRender({
        key,
        props: finalProps,
        children,
        domNode,
        specifier: componentSpecifier,
      });
    }

    return createElement(Component, { key, ...finalProps }, ...children);
  }

  if (tagName === "h1") {
    const headingContent =
      children.length <= 1 ? children[0] ?? null : children;
    if (!headingContent) {
      return null;
    }

    return <TitleNyasso key={key} title={headingContent} />;
  }

  if (tagName === "h2") {
    const headingContent =
      children.length <= 1 ? children[0] ?? null : children;
    if (!headingContent) {
      return null;
    }

    return <TitleNyasso key={key} subtitle={headingContent} />;
  }

  const props = convertAttributes(domNode);
  props.key = key;

  if (VOID_ELEMENTS.has(tagName)) {
    return createElement(tagName, props);
  }

  return createElement(tagName, props, ...children);
};

const convertWordPressHtml = (html) => {
  if (!html) {
    return null;
  }

  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return [
      createElement("div", {
        key: "fallback-html",
        dangerouslySetInnerHTML: { __html: html },
      }),
    ];
  }

  try {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Handle parser errors by falling back to raw HTML
    if (doc.querySelector("parsererror")) {
      throw new Error("Invalid HTML");
    }

    return convertChildNodes(doc.body, "wp");
  } catch (error) {
    return [
      createElement("div", {
        key: "fallback-html",
        dangerouslySetInnerHTML: { __html: html },
      }),
    ];
  }
};

const NODE_BY_URI_QUERY = `
  query GetNodeByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      ... on ContentNode {
        id
        databaseId
        slug
        date
        modified
      }
      ... on UniformResourceIdentifiable {
        uri
      }
      ... on NodeWithTitle {
        title
      }
      ... on NodeWithContentEditor {
        content
      }
      ... on NodeWithExcerpt {
        excerpt
      }
      ... on NodeWithFeaturedImage {
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

const normaliseUriForWordPress = (value) => {
  if (!value) {
    return "/";
  }

  const trimmed = value.trim();

  if (trimmed === "/") {
    return "/";
  }

  const withoutLeading = trimmed.replace(/^\/+/, "");
  const withoutTrailing = withoutLeading.replace(/\/+$/, "");

  return withoutTrailing || "/";
};

const initialState = {
  loading: true,
  error: null,
  node: null,
};

function WordPressPage() {
  const location = useLocation();
  const [{ loading, error, node }, setState] = useState(initialState);

  console.log("NODE: ", node);

  const htmlContent = node?.content ?? node?.excerpt ?? "";
  const parsedContent = useMemo(
    () => convertWordPressHtml(htmlContent),
    [htmlContent],
  );

  const uri = useMemo(
    () => normaliseUriForWordPress(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchNode() {
      setState({ loading: true, error: null, node: null });

      try {
        const data = await wpquery({
          query: NODE_BY_URI_QUERY,
          variables: { uri },
        });

        if (!isMounted) {
          return;
        }

        const fetchedNode = data?.nodeByUri ?? null;

        
        if (!fetchedNode) {
          setState({
            loading: false,
            error: new Error("Contenu introuvable."),
            node: null,
          });
          return;
        }

        setState({
          loading: false,
          error: null,
          node: fetchedNode,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: err instanceof Error ? err : new Error("Erreur inattendue."),
          node: null,
        });
      }
    }

    fetchNode();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  if (loading) {
    return <Loader label="Chargement du contenu..." />;
  }

  if (error) {
    const status = error.message === "Contenu introuvable." ? 404 : 500;
    const statusText = status === 404 ? "Page introuvable" : "Erreur de contenu";
    const routedError = Object.assign(new Error(error.message), {
      status,
      statusText,
    });

    throw routedError;
  }

  if (!node) {
    const routedError = Object.assign(new Error("Contenu introuvable."), {
      status: 404,
      statusText: "Page introuvable",
    });

    throw routedError;
  }

  const typeName =
    typeof node.__typename === "string" ? node.__typename.toLowerCase() : "";
  const isArticle =
    typeName === "post" ||
    typeName === "news" ||
    typeName === "article" ||
    typeName.endsWith("post");

  console.log("parsedContent: ", parsedContent);

  if (!isArticle) {
    return (<>
      <div className={styles.pageViewport}>
        <article className={styles.simplePage}>
          {node.title ? <TitleNyasso title={node.title} /> : null}
          {node.featuredImage?.node?.sourceUrl ? (
            <figure className={styles.featuredImage}>
              <img
                src={node.featuredImage.node.sourceUrl}
                alt={node.featuredImage.node.altText ?? ""}
                loading="lazy"
              />
            </figure>
          ) : null}
          <div className={styles.simpleContent}>
            {parsedContent ?? null}
          </div>
        </article>
      </div>
      <Footer/>
    </>);
  }

  return (<>
    <div className={styles.pageViewport}>
      <article className={styles.articleCard}>
        <div className={styles.articleContent}>
          {parsedContent ?? null}
        </div>
      </article>
    </div>
    <Footer/>
  </>);
}

/* 
        <header className={styles.articleHeader}>
          {node.title ? <TitleNyasso title={node.title} /> : null}
          {node.featuredImage?.node?.sourceUrl ? (
            <figure className={styles.featuredImage}>
              <img
                src={node.featuredImage.node.sourceUrl}
                alt={node.featuredImage.node.altText ?? ""}
                loading="lazy"
              />
            </figure>
          ) : null}
        </header>
*/

export default WordPressPage;
