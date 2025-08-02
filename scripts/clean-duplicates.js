#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const filePath = "client/contexts/TranslationContext.tsx";

console.log("Cleaning duplicate keys from TranslationContext.tsx...");

// Read the file
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

// Track seen keys for each language section
let seenKeys = new Set();
let cleanedLines = [];
let currentLanguage = "";
let insideLanguageSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect language section start
  if (
    line.includes("pt-BR:") ||
    line.includes("en-US:") ||
    line.includes("es-ES:")
  ) {
    seenKeys.clear(); // Reset for new language
    insideLanguageSection = true;
    currentLanguage = line.includes("pt-BR:")
      ? "pt-BR"
      : line.includes("en-US:")
        ? "en-US"
        : "es-ES";
    console.log(`Starting ${currentLanguage} section at line ${i + 1}`);
  }

  // Detect end of language section
  if (insideLanguageSection && line.trim() === "},") {
    insideLanguageSection = false;
    console.log(
      `Ended ${currentLanguage} section at line ${i + 1}, processed ${seenKeys.size} unique keys`,
    );
  }

  if (insideLanguageSection && line.includes(":")) {
    // Extract key from line like "    key: "value","
    const keyMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];

      if (seenKeys.has(key)) {
        console.log(
          `Removing duplicate key "${key}" at line ${i + 1} in ${currentLanguage}`,
        );
        continue; // Skip this line
      } else {
        seenKeys.add(key);
      }
    }
  }

  cleanedLines.push(line);
}

// Write cleaned content back
const cleanedContent = cleanedLines.join("\n");
fs.writeFileSync(filePath, cleanedContent);

console.log(
  `Cleaning complete! Removed ${lines.length - cleanedLines.length} duplicate lines.`,
);
console.log(
  `Original: ${lines.length} lines, Cleaned: ${cleanedLines.length} lines`,
);
