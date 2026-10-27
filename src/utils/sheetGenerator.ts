/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { PaperSize, PassportPreset, SheetConfig } from '../types.ts';
import { mmToPixels, DEFAULT_DPI, injectJpegDpi, injectPngDpi, downloadBlob } from './dpi.ts';

export interface LayoutCalculation {
  cols: number;
  rows: number;
  totalFit: number;
  actualCopies: number;
  isLandscape: boolean;
  startXmm: number;
  startYmm: number;
  paperWidthMm: number;
  paperHeightMm: number;
}

/**
 * Calculates optimal grid packing for passport photos on the chosen paper size
 */
export function calculateSheetLayout(
  preset: PassportPreset,
  paper: PaperSize,
  config: SheetConfig
): LayoutCalculation {
  const photoW = preset.widthMm;
  const photoH = preset.heightMm;
  const spacing = config.spacingMm;
  const margin = config.marginMm;

  function evaluateOrientation(pWidth: number, pHeight: number) {
    const availW = pWidth - 2 * margin;
    const availH = pHeight - 2 * margin;

    const cols = Math.max(1, Math.floor((availW + spacing) / (photoW + spacing)));
    const rows = Math.max(1, Math.floor((availH + spacing) / (photoH + spacing)));
    const totalFit = cols * rows;

    return { cols, rows, totalFit, pWidth, pHeight };
  }

  // Evaluate portrait vs landscape
  const portraitEval = evaluateOrientation(
    Math.min(paper.widthMm, paper.heightMm),
    Math.max(paper.widthMm, paper.heightMm)
  );

  const landscapeEval = evaluateOrientation(
    Math.max(paper.widthMm, paper.heightMm),
    Math.min(paper.widthMm, paper.heightMm)
  );

  let chosen = portraitEval;
  let isLandscape = false;

  if (config.orientation === 'landscape') {
    chosen = landscapeEval;
    isLandscape = true;
  } else if (config.orientation === 'portrait') {
    chosen = portraitEval;
    isLandscape = false;
  } else {
    // Auto mode: choose orientation that accommodates the desired copies better or packs more
    if (config.copyCount > 0) {
      if (portraitEval.totalFit >= config.copyCount && landscapeEval.totalFit < config.copyCount) {
        chosen = portraitEval;
        isLandscape = false;
      } else if (landscapeEval.totalFit >= config.copyCount && portraitEval.totalFit < config.copyCount) {
        chosen = landscapeEval;
        isLandscape = true;
      } else {
        // Both fit or neither fits: pick the one with higher density
        if (landscapeEval.totalFit > portraitEval.totalFit) {
          chosen = landscapeEval;
          isLandscape = true;
        } else {
          chosen = portraitEval;
          isLandscape = false;
        }
      }
    } else {
      // Auto Max
      if (landscapeEval.totalFit > portraitEval.totalFit) {
        chosen = landscapeEval;
        isLandscape = true;
      } else {
        chosen = portraitEval;
        isLandscape = false;
      }
    }
  }

  const actualCopies = config.copyCount > 0 ? Math.min(config.copyCount, chosen.totalFit) : chosen.totalFit;

  // Determine actual cols and rows needed for actualCopies
  let activeCols = chosen.cols;
  let activeRows = Math.ceil(actualCopies / activeCols);
  if (activeRows === 1 && actualCopies < activeCols) {
    activeCols = actualCopies;
  }

  const gridWidthMm = activeCols * photoW + (activeCols - 1) * spacing;
  const gridHeightMm = activeRows * photoH + (activeRows - 1) * spacing;

  const startXmm = Math.max(margin, (chosen.pWidth - gridWidthMm) / 2);
  const startYmm = Math.max(margin, (chosen.pHeight - gridHeightMm) / 2);

  return {
    cols: activeCols,
    rows: activeRows,
    totalFit: chosen.totalFit,
    actualCopies,
    isLandscape,
    startXmm,
    startYmm,
    paperWidthMm: chosen.pWidth,
    paperHeightMm: chosen.pHeight,
  };
}

