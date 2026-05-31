import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type StoredFile = {
  url: string;
  path: string;
  originalName: string;
};

function cleanExtension(name: string, fallback: string) {
  const extension = path.extname(name).toLowerCase();
  return extension || fallback;
}

export async function saveUploadFile(
  file: File,
  folder: "videos" | "subtitles",
  fallbackExtension: string
): Promise<StoredFile> {
  const uploadId = randomUUID();
  const extension = cleanExtension(file.name, fallbackExtension);
  const fileName = `${uploadId}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const diskPath = path.join(uploadDir, fileName);
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${folder}/${fileName}`,
    path: diskPath,
    originalName: file.name
  };
}
