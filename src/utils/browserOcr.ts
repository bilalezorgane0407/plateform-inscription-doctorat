type OcrWorker = {
  recognize: (image: HTMLCanvasElement | File) => Promise<{ data: { text: string; confidence: number } }>;
  terminate: () => Promise<void>;
};
type TesseractGlobal = { createWorker: (languages: string, oem?: number, options?: object) => Promise<OcrWorker> };
type PdfPage = { getViewport: (args: { scale: number }) => { width: number; height: number }; render: (args: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } };
type PdfGlobal = { getDocument: (args: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (page: number) => Promise<PdfPage> }> }; GlobalWorkerOptions: { workerSrc: string } };

declare global { interface Window { Tesseract?: TesseractGlobal; pdfjsLib?: PdfGlobal } }

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-demo-ocr="${src}"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    const script = existing || document.createElement('script');
    script.src = src;
    script.dataset.demoOcr = src;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = () => reject(new Error('Le moteur OCR n’a pas pu être chargé. Vérifiez la connexion Internet puis réessayez.'));
    if (!existing) document.head.appendChild(script);
  });
}

async function loadTesseract(): Promise<TesseractGlobal> {
  if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
  if (!window.Tesseract) throw new Error('Le moteur OCR est indisponible.');
  return window.Tesseract;
}

async function pdfPages(file: File): Promise<HTMLCanvasElement[]> {
  if (!window.pdfjsLib) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  if (!window.pdfjsLib) throw new Error('Le lecteur PDF est indisponible.');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const canvases: HTMLCanvasElement[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Impossible de préparer une page du PDF.');
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    canvases.push(canvas);
  }
  return canvases;
}

export async function extractTextFromDocument(file: File, onProgress: (progress: number) => void): Promise<{ text: string; confidence: number; pages: Array<{ page: number; text: string; confidence: number }> }> {
  const tesseract = await loadTesseract();
  const pages = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    ? await pdfPages(file)
    : [await imageToCanvas(file)];
  if (!pages.length) throw new Error('Le document ne contient aucune page lisible.');
  const worker = await tesseract.createWorker('fra+ara', 1, { logger: (message: { progress?: number }) => onProgress(message.progress || 0) });
  try {
    const results: string[] = [];
    const confidences: number[] = [];
    const pageResults: Array<{ page: number; text: string; confidence: number }> = [];
    for (let i = 0; i < pages.length; i += 1) {
      const result = await worker.recognize(pages[i]);
      results.push(result.data.text.trim());
      confidences.push(result.data.confidence);
      pageResults.push({ page: i + 1, text: result.data.text.trim(), confidence: result.data.confidence });
      onProgress((i + 1) / pages.length);
    }
    const text = results.filter(Boolean).join('\n\n');
    if (!text) throw new Error('Aucun texte lisible détecté. Essayez une image plus nette ou un PDF de meilleure qualité.');
    return { text, confidence: confidences.reduce((sum, value) => sum + value, 0) / confidences.length, pages: pageResults };
  } finally { await worker.terminate(); }
}

function imageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) { URL.revokeObjectURL(url); reject(new Error('Impossible de lire cette image.')); return; }
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Le fichier image ne peut pas être ouvert.')); };
    image.src = url;
  });
}
