
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexHtml = fs.readFileSync(
  path.join(__dirname, "..", "..", "index.html"),
  "utf-8",
);

describe("frontend/index.html metadata", () => {
  test("document.title is HappyCows", () => {
    const doc = new DOMParser().parseFromString(indexHtml, "text/html");
    expect(doc.title).toBe("HappyCows");
  });

  test("favicon points to favicon.ico", () => {
    const doc = new DOMParser().parseFromString(indexHtml, "text/html");
    const favicon = doc.querySelector('link[rel="icon"]');

    expect(favicon).not.toBeNull();
    expect(favicon.getAttribute("href")).toBe("/favicon.ico");
    expect(favicon.getAttribute("type")).toBe("image/x-icon");
  });
});
