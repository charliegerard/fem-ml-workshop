import Prism from "prismjs";

import * as React from "react";

export function CodeBlock({ children, "data-language": language }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current, false);
  }, [children]);

  return (
    <div className="code" aria-live="polite">
      <pre ref={ref} className={`language-${language}`}>
        {children}
      </pre>
      <style jsx>
        {`
          pre {
            border: 1px solid #58585f;
            font-family: Consolas, monaco, monospace;
          }
          .code {
            position: relative;
            font-size: 14px;
            font-weight: 200;
            font-family: Consolas, monaco, monospace;
          }

          /* Override Prism styles */
          .code :global(pre[class*="language-"]) {
            text-shadow: none;
            border-radius: 4px;
            font-family: Consolas, monaco, monospace;
          }
        `}
      </style>
    </div>
  );
}
