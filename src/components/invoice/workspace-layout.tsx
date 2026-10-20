"use client";

import { Eye, PencilLine } from "lucide-react";
import { useState } from "react";

import { EditorNav } from "@/components/invoice/editor/editor-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkspaceLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

/**
 * Editor (≈55%) beside a sticky live preview (≈45%) on desktop;
 * Editor / Preview tabs on smaller screens.
 *
 * Both panels are always mounted (forceMount) so the editor form is rendered
 * exactly once; inactive tabs are only hidden with CSS below the lg breakpoint.
 */
export function WorkspaceLayout({ editor, preview }: WorkspaceLayoutProps) {
  const [tab, setTab] = useState("editor");

  return (
    <Tabs
      data-print="root"
      value={tab}
      onValueChange={(value) => {
        setTab(value);
        // Start each tab at the top instead of mid-way down the previous tab's scroll position.
        window.scrollTo({ top: 0 });
      }}
      className="mx-auto w-full max-w-[1440px] gap-0 lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-start lg:gap-8 lg:px-8 lg:py-6"
    >
      <div
        data-print="hide"
        className="bg-background/90 sticky top-14 z-20 border-b px-4 py-2.5 backdrop-blur sm:px-6 lg:hidden"
      >
        <TabsList className="h-9! w-full">
          <TabsTrigger value="editor">
            <PencilLine aria-hidden />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye aria-hidden />
            Preview
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="editor"
        forceMount
        data-print="hide"
        aria-label="Invoice editor"
        className="space-y-4 px-4 py-5 data-[state=inactive]:hidden sm:px-6 lg:p-0 lg:data-[state=inactive]:block"
      >
        <PanelHeading
          icon={<PencilLine aria-hidden />}
          title="Invoice editor"
          description="Work through each step — the preview updates as you type."
        />
        <EditorNav />
        {editor}
      </TabsContent>

      <TabsContent
        value="preview"
        forceMount
        data-print="region"
        aria-label="Invoice preview"
        className="space-y-4 px-4 py-5 data-[state=inactive]:hidden sm:px-6 lg:sticky lg:top-20 lg:p-0 lg:data-[state=inactive]:block"
      >
        <PanelHeading
          icon={<Eye aria-hidden />}
          title="Live preview"
          description="Exactly what your customer receives."
          aside={
            <span className="bg-success-soft text-success ring-success/20 inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1 ring-inset">
              <span className="bg-success size-1.5 rounded-full" aria-hidden />
              Live
            </span>
          }
        />
        {/* The "desk" the paper sits on; flattened to plain white when printing. */}
        <div
          data-print="region"
          className="bg-desk ring-foreground/[0.05] [scrollbar-width:thin] rounded-2xl p-3 ring-1 ring-inset sm:p-6 lg:max-h-[calc(100dvh-10.5rem)] lg:overflow-y-auto lg:p-5"
        >
          {preview}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function PanelHeading({
  icon,
  title,
  description,
  aside,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  aside?: React.ReactNode;
}) {
  return (
    <div data-print="hide" className="hidden items-center gap-3 lg:flex">
      <span className="bg-card text-primary shadow-card ring-foreground/[0.07] grid size-9 place-items-center rounded-xl ring-1 [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base leading-6 font-semibold tracking-tight">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {aside}
    </div>
  );
}
