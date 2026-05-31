const timePattern = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/g;

export function srtToVtt(input: string) {
  const normalized = input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (/^WEBVTT/i.test(normalized)) {
    return normalized;
  }

  return `WEBVTT\n\n${normalized
    .replace(timePattern, (_match, hours = "00", minutes, seconds, milliseconds) => {
      return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}.${milliseconds}`;
    })
    .replace(/^\d+\n(?=\d{2}:)/gm, "")}\n`;
}

export function detectSubtitleFormat(fileName: string) {
  return fileName.toLowerCase().endsWith(".srt") ? "srt" : "vtt";
}
