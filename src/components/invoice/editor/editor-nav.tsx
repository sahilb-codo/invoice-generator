"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { EDITOR_SECTIONS, type EditorSectionId } from "./sections";

/** Sections whose top has scrolled above this line (px from the viewport top) count as passed. */
const ACTIVE_LINE = 170;
/** Fallback for browsers without the `scrollend` event. */
const SCROLL_LOCK_MS = 1200;

/** Jump links to each editor section; highlights the section currently being edited. */
export function EditorNav() {
  const [active, setActive] = useState<EditorSectionId>(EDITOR_SECTIONS[0].id);
  // While a jump is scrolling, the highlight stays on the target instead of passing every
  // section on the way.
  const jumpTarget = useRef<EditorSectionId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<EditorSectionId, HTMLAnchorElement>());

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      if (jumpTarget.current) return;
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

  // Slide the highlight pill under the active link and keep that link visible in the bar.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    function place(animate: boolean) {
      const link = linkRefs.current.get(active);
      if (!link || !list || !indicator) return;
      indicator.style.transitionDuration = animate ? "" : "0s";
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.style.opacity = "1";
      const left = link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2;
      list.scrollTo({ left, behavior: animate ? "smooth" : "auto" });
    }

    place(indicator.style.opacity === "1");
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: EditorSectionId) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    jumpTarget.current = id;
    setActive(id);
    let timer = 0;
    const release = () => {
      jumpTarget.current = null;
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release, { once: true });
    timer = window.setTimeout(release, reduceMotion ? 100 : SCROLL_LOCK_MS);

    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Invoice sections"
      // On desktop the bar sticks 16px below the header; the ::before strip covers that gap so
      // scrolled content does not show through between the two.
      className="bg-card/95 shadow-card ring-foreground/[0.07] supports-[backdrop-filter]:bg-card/85 lg:before:bg-background z-10 rounded-2xl p-1.5 ring-1 backdrop-blur lg:sticky lg:top-[4.5rem] lg:before:absolute lg:before:-inset-x-2 lg:before:-top-4 lg:before:-z-10 lg:before:h-4"
    >
      {/* Scroll container and offsetParent for the links, so the pill scrolls with them. */}
      <div
        ref={listRef}
        className="relative [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        <span
          ref={indicatorRef}
          aria-hidden
          className="bg-primary pointer-events-none absolute top-0 left-0 h-8 rounded-xl opacity-0 shadow-sm transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
        />
        <ul className="flex gap-1">
          {EDITOR_SECTIONS.map(({ id, label }, index) => {
            const current = active === id;
            return (
              <li key={id} className="shrink-0">
                <a
                  ref={(node) => {
                    if (node) linkRefs.current.set(id, node);
                    else linkRefs.current.delete(id);
                  }}
                  href={`#${id}`}
                  onClick={(event) => jumpTo(event, id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 relative flex h-8 items-center gap-2 rounded-xl px-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-3",
                    current
                      ? "text-primary-foreground"
                      : "text-foreground/65 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "numeric grid size-4.5 place-items-center rounded-full text-[10px] font-semibold transition-colors duration-300",
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
      </div>
    </nav>
  );
}
