/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  description: string;
  recommendedBg: string;
  faceHeightRatioMin: number; // e.g. 0.70 (70% of photo)
  faceHeightRatioMax: number; // e.g. 0.80 (80% of photo)
}

export interface PaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  standard: string;
}

export interface ImageAdjustments {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -50 to 50
  sharpness: number; // 0 to 100
  rotation: number; // -180 to 180
  flipHorizontal: boolean;
}

export interface SheetConfig {
  paperSizeId: string;
  copyCount: number; // 2, 4, 6, 8, 12, 16, or -1 for Auto Max
  spacingMm: number; // gap between photos in mm
  marginMm: number; // paper edge margin in mm
  showCutGuidelines: boolean; // dashed scissor guide
  showBorder: boolean; // subtle hairline photo border
  borderColor: string;
  orientation: 'auto' | 'portrait' | 'landscape';
}

export interface BgColorOption {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export interface GridSlot {
  id: string;
  slotIndex: number;
  row: number;
  col: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  hasPhoto: boolean;
  isRotated?: boolean;
}


