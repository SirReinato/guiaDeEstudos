import * as pdfjsLib from "pdfjs-dist";

// Configura o worker do PDF.js a partir do CDN cdnjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extrairTextoDeArquivo = async (file: File): Promise<string> => {
  // Se for arquivo de texto simples (.txt)
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return await file.text();
  }

  // Se for PDF
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    // Limitar até as primeiras 30 páginas para não sobrecarregar
    const maxPages = Math.min(pdf.numPages, 30);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += `\n--- PÁGINA ${pageNum} ---\n` + pageText;
    }

    return fullText;
  }

  throw new Error("Formato não suportado. Por favor, envie um arquivo .pdf ou .txt.");
};
