type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };
};

export async function translateEnglishToChinese(text: string) {
  const source = text.trim();

  if (!source) {
    return "";
  }

  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|zh-CN`,
    {
      next: { revalidate: 60 * 60 * 24 * 30 }
    }
  );

  if (!response.ok) {
    return "";
  }

  const data = (await response.json()) as MyMemoryResponse;
  const translated = data.responseData?.translatedText?.trim() ?? "";

  if (!translated || translated.toLowerCase() === source.toLowerCase()) {
    return "";
  }

  return translated;
}
