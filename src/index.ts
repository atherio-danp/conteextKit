import { readdirSync, statSync } from 'fs';
import { join, relative, dirname, basename, extname } from 'path';

interface IndexOptions {
  root: string;
  name?: string;
  extensions?: string[];
  instruction?: string;
}

interface FileTree {
  [dir: string]: string[];
}

/**
 * Recursively collect files with specified extensions
 */
function collectFiles(dir: string, baseDir: string, extensions: string[]): string[] {
  const files: string[] = [];

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, baseDir, extensions));
    } else {
      const ext = extname(entry).toLowerCase();
      if (extensions.includes(ext)) {
        files.push(relative(baseDir, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  return files;
}

/**
 * Group files by directory
 */
function groupByDirectory(files: string[]): FileTree {
  const tree: FileTree = {};

  for (const file of files) {
    const dir = dirname(file);
    const name = basename(file);

    if (!tree[dir]) {
      tree[dir] = [];
    }
    tree[dir].push(name);
  }

  return tree;
}

/**
 * Generate a compressed index of a documentation folder.
 * Format: <!-- INDEX -->|[Name]|root:.|instruction|dir1:{file1,file2}|dir2:{file3}
 */
export function generateIndex(options: IndexOptions): string {
  const {
    root,
    name = 'Docs Index',
    extensions = ['.md', '.mdx', '.txt'],
    instruction = 'Read files from this folder as needed.'
  } = options;

  const files = collectFiles(root, root, extensions);
  const tree = groupByDirectory(files);

  const parts: string[] = [];

  // Header - use "." as root since index lives in the folder
  parts.push(`<!-- INDEX -->[${name}]`);
  parts.push(`root:.`);
  parts.push(instruction);

  // File tree - group by directory
  const dirs = Object.keys(tree).sort();
  for (const dir of dirs) {
    const fileList = tree[dir].sort().join(',');
    if (dir === '.') {
      parts.push(`{${fileList}}`);
    } else {
      parts.push(`${dir}:{${fileList}}`);
    }
  }

  parts.push('<!-- /INDEX -->');

  return parts.join('|');
}

/**
 * Generate a more readable multi-line index
 */
export function generateIndexReadable(options: IndexOptions): string {
  const {
    root,
    name = 'Docs Index',
    extensions = ['.md', '.mdx', '.txt'],
    instruction = 'Use retrieval to read specific files as needed.'
  } = options;

  const files = collectFiles(root, root, extensions);
  const tree = groupByDirectory(files);

  const lines: string[] = [];

  lines.push(`# ${name}`);
  lines.push(`Root: ${root}`);
  lines.push(`${instruction}`);
  lines.push('');
  lines.push('Files:');

  const dirs = Object.keys(tree).sort();
  for (const dir of dirs) {
    const displayDir = dir === '.' ? '(root)' : dir;
    lines.push(`  ${displayDir}: ${tree[dir].sort().join(', ')}`);
  }

  return lines.join('\n');
}
