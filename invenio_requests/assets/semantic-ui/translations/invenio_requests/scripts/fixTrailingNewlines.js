// This file is part of invenio-administration.
// Copyright (C) 2021-2024 Graz University of Technology.
// Copyright (C) 2025 KTH Royal Institute of Technology.
//
// Invenio-administration is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

const fs = require("fs");

const files = ["./translations.pot", "./messages/en/messages.po", "package.json"];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️ File not found: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  if (!content.endsWith("\n")) {
    fs.appendFileSync(file, "\n");
    console.log(`🔧 Appended trailing newline to: ${file}`);
  }
}
