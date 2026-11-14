import { useState, useEffect, lazy, Suspense } from "react";

// react-syntax-highlighter's full Prism bundle is large; the "light" build
// plus manual language registration keeps only what we actually use out of
// the main chunk, and lazy() defers it until a code block is first rendered.
const SyntaxHighlighter = lazy(async () => {
  const { PrismAsyncLight } = await import("react-syntax-highlighter");

  const [js, ts, jsx, python, bash, json, css, markup] = await Promise.all([
    import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
    import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
    import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
    import("react-syntax-highlighter/dist/esm/languages/prism/python"),
    import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
    import("react-syntax-highlighter/dist/esm/languages/prism/json"),
    import("react-syntax-highlighter/dist/esm/languages/prism/css"),
    import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
  ]);

  PrismAsyncLight.registerLanguage("javascript", js.default);
  PrismAsyncLight.registerLanguage("typescript", ts.default);
  PrismAsyncLight.registerLanguage("jsx", jsx.default);
  PrismAsyncLight.registerLanguage("python", python.default);
  PrismAsyncLight.registerLanguage("bash", bash.default);
  PrismAsyncLight.registerLanguage("json", json.default);
  PrismAsyncLight.registerLanguage("css", css.default);
  PrismAsyncLight.registerLanguage("html", markup.default);

  return { default: PrismAsyncLight };
});

let stylePromise;
function loadStyle() {
  if (!stylePromise) {
    stylePromise = import(
      "react-syntax-highlighter/dist/esm/styles/prism/one-dark"
    ).then((m) => m.default);
  }
  return stylePromise;
}

export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadStyle().then((s) => {
      if (!cancelled) setStyle(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language || "text"}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <Suspense fallback={<pre className="code-fallback">{value}</pre>}>
        {style ? (
          <SyntaxHighlighter language={language} style={style} PreTag="div">
            {value}
          </SyntaxHighlighter>
        ) : (
          <pre className="code-fallback">{value}</pre>
        )}
      </Suspense>
    </div>
  );
}
