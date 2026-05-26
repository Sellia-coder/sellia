function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

interface Props {
  content: string;
}

export default function ShopPageMarkdown({ content }: Props) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="shop-page-body">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="shop-page-h2">
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
          return (
            <p key={idx} className="shop-page-meta">
              <em>{trimmed.slice(1, -1)}</em>
            </p>
          );
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={idx} className="shop-page-list">
              {items.map((item, i) => (
                <li
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: inlineMarkdown(item.slice(2)),
                  }}
                />
              ))}
            </ul>
          );
        }

        return (
          <p
            key={idx}
            className="shop-page-p"
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(trimmed) }}
          />
        );
      })}
    </div>
  );
}
