/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
  isExperimentalHandwriting: boolean;
  unreadableSegmentsCount: number;
}

export type OCRProgressCallback = (status: string, progress: number) => void;

/**
 * Perform client-side OCR on an image file or Base64 data URL.
 * Guarantees 100% local, private processing without transmitting image data over the network.
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob,
  isHandwriting: boolean = false,
  onProgress?: OCRProgressCallback
): Promise<OCRResult> {
  const worker = await createWorker('eng');

  try {
    if (onProgress) {
      onProgress('Initializing OCR engine...', 10);
    }

    const ret = await worker.recognize(imageSource, {}, {
      // In tesseract.js, progress can be monitored if needed
    });

    if (onProgress) {
      onProgress('Synthesizing confidence maps...', 90);
    }

    const { data } = ret;
    const confidence = Math.round(data.confidence || 0);

    // If handwriting mode is enabled, inspect words with low confidence (< 45)
    // and flag them as [unreadable] instead of allowing garbled hallucinations
    let formattedText = data.text;
    let unreadableCount = 0;

    const anyData = data as any;
    if (isHandwriting && anyData.words && Array.isArray(anyData.words) && anyData.words.length > 0) {
      const filteredWords = anyData.words.map((w: any) => {
        if (typeof w.confidence === 'number' && w.confidence < 45 && w.text && w.text.trim().length > 1) {
          unreadableCount++;
          return `[unreadable]`;
        }
        return w.text || '';
      });
      formattedText = filteredWords.join(' ');
    }

    if (onProgress) {
      onProgress('Extraction complete', 100);
    }

    const calculatedWordCount = anyData.words && Array.isArray(anyData.words)
      ? anyData.words.length
      : formattedText.split(/\s+/).filter(Boolean).length;

    return {
      text: formattedText.trim(),
      confidence,
      wordCount: calculatedWordCount,
      isExperimentalHandwriting: isHandwriting,
      unreadableSegmentsCount: unreadableCount,
    };
  } finally {
    await worker.terminate();
  }
}
