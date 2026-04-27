"use client"; // clipboard API + copy state

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = React.ComponentPropsWithRef<"pre"> & {
  "data-language"?: string;
};

export function CodeBlock({
  children,
  "data-language": lang,
  className,
  ...props
}: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const raw = preRef.current?.textContent ?? "";
    const clean = raw
      .split("\n")
      .map((l) => (l.startsWith("$ ") ? l.slice(2) : l))
      .join("\n");
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{lang?.toUpperCase() ?? "CODE"}</span>
        <button
          onClick={handleCopy}
          className={`code-block-copy${copied ? " copied" : ""}`}
          aria-label="Copy code"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre
        ref={preRef}
        className={`code-block-body${className ? ` ${className}` : ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
