"use client";

/** A Munidiff, coloured like a diff on GitHub: one block per model element. */
export function MunidiffView({ text, empty }: { text: string; empty?: string }) {
  if (!text.trim()) return <p className="text-sm text-muted-foreground">{empty ?? "No difference."}</p>;
  const lines = text.split("\n");
  const header = lines.filter((line) => line.startsWith("--- ") || line.startsWith("+++ "));
  const hunks: string[][] = [];
  for (const line of lines) {
    if (line.startsWith("--- ") || line.startsWith("+++ ")) continue;
    if (line.startsWith("@@")) hunks.push([]);
    else hunks[hunks.length - 1]?.push(line);
  }
  const added = lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const removed = lines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;
  return (
    <div className="overflow-hidden rounded-md border font-mono text-[11.5px] leading-[1.55]">
      <div className="flex flex-wrap items-center gap-x-3 border-b bg-muted px-2 py-1.5">
        <span className="min-w-0 flex-1 break-all">
          {header.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
        <span className="text-emerald-700">+{added}</span>
        <span className="text-red-700">−{removed}</span>
      </div>
      {hunks.map((hunk, index) => (
        <div key={index} className="border-b last:border-b-0">
          <div className="bg-sky-50 px-2 text-sky-800">@@ @@</div>
          {hunk.map((line, row) => {
            const tone = line.startsWith("+")
              ? "bg-emerald-50 text-emerald-950"
              : line.startsWith("-")
                ? "bg-red-50 text-red-950"
                : "";
            return (
              <div key={row} className={`flex ${tone}`}>
                <span className="w-5 shrink-0 select-none text-center opacity-70">{line[0] === " " ? "" : line[0]}</span>
                <span className="min-w-0 whitespace-pre-wrap break-all">{line.slice(1)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
