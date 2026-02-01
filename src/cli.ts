#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, basename, dirname, extname, resolve } from 'path';
import { compress } from './compress.js';
import { calculateStats, formatStats, CompressionStats } from './stats.js';
import { generateIndex } from './index.js';

interface CompressOptions {
  output?: string;
  stats: boolean;
}

interface IndexOptions {
  output?: string;
}

function printHelp(): void {
  console.log(`
ctxkit - Pre-compress markdown documentation for LLM token efficiency

Usage:
  ctxkit compress <folder>       Compress all markdown files in folder
  ctxkit index <folder>          Generate index of folder contents

Compress:
  ctxkit compress docs/                  → creates docs.compressed/
  ctxkit compress docs/ -o .compressed/  → creates .compressed/
  ctxkit compress docs/ --stats          → show compression statistics

Index:
  ctxkit index docs/                     → creates docs/index.txt
  ctxkit index docs/ -o my-index.txt     → creates my-index.txt

Typical Workflow:
  ctxkit compress docs/                  # Step 1: compress
  ctxkit index docs.compressed/          # Step 2: index compressed files

Options:
  -o, --output <path>    Custom output location
  --stats                Show compression statistics (compress only)
  -h, --help             Show this help message
`);
}

function parseArgs(args: string[]): { input: string; output?: string; stats: boolean } {
  let input = '';
  let output: string | undefined;
  let stats = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-o' || arg === '--output') {
      output = args[++i];
    } else if (arg === '--stats') {
      stats = true;
    } else if (!arg.startsWith('-')) {
      input = arg;
    }
  }

  return { input, output, stats };
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function getMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      if (isDirectory(fullPath)) {
        walk(fullPath);
      } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getOutputPath(inputPath: string, inputBase: string, outputBase: string): string {
  const relativePath = inputPath.slice(inputBase.length);
  const outputName = relativePath.replace(/\.mdx?$/, '.txt');
  return join(outputBase, outputName);
}

function processCompress(input: string, options: CompressOptions): void {
  const inputPath = resolve(input);

  if (!isDirectory(inputPath)) {
    console.error('Error: compress requires a folder, not a file');
    console.error('Usage: ctxkit compress <folder>');
    process.exit(1);
  }

  // Default output: inputfolder.compressed/
  const inputName = basename(inputPath);
  const parentDir = dirname(inputPath);
  const outputPath = options.output
    ? resolve(options.output)
    : join(parentDir, `${inputName}.compressed`);

  const files = getMarkdownFiles(inputPath);

  if (files.length === 0) {
    console.error('No markdown files found in folder');
    process.exit(1);
  }

  ensureDir(outputPath);

  const stats: CompressionStats[] = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const compressed = compress(content);
    const outFile = getOutputPath(file, inputPath, outputPath);

    ensureDir(dirname(outFile));
    writeFileSync(outFile, compressed);

    if (options.stats) {
      stats.push(calculateStats(file, content, compressed));
    }
  }

  console.log(`Compressed ${files.length} files → ${outputPath}`);

  if (options.stats && stats.length > 0) {
    console.log(formatStats(stats));
  }
}

function processIndex(input: string, options: IndexOptions): void {
  const inputPath = resolve(input);

  if (!isDirectory(inputPath)) {
    console.error('Error: index requires a folder, not a file');
    console.error('Usage: ctxkit index <folder>');
    process.exit(1);
  }

  // Default output: inputfolder/index.txt
  const outputPath = options.output
    ? resolve(options.output)
    : join(inputPath, 'index.txt');

  const indexContent = generateIndex({
    root: inputPath,
    name: basename(inputPath)
  });

  ensureDir(dirname(outputPath));
  writeFileSync(outputPath, indexContent);

  console.log(`Index created → ${outputPath}`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);
  const { input, output, stats } = parseArgs(commandArgs);

  if (!input) {
    console.error(`Error: No folder specified`);
    console.error(`Usage: ctxkit ${command} <folder>`);
    process.exit(1);
  }

  if (!existsSync(input)) {
    console.error(`Error: Folder not found: ${input}`);
    process.exit(1);
  }

  switch (command) {
    case 'compress':
      processCompress(input, { output, stats });
      break;

    case 'index':
      processIndex(input, { output });
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
