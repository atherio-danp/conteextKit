import { encode } from 'gpt-tokenizer';

/**
 * Count tokens using actual tokenizer (GPT-4 tokenizer as proxy for Claude).
 */
export function countTokens(text: string): number {
  return encode(text).length;
}

export interface CompressionStats {
  file: string;
  originalChars: number;
  compressedChars: number;
  originalTokens: number;
  compressedTokens: number;
  charReduction: number;
  tokenReduction: number;
}

export function calculateStats(
  file: string,
  original: string,
  compressed: string
): CompressionStats {
  const originalChars = original.length;
  const compressedChars = compressed.length;
  const originalTokens = countTokens(original);
  const compressedTokens = countTokens(compressed);

  const charReduction = originalChars > 0
    ? ((originalChars - compressedChars) / originalChars) * 100
    : 0;

  const tokenReduction = originalTokens > 0
    ? ((originalTokens - compressedTokens) / originalTokens) * 100
    : 0;

  return {
    file,
    originalChars,
    compressedChars,
    originalTokens,
    compressedTokens,
    charReduction,
    tokenReduction
  };
}

export function formatStats(stats: CompressionStats[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('Compression Statistics (using GPT-4 tokenizer)');
  lines.push('='.repeat(75));
  lines.push('');

  let totalOriginalChars = 0;
  let totalCompressedChars = 0;
  let totalOriginalTokens = 0;
  let totalCompressedTokens = 0;

  for (const stat of stats) {
    totalOriginalChars += stat.originalChars;
    totalCompressedChars += stat.compressedChars;
    totalOriginalTokens += stat.originalTokens;
    totalCompressedTokens += stat.compressedTokens;

    lines.push(`${stat.file}`);
    lines.push(`  Original:   ${stat.originalChars.toLocaleString()} chars | ${stat.originalTokens.toLocaleString()} tokens`);
    lines.push(`  Compressed: ${stat.compressedChars.toLocaleString()} chars | ${stat.compressedTokens.toLocaleString()} tokens`);
    lines.push(`  Reduction:  ${stat.charReduction.toFixed(1)}% chars | ${stat.tokenReduction.toFixed(1)}% tokens`);
    lines.push('');
  }

  if (stats.length > 1) {
    const totalCharReduction = totalOriginalChars > 0
      ? ((totalOriginalChars - totalCompressedChars) / totalOriginalChars) * 100
      : 0;
    const totalTokenReduction = totalOriginalTokens > 0
      ? ((totalOriginalTokens - totalCompressedTokens) / totalOriginalTokens) * 100
      : 0;

    lines.push('-'.repeat(75));
    lines.push(`TOTAL`);
    lines.push(`  Original:   ${totalOriginalChars.toLocaleString()} chars | ${totalOriginalTokens.toLocaleString()} tokens`);
    lines.push(`  Compressed: ${totalCompressedChars.toLocaleString()} chars | ${totalCompressedTokens.toLocaleString()} tokens`);
    lines.push(`  Reduction:  ${totalCharReduction.toFixed(1)}% chars | ${totalTokenReduction.toFixed(1)}% tokens`);
    lines.push(`  Tokens saved: ${(totalOriginalTokens - totalCompressedTokens).toLocaleString()}`);
  }

  return lines.join('\n');
}
