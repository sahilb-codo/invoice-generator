"use client";

import { Eye, PencilLine } from "lucide-react";
import { useState } from "react";

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
      value={tab}
      onValueChange={setTab}
      className="mx-auto w-full max-w-[1440px] gap-0 lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-start lg:gap-8 lg:px-8 lg:py-8"
    >
      <div className="bg-background/95 sticky top-14 z-20 border-b px-4 py-2.5 backdrop-blur sm:px-6 lg:hidden">
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
        aria-label="Invoice editor"
        className="px-4 py-5 data-[state=inactive]:hidden sm:px-6 lg:p-0 lg:data-[state=inactive]:block"
      >
        {editor}
      </TabsContent>

      <TabsContent
        value="preview"
        forceMount
        aria-label="Invoice preview"
        className="px-4 py-5 data-[state=inactive]:hidden sm:px-6 lg:sticky lg:top-22 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:p-0 lg:pb-2 lg:data-[state=inactive]:block"
      >
        {preview}
      </TabsContent>
    </Tabs>
  );
}
