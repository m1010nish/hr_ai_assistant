/*
| The assistant returns plain prose in `answer`. It is rendered as paragraphs
| and simple bullet runs — enough structure to stay readable, without pulling
| in a markdown renderer or ever printing a raw object.
*/

const BULLET_PATTERN = /^\s*(?:[-•*]|\d+[.)])\s+/;

function splitBlocks(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default function FormattedAnswer({ text, className = "" }) {
  if (typeof text !== "string" || !text.trim()) return null;

  const blocks = splitBlocks(text);

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter((line) => line.trim());
        const isList = lines.length > 0 && lines.every((line) => BULLET_PATTERN.test(line));

        if (isList) {
          return (
            <ul key={blockIndex} className="flex flex-col gap-1.5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-2 text-sm leading-relaxed text-body">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted"
                  />
                  {line.replace(BULLET_PATTERN, "")}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex} className="text-sm leading-relaxed text-body">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