/**
 * Generates high-DPI (300 DPI) print sheet canvas
 */
export function generatePrintSheetCanvas(
  photoCanvas: HTMLCanvasElement,
  preset: PassportPreset,
  paper: PaperSize,
  config: SheetConfig,
  dpi: number = DEFAULT_DPI
): HTMLCanvasElement {
  const layout = calculateSheetLayout(preset, paper, config);

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = mmToPixels(layout.paperWidthMm, dpi);
  sheetCanvas.height = mmToPixels(layout.paperHeightMm, dpi);

  const ctx = sheetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sheetCanvas;

  // Crisp white paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const photoWPx = mmToPixels(preset.widthMm, dpi);
  const photoHPx = mmToPixels(preset.heightMm, dpi);
  const spacingPx = mmToPixels(config.spacingMm, dpi);
  const startXPx = mmToPixels(layout.startXmm, dpi);
  const startYPx = mmToPixels(layout.startYmm, dpi);

  let drawnCount = 0;

  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      if (drawnCount >= layout.actualCopies) break;

      const x = Math.round(startXPx + c * (photoWPx + spacingPx));
      const y = Math.round(startYPx + r * (photoHPx + spacingPx));

      // Draw photo
      ctx.drawImage(photoCanvas, 0, 0, photoCanvas.width, photoCanvas.height, x, y, photoWPx, photoHPx);

      // Draw optional hairline border
      if (config.showBorder) {
        ctx.strokeStyle = config.borderColor || '#E4E4E7';
        ctx.lineWidth = Math.max(1, Math.round(dpi / 300));
        ctx.strokeRect(x, y, photoWPx, photoHPx);
      }

      // Draw scissor / cutting guides
      if (config.showCutGuidelines) {
        drawCutMarks(ctx, x, y, photoWPx, photoHPx, dpi);
      }

      drawnCount++;
    }
  }

  // Watermark or subtle print metadata outside margin
  ctx.fillStyle = '#A1A1AA';
  ctx.font = `${Math.round(dpi / 35)}px sans-serif`;
  ctx.textAlign = 'left';
  const metaText = `${preset.name} (${preset.widthMm}x${preset.heightMm}mm) · ${layout.actualCopies} Photos · 300 DPI · pic.amitjoshi.info.np`;
  ctx.fillText(metaText, startXPx, sheetCanvas.height - Math.round(startYPx / 2));

  return sheetCanvas;
}

/**
 * Draws professional corner crosshairs / cut tick marks around each photo
 */
function drawCutMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dpi: number
) {
  const tickLen = Math.round(mmToPixels(2.5, dpi)); // 2.5mm tick marks
  ctx.save();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - tickLen, y);
  ctx.lineTo(x, y);
  ctx.moveTo(x, y - tickLen);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + tickLen, y);
  ctx.moveTo(x + w, y - tickLen);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - tickLen, y + h);
  ctx.lineTo(x, y + h);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h + tickLen);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w + tickLen, y + h);
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w, y + h + tickLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Generates an exact millimeter-scaled PDF print sheet using jsPDF
 */
export function exportSheetAsPdf(
  sheetCanvas: HTMLCanvasElement,
  paper: PaperSize,
  layout: LayoutCalculation,
  filename: string = 'passport-print-sheet.pdf'
): void {
  const orientation = layout.isLandscape ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
  });

  const imgData = sheetCanvas.toDataURL('image/jpeg', 0.98);
  doc.addImage(imgData, 'JPEG', 0, 0, layout.paperWidthMm, layout.paperHeightMm);
  doc.save(filename);
}

/**
 * Exports single photo or print sheet as true 300 DPI image
 */
export async function exportCanvasAsDpiImage(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png',
  filename: string,
  dpi: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 1.0 : undefined;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve();
        return;
      }

      let finalBlob = blob;
      if (format === 'jpeg') {
        finalBlob = await injectJpegDpi(blob, dpi);
      } else {
        finalBlob = await injectPngDpi(blob, dpi);
      }

      downloadBlob(finalBlob, filename);
      resolve();
    }, mime, quality);
  });
}
