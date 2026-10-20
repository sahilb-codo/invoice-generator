import type { CustomField } from "./types";

/** Suggested labels offered as one-click additions in the editor. */
export const CUSTOM_FIELD_SUGGESTIONS = [
  "Purchase Order",
  "Project",
  "Department",
  "Reference",
] as const;

/**
 * Fields that belong on the invoice document (preview, print and email):
 * visible and with a label. Hidden fields are kept in the data but never rendered.
 */
export function getVisibleCustomFields(fields: CustomField[] | undefined): CustomField[] {
  return (fields ?? []).filter((field) => field.visible && field.label.trim() !== "");
}
