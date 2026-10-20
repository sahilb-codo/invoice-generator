# Prompt 05 — Print and Save as PDF

> **Source:** Extracted verbatim from the master prompt supplied on 2026-10-20
> ("PHASE 6 — Print and Save as PDF").

Use the browser's native print functionality.

Requirements:

- A dedicated print stylesheet.
- Print only the invoice.
- Hide navigation, editor, toolbars, tabs, buttons, and application controls.
- Exclude hidden custom fields.
- Use A4 paper size and appropriate print margins.
- Maintain readable typography.
- Prevent table clipping where practical.
- Keep totals and footer sections together where possible.
- Support invoices spanning multiple pages.
- Ensure the printed result looks like a real business document.

Trigger `window.print()` from a user action.

Do not create a fake download button or claim a PDF was generated if no working implementation
exists.

Verify that hidden custom fields and editor controls do not appear in the print output.

Document and commit.
