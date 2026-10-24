/*
 * SPDX-FileCopyrightText: 2026 CERN.
 * SPDX-FileCopyrightText: 2026 University of Münster.
 * SPDX-License-Identifier: MIT
 */

import { i18next } from "@translations/invenio_requests/i18next";

export const richEditorLabels = {
  attachFiles: i18next.t("Attach files"),
  uploadingFile: i18next.t("Uploading file..."),
  previewMathEquations: i18next.t("Preview math equations"),
  imageDescription: (filename) =>
    i18next.t("Description of {{filename}}", { filename }),
};
