import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT_FOLDER_ID = "14ZUgP1Ib4fgB2vfblViL-j9Hw51fLzeR";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const CONCURRENCY_LIMIT = 8; // Parallel HTTP workers

const outputDirectories = [
  fileURLToPath(new URL("../Client/src/data/", import.meta.url)),
  fileURLToPath(new URL("../apps/frontend/src/data/", import.meta.url)),
];

const cacheFilePath = fileURLToPath(
  new URL("./.drive-cache.json", import.meta.url),
);

function decodeDriveData(value) {
  return value
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\\//g, "/");
}

let driveCache = {};
try {
  const rawCache = await readFile(cacheFilePath, "utf8");
  driveCache = JSON.parse(rawCache);
} catch {
  driveCache = {};
}

async function saveCache() {
  try {
    await writeFile(cacheFilePath, JSON.stringify(driveCache, null, 2));
  } catch {
    // Ignore cache write errors
  }
}

async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

async function getFolderEntries(folderId) {
  if (driveCache[folderId]) {
    return driveCache[folderId];
  }

  const response = await fetch(
    `https://drive.google.com/drive/folders/${folderId}`,
  );
  if (!response.ok) {
    throw new Error(`Drive folder ${folderId} returned ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/_DRIVE_ivd'\]\s*=\s*'(.*?)';/s);
  if (!match) {
    throw new Error(
      `Could not read Drive folder ${folderId}. Ensure link sharing is public.`,
    );
  }

  const driveData = JSON.parse(decodeDriveData(match[1]));
  const entries = (driveData[0] ?? []).map((entry) => ({
    id: entry[0],
    name: entry[2],
    mimeType: entry[3],
    size: entry[4] ?? null,
  }));

  driveCache[folderId] = entries;
  return entries;
}

async function crawlFolderParallel(folderId, ancestors = []) {
  const entries = await getFolderEntries(folderId);
  const result = [];
  const subfoldersToCrawl = [];

  for (const entry of entries) {
    const folderPath = [...ancestors, entry.name];
    const item = {
      ...entry,
      parentFolderId: folderId,
      path: folderPath.join("/"),
    };
    result.push(item);

    if (entry.mimeType === FOLDER_MIME_TYPE) {
      subfoldersToCrawl.push({ id: entry.id, pathParts: folderPath });
    }
  }

  if (subfoldersToCrawl.length > 0) {
    const subfolderResults = await mapConcurrent(
      subfoldersToCrawl,
      CONCURRENCY_LIMIT,
      (sub) => crawlFolderParallel(sub.id, sub.pathParts),
    );
    for (const subItems of subfolderResults) {
      result.push(...subItems);
    }
  }

  return result;
}

function nameWithoutExtension(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

console.log("[Drive Importer] Crawling Google Drive catalog in parallel...");
const startTime = Date.now();
const items = await crawlFolderParallel(ROOT_FOLDER_ID);
await saveCache();

const imageItems = items.filter((item) => item.mimeType.startsWith("image/"));
const products = imageItems.map((image) => {
  const pathParts = image.path.split("/");
  const fileName = pathParts.pop();
  const category = pathParts.at(-1) ?? "Uncategorised";

  return {
    id: image.id,
    name: nameWithoutExtension(fileName),
    category,
    page: pathParts[0] ?? null,
    source: "google-drive",
    imageId: image.id,
    imageUrl: `https://drive.google.com/uc?export=view&id=${image.id}`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${image.id}`,
    drivePath: image.path,
  };
});

for (const dir of outputDirectories) {
  try {
    await mkdir(dir, { recursive: true });
    await Promise.all([
      writeFile(
        path.join(dir, "drive-items.json"),
        `${JSON.stringify(items, null, 2)}\n`,
      ),
      writeFile(
        path.join(dir, "drive-products.json"),
        `${JSON.stringify(products, null, 2)}\n`,
      ),
    ]);
  } catch {
    // Ignore errors
  }
}

const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(
  `[Drive Importer] Completed in ${elapsedSeconds}s! Exported ${items.length} Drive items and ${products.length} image products.`,
);
