"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { EDITOR_SECTIONS, type EditorSectionId } from "./sections";

/** Sections whose top has scrolled above this line (px from the viewport top) count as passed. */
const ACTIVE_LINE = 170;

/** Jump links to each editor section; highlights the section currently being edited. */
export function EditorNav() {
  const [active, setActive] = useState<EditorSectionId>(EDITOR_SECTIONS[0].id);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current: EditorSectionId = EDITOR_SECTIONS[0].id;
      for (const { id } of EDITOR_SECTIONS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= ACTIVE_LINE) current = id;
      }
      setActive(atBottom ? EDITOR_SECTIONS[EDITOR_SECTIONS.length - 1].id : current);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: EditorSectionId) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setActive(id);
  }

  return (
    <nav
      aria-label="Invoice sections"
      // On desktop the bar sticks 16px below the header; the ::before strip covers that gap so
      // scrolled content does not show through between the two.
      className="bg-card/95 shadow-card ring-foreground/[0.07] supports-[backdrop-filter]:bg-card/85 lg:before:bg-background z-10 rounded-2xl p-1.5 ring-1 backdrop-blur lg:sticky lg:top-[4.5rem] lg:before:absolute lg:before:-inset-x-2 lg:before:-top-4 lg:before:-z-10 lg:before:h-4"
    >
      <ul className="flex [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {EDITOR_SECTIONS.map(({ id, label }, index) => {
          const current = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                onClick={(event) => jumpTo(event, id)}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "focus-visible:ring-ring/50 flex h-8 items-center gap-2 rounded-xl px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3",
                  current
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/65 hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "numeric grid size-4.5 place-items-center rounded-full text-[10px] font-semibold",
                    current ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
