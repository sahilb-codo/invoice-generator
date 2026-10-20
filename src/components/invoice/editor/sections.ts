/** Editor sections in page order. Drives the step numbers and the section navigation. */
export const EDITOR_SECTIONS = [
  { id: "section-details", label: "Details" },
  { id: "section-parties", label: "From & Bill to" },
  { id: "section-items", label: "Line items" },
  { id: "section-tax", label: "Discount & tax" },
  { id: "section-fields", label: "Custom fields" },
  { id: "section-notes", label: "Notes" },
] as const;

export type EditorSectionId = (typeof EDITOR_SECTIONS)[number]["id"];
