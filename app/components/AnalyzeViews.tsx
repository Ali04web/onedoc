import React, { useMemo, useState } from "react";
import { dlText, esc, escRe, stem } from "../lib/utils";
import { HBtn, HInput, SCard, Tip } from "./DocLensUI";
import { UIcon } from "./Icons";

type StatsShape = {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  readingTime: number;
  topWords: Array<[string, number]>;
};

type DocShape = {
  name: string;
  text: string | null;
  stats: StatsShape | null;
};

export function TView({
  text,
  searchQ,
}: {
  text: string;
  searchQ?: string;
}) {
  const html = useMemo(() => {
    const safe = esc(text || "");
    const withHighlights =
      searchQ && searchQ.length >= 2
        ? safe.replace(
            new RegExp(escRe(esc(searchQ)), "gi"),
            (match: string) =>
              `<mark class="rounded-md bg-[rgba(186,138,66,.18)] px-1 py-0.5 text-ink">${match}</mark>`
          )
        : safe;

    return withHighlights.replace(/\n/g, "<br />");
  }, [searchQ, text]);

  const lines = useMemo(
    () => text.split(/\n/).filter((line) => line.trim().length > 0).length,
    [text]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[rgba(42,34,24,.08)] bg-[rgba(255,255,255,.5)] px-5 py-4 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="premium-chip">
            <UIcon name="ScanText" size={14} />
            Extracted text
          </span>
          <span className="premium-chip">
            <UIcon name="Rows3" size={14} />
            {lines.toLocaleString()} lines
          </span>
          <span className="premium-chip">
            <UIcon name="AlignLeft" size={14} />
            Browser-safe review
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-7">
        <div className="surface-card min-h-full bg-[linear-gradient(180deg,rgba(255,255,255,.78),rgba(248,244,236,.88))] p-0 shadow-[0_22px_48px_rgba(33,25,16,.08)]">
          <div className="border-b border-[rgba(42,34,24,.08)] px-5 py-4">
            <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
              Review surface
            </div>
            <div className="mt-2 text-[14px] leading-relaxed text-ink4">
              Clean extraction with preserved paragraph flow for reading, copying,
              and export.
            </div>
          </div>
          <div
            className="px-5 py-5 font-mono text-[12px] leading-7 text-ink3 md:px-7 md:py-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}

export function StatsView({ stats }: { stats: StatsShape | null }) {
  if (!stats) return null;

  const { wordCount, charCount, sentenceCount, readingTime, topWords } = stats;
  const longestBar = topWords[0]?.[1] || 1;
  const cards = [
    {
      value: wordCount.toLocaleString(),
      label: "Words",
      note: "Total extracted vocabulary",
      icon: "FileText" as React.ComponentProps<typeof UIcon>["name"],
    },
    {
      value: charCount.toLocaleString(),
      label: "Characters",
      note: "Useful for sizing and limits",
      icon: "Type" as React.ComponentProps<typeof UIcon>["name"],
    },
    {
      value: sentenceCount.toLocaleString(),
      label: "Sentences",
      note: "Based on punctuation detection",
      icon: "BookText" as React.ComponentProps<typeof UIcon>["name"],
    },
    {
      value: `~${readingTime} min`,
      label: "Reading time",
      note: "Estimated at 200 words per minute",
      icon: "Clock3" as React.ComponentProps<typeof UIcon>["name"],
    },
    {
      value: Math.max(1, Math.round(wordCount / Math.max(sentenceCount, 1))).toString(),
      label: "Words / sentence",
      note: "Quick readability signal",
      icon: "Ruler" as React.ComponentProps<typeof UIcon>["name"],
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-6 md:px-8 md:py-7">
      <div className="grid gap-4 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="premium-metric">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                {card.label}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(42,34,24,.1)] bg-white/80 text-amber">
                <UIcon name={card.icon} size={18} />
              </div>
            </div>
            <div className="mt-5 font-caveat text-[34px] leading-none tracking-[-0.03em] text-ink2">
              {card.value}
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-ink4">
              {card.note}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <SCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(31,90,86,.1)] text-teal">
              <UIcon name="BarChart3" size={18} />
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                Frequency map
              </div>
              <div className="mt-1 font-caveat text-[28px] leading-none tracking-[-0.03em] text-ink2">
                Top repeated terms
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {topWords.length ? (
              topWords.map(([word, count], index) => (
                <div key={word} className="grid grid-cols-[28px_minmax(0,120px)_1fr_44px] items-center gap-3">
                  <div className="text-right text-[12px] font-semibold text-ink4">
                    {index + 1}
                  </div>
                  <div className="truncate text-[14px] font-semibold text-ink2">
                    {word}
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(42,34,24,.08)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-teal),var(--color-amber))]"
                      style={{
                        width: `${Math.max(
                          12,
                          Math.round((count / longestBar) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-right text-[13px] text-ink4">{count}</div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-[rgba(42,34,24,.08)] bg-white/70 px-4 py-4 text-[14px] leading-relaxed text-ink4">
                No standout terms were detected in this document.
              </div>
            )}
          </div>
        </SCard>

        <SCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(186,138,66,.1)] text-amber2">
              <UIcon name="Sparkles" size={18} />
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                Reading insight
              </div>
              <div className="mt-1 font-caveat text-[28px] leading-none tracking-[-0.03em] text-ink2">
                Quick interpretation
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {[
              `${sentenceCount.toLocaleString()} detected sentences give this document a ${
                sentenceCount > 0
                  ? Math.round(wordCount / Math.max(sentenceCount, 1))
                  : 0
              } word average sentence length.`,
              `Around ${Math.max(1, readingTime)} minute${
                readingTime === 1 ? "" : "s"
              } of reading means this is ${
                readingTime <= 3 ? "quick to scan" : "better treated as a longer read"
              }.`,
              topWords[0]
                ? `The strongest recurring term is "${topWords[0][0]}", which appears ${topWords[0][1]} times.`
                : "There is not enough repeated vocabulary to identify a dominant topic term.",
            ].map((line) => (
              <div
                key={line}
                className="rounded-[18px] border border-[rgba(42,34,24,.08)] bg-white/72 px-4 py-4 text-[14px] leading-relaxed text-ink3"
              >
                {line}
              </div>
            ))}
          </div>
        </SCard>
      </div>
    </div>
  );
}

export function SearchView({ text }: { text: string }) {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);

  const matches = useMemo(() => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const regex = new RegExp(escRe(query.trim()), "i");
    return text
      .split("\n")
      .map((line, index) => ({ text: line.trim(), line: index + 1 }))
      .filter((entry) => entry.text.length > 0 && regex.test(entry.text));
  }, [query, text]);

  const currentIndex = matches.length ? current % matches.length : 0;
  const selected = matches[currentIndex];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[rgba(42,34,24,.08)] bg-[rgba(255,255,255,.5)] px-5 py-4 md:px-8">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-center gap-3 rounded-[22px] border border-[rgba(42,34,24,.1)] bg-white/80 px-4 py-3 shadow-[0_10px_24px_rgba(33,25,16,.05)]">
            <UIcon name="Search" size={18} className="text-ink4" />
            <HInput
              value={query}
              tip="Search inside the extracted document text."
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setQuery(event.target.value);
                setCurrent(0);
              }}
              placeholder="Search a phrase, heading, or keyword"
              className="border-none bg-transparent px-0 py-0 shadow-none focus:border-none focus:bg-transparent focus:shadow-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="premium-chip">
              <UIcon name="Target" size={14} />
              {matches.length} result{matches.length === 1 ? "" : "s"}
            </span>
            <Tip tip="Jump to the previous search result.">
              <button
                onClick={() =>
                  setCurrent((value) =>
                    matches.length ? (value - 1 + matches.length) % matches.length : 0
                  )
                }
                title="Jump to the previous search result."
                disabled={!matches.length}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(42,34,24,.1)] bg-white/78 text-ink3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:-translate-y-0.5 enabled:hover:border-amber/35 enabled:hover:text-amber2"
              >
                <UIcon name="ChevronUp" size={18} />
              </button>
            </Tip>
            <Tip tip="Jump to the next search result.">
              <button
                onClick={() =>
                  setCurrent((value) =>
                    matches.length ? (value + 1) % matches.length : 0
                  )
                }
                title="Jump to the next search result."
                disabled={!matches.length}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(42,34,24,.1)] bg-white/78 text-ink3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:-translate-y-0.5 enabled:hover:border-amber/35 enabled:hover:text-amber2"
              >
                <UIcon name="ChevronDown" size={18} />
              </button>
            </Tip>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 px-5 py-6 md:px-8 md:py-7 xl:grid-cols-[minmax(0,1.15fr)_320px]">
        <div className="min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {!query || query.trim().length < 2 ? (
              <div className="surface-card px-5 py-6 text-[15px] leading-relaxed text-ink4">
                Start with at least two characters and OneDocs will scan the
                extracted text for matching lines.
              </div>
            ) : matches.length === 0 ? (
              <div className="surface-card px-5 py-6 text-[15px] leading-relaxed text-red">
                {`No matches were found for "${query}".`}
              </div>
            ) : (
              matches.map((match, index) => {
                const marked = esc(match.text).replace(
                  new RegExp(escRe(esc(query.trim())), "gi"),
                  (chunk: string) =>
                    `<mark class="rounded-md bg-[rgba(31,90,86,.16)] px-1 py-0.5 text-ink">${chunk}</mark>`
                );

                return (
                  <button
                    key={`${match.line}-${index}`}
                    onClick={() => setCurrent(index)}
                    className={`surface-card text-left transition-all duration-200 ${
                      currentIndex === index
                        ? "border-amber/30 bg-[linear-gradient(180deg,rgba(255,250,243,.96),rgba(249,241,227,.92))] shadow-[0_24px_42px_rgba(186,138,66,.12)]"
                        : "hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="premium-chip">
                        <UIcon name="ListOrdered" size={14} />
                        Line {match.line}
                      </span>
                      <span className="text-[12px] font-medium text-ink4">
                        Match {index + 1}
                      </span>
                    </div>
                    <div
                      className="mt-4 text-[14px] leading-7 text-ink3"
                      dangerouslySetInnerHTML={{ __html: marked }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <SCard style={{ height: "fit-content" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(31,90,86,.1)] text-teal">
              <UIcon name="LocateFixed" size={18} />
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                Current focus
              </div>
              <div className="mt-1 font-caveat text-[28px] leading-none tracking-[-0.03em] text-ink2">
                Match inspector
              </div>
            </div>
          </div>

          {selected ? (
            <div className="mt-6 rounded-[20px] border border-[rgba(42,34,24,.08)] bg-white/72 px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink4">
                Selected line
              </div>
              <div className="mt-2 text-[14px] font-semibold text-ink2">
                Line {selected.line}
              </div>
              <div className="mt-4 text-[14px] leading-7 text-ink3">
                {selected.text}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-[rgba(42,34,24,.08)] bg-white/72 px-4 py-4 text-[14px] leading-relaxed text-ink4">
              Search results will appear here with quick context for the current
              selection.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 text-[13px] leading-relaxed text-ink4">
            <div className="rounded-[18px] border border-[rgba(42,34,24,.08)] bg-[rgba(248,244,236,.78)] px-4 py-3">
              Search scans the extracted text layer, so scanned-image PDFs may
              produce fewer results unless they contain selectable text.
            </div>
            <div className="rounded-[18px] border border-[rgba(42,34,24,.08)] bg-[rgba(248,244,236,.78)] px-4 py-3">
              Use export after search if you want to save the document as text,
              markdown, or reporting data.
            </div>
          </div>
        </SCard>
      </div>
    </div>
  );
}

export function ExportView({ doc }: { doc: DocShape }) {
  const stats = doc.stats || {
    wordCount: 0,
    charCount: 0,
    sentenceCount: 0,
    readingTime: 0,
    topWords: [] as Array<[string, number]>,
  };

  const items = [
    {
      title: "Plain text",
      ext: ".txt",
      description: "Raw extracted copy for archives, notes, and quick reuse.",
      icon: "FileText" as React.ComponentProps<typeof UIcon>["name"],
      tip: "Save the extracted text as a plain text file.",
      onClick: () => dlText(`${stem(doc.name)}.txt`, doc.text || ""),
    },
    {
      title: "Markdown",
      ext: ".md",
      description: "Cleaner structure for docs, wikis, and GitHub workflows.",
      icon: "NotebookPen" as React.ComponentProps<typeof UIcon>["name"],
      tip: "Export as markdown with lightweight heading structure.",
      onClick: () =>
        dlText(
          `${stem(doc.name)}.md`,
          (doc.text || "")
            .split("\n")
            .map((line) =>
              line.trim().length > 60 ? line : line.trim() ? `## ${line.trim()}` : ""
            )
            .join("\n")
        ),
    },
    {
      title: "Analysis report",
      ext: ".txt",
      description: "Counts, reading time, and the top repeated terms in one file.",
      icon: "FileBarChart" as React.ComponentProps<typeof UIcon>["name"],
      tip: "Generate a plain text summary report.",
      onClick: () => {
        dlText(
          `${stem(doc.name)}_report.txt`,
          [
            "OneDocs Analysis Report",
            "======================",
            `File: ${doc.name}`,
            `Words: ${stats.wordCount}`,
            `Characters: ${stats.charCount}`,
            `Sentences: ${stats.sentenceCount}`,
            `Reading time: ~${stats.readingTime} min`,
            "",
            "Top Words",
            "---------",
            ...stats.topWords.map(
              ([word, count], index) => `${index + 1}. ${word}: ${count}`
            ),
          ].join("\n")
        );
      },
    },
    {
      title: "Word frequency CSV",
      ext: ".csv",
      description: "Spreadsheet-ready keyword counts for reporting or charting.",
      icon: "Sheet" as React.ComponentProps<typeof UIcon>["name"],
      tip: "Download keyword frequencies as a CSV table.",
      onClick: () =>
        dlText(
          `${stem(doc.name)}_frequency.csv`,
          "Word,Count\n" +
            stats.topWords.map(([word, count]) => `"${word}",${count}`).join("\n")
        ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-6 md:px-8 md:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="page-kicker">Export Studio</div>
          <div className="mt-3 font-caveat text-[34px] leading-none tracking-[-0.03em] text-ink2">
            Save the extracted work in the format you need.
          </div>
          <div className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-ink4">
            These exports keep the analysis fast and shareable for editors,
            researchers, support teams, and operations workflows.
          </div>
        </div>
        <span className="premium-chip">
          <UIcon name="Lock" size={14} />
          Generated in-browser
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <SCard key={item.title}>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(31,90,86,.08)] text-teal">
                  <UIcon name={item.icon} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-caveat text-[26px] leading-none tracking-[-0.02em] text-ink2">
                      {item.title}
                    </div>
                    <span className="premium-chip">{item.ext}</span>
                  </div>
                  <div className="mt-2 text-[14px] leading-relaxed text-ink4">
                    {item.description}
                  </div>
                </div>
              </div>
              <Tip tip={item.tip}>
                <div>
                  <HBtn
                    onClick={item.onClick}
                    label={`Download ${item.ext}`}
                    loading={false}
                    disabled={false}
                  />
                </div>
              </Tip>
            </div>
          </SCard>
        ))}
      </div>
    </div>
  );
}
