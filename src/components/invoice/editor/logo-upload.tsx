"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { InvoiceData } from "@/lib/invoice/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
/** Logos are stored inline as data URLs, so keep them small. */
const MAX_BYTES = 256 * 1024;

export function LogoUpload() {
  const { control, setValue } = useFormContext<InvoiceData>();
  const logo = useWatch({ control, name: "business.logoDataUrl" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  function setLogo(value: string) {
    setValue("business.logoDataUrl", value, { shouldDirty: true });
  }

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, WebP or SVG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Logo must be 256 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && setLogo(reader.result);
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-foreground/80 flex items-center gap-2 text-xs font-medium">
        Logo <span className="text-muted-foreground font-normal">(optional)</span>
      </span>
      <div className="flex items-center gap-3">
        <div className="bg-muted/60 grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
            <img
              src={logo}
              alt="Business logo preview"
              className="max-h-12 max-w-12 object-contain"
            />
          ) : (
            <ImagePlus className="text-muted-foreground size-5" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            aria-describedby={`${id}-help`}
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = ""; // allow re-selecting the same file
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => inputRef.current?.click()}
          >
            {logo ? "Replace" : "Upload logo"}
          </Button>
          {logo ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setLogo("")}
              className="text-muted-foreground"
            >
              <Trash2 aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : (
        <p id={`${id}-help`} className="text-muted-foreground text-xs">
          PNG, JPG, WebP or SVG, up to 256 KB.
        </p>
      )}
    </div>
  );
}
