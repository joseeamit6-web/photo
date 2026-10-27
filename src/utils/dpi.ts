/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MM_PER_INCH = 25.4;
export const DEFAULT_DPI = 300;

/**
 * Converts millimeters to pixels at target DPI
 */
export function mmToPixels(mm: number, dpi: number = DEFAULT_DPI): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

/**
 * Converts pixels to millimeters at given DPI
 */
export function pixelsToMm(pixels: number, dpi: number = DEFAULT_DPI): number {
  return (pixels / dpi) * MM_PER_INCH;
}

/**
 * Injects 300 DPI JFIF segment into a JPEG Blob to guarantee government biometric compliance
 */
export async function injectJpegDpi(blob: Blob, dpi: number = 300): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Validate JPEG SOI marker 0xFF, 0xD8
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    return blob;
  }

  const dpiHigh = (dpi >> 8) & 0xFF;
  const dpiLow = dpi & 0xFF;

  // Check if JFIF APP0 marker already exists
  if (bytes[2] === 0xFF && bytes[3] === 0xE0) {
    const isJfif =
      bytes[6] === 0x4A && // J
      bytes[7] === 0x46 && // F
      bytes[8] === 0x49 && // I
      bytes[9] === 0x46 && // F
      bytes[10] === 0x00;

    if (isJfif) {
      // Overwrite units to inches (1) and X/Y densities
      const patched = new Uint8Array(bytes);
      patched[13] = 1; // 1 = dots per inch
      patched[14] = dpiHigh;
      patched[15] = dpiLow;
      patched[16] = dpiHigh;
      patched[17] = dpiLow;
      return new Blob([patched], { type: 'image/jpeg' });
    }
  }

  // Construct new JFIF APP0 marker block (18 bytes total)
  // 0xFF, 0xE0, length (0x00, 0x10), 'JFIF\0', version 1.1, units=1, X=300, Y=300, thumb=0,0
  const jfifBlock = new Uint8Array([
    0xFF, 0xE0,
    0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01,
    0x01,
    dpiHigh, dpiLow,
    dpiHigh, dpiLow,
    0x00, 0x00
  ]);

  const output = new Uint8Array(2 + jfifBlock.length + (bytes.length - 2));
  // SOI
  output[0] = 0xFF;
  output[1] = 0xD8;
  // APP0
  output.set(jfifBlock, 2);
  // Remainder of JPEG
  output.set(bytes.subarray(2), 2 + jfifBlock.length);

  return new Blob([output], { type: 'image/jpeg' });
}

/**
 * Standard CRC32 calculation table for PNG chunks
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Injects 300 DPI physical pixel resolution (pHYs chunk) into a PNG Blob
 */
export async function injectPngDpi(blob: Blob, dpi: number = 300): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check PNG signature: 137 80 78 71 13 10 26 10
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4E ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0D ||
    bytes[5] !== 0x0A ||
    bytes[6] !== 0x1A ||
    bytes[7] !== 0x0A
  ) {
    return blob;
  }

  // 300 DPI in pixels per meter: 300 / 0.0254 ≈ 11811
  const ppm = Math.round((dpi / 0.0254));
  const ppmBytes = [
    (ppm >>> 24) & 0xFF,
    (ppm >>> 16) & 0xFF,
    (ppm >>> 8) & 0xFF,
    ppm & 0xFF,
  ];

  // pHYs data: 4 bytes X, 4 bytes Y, 1 byte unit (1 = meter)
  const chunkData = new Uint8Array([
    ...ppmBytes,
    ...ppmBytes,
    1
  ]);

  // CRC input is chunk type 'pHYs' + chunk data
  const crcInput = new Uint8Array(4 + chunkData.length);
  crcInput.set([0x70, 0x48, 0x59, 0x73], 0); // 'pHYs'
  crcInput.set(chunkData, 4);

  const crc = calculateCrc32(crcInput);
  const crcBytes = [
    (crc >>> 24) & 0xFF,
    (crc >>> 16) & 0xFF,
    (crc >>> 8) & 0xFF,
    crc & 0xFF,
  ];

  // Full chunk: 4 bytes length (9) + 4 bytes type + 9 bytes data + 4 bytes CRC = 21 bytes
  const physChunk = new Uint8Array(4 + 4 + 9 + 4);
  physChunk[0] = 0; physChunk[1] = 0; physChunk[2] = 0; physChunk[3] = 9;
  physChunk.set([0x70, 0x48, 0x59, 0x73], 4);
  physChunk.set(chunkData, 8);
  physChunk.set(crcBytes, 17);

  // In PNG, IHDR is always the first chunk (starts at index 8, length is at bytes 8..11, IHDR total is 8 + 4 + 4 + 13 + 4 = 33)
  const ihdrEndIndex = 33;
  const output = new Uint8Array(bytes.length + physChunk.length);
  output.set(bytes.subarray(0, ihdrEndIndex), 0);
  output.set(physChunk, ihdrEndIndex);
  output.set(bytes.subarray(ihdrEndIndex), ihdrEndIndex + physChunk.length);

  return new Blob([output], { type: 'image/png' });
}

/**
 * Downloads a Blob to the user's browser with a specified filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
