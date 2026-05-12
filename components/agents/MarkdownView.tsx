"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ text }: { text: string }) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-semibold tracking-tight mt-5 mb-2 text-fg">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold tracking-tight mt-4 mb-1.5 text-fg">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold tracking-tight mt-3 mb-1 text-fg">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-medium mt-2 mb-1 text-fg">{children}</h4>,
          p: ({ children }) => <p className="text-sm leading-relaxed text-fg mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1 text-fg">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-fg">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-fg leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
          em: ({ children }) => <em className="italic text-fg">{children}</em>,
          code: ({ children }) => <code className="px-1 py-0.5 rounded bg-bg-hover text-accent text-xs font-mono">{children}</code>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-xs border-collapse border border-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-bg-elevated">{children}</thead>,
          th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-medium text-fg-muted uppercase tracking-wide text-2xs">{children}</th>,
          td: ({ children }) => <td className="border border-border-subtle px-2 py-1 text-fg align-top">{children}</td>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-3 my-2 text-fg-muted italic">{children}</blockquote>,
          hr: () => <hr className="my-4 border-border-subtle" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">{children}</a>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
