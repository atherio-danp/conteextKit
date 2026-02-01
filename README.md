# ctxkit

Optimize documentation for LLM context efficiency.

- **Index** - Generate compact file manifests for large documentation sets, enabling retrieval-based access with minimal token cost
- **Compress** - Strip markdown formatting to reduce token usage by ~23%

## Installation

```bash
npm install -g ctxkit
```

## Usage

### Generate file index

Create a compact manifest of your documentation for LLM context:

```bash
# Create index → creates docs/index.txt
ctxkit index docs/

# Custom output location
ctxkit index docs/ -o my-index.txt
```

Output (single line, ~1KB for hundreds of files):
```
<!-- INDEX -->[docs]|root:.|{API.txt,CONFIG.txt}|guides:{setup.txt,deploy.txt}|<!-- /INDEX -->
```

The LLM sees what files exist and retrieves only what it needs — instead of loading all documentation upfront.

### Compress markdown files

Strip markdown formatting to reduce tokens:

```bash
# Compress folder → creates docs.compressed/
ctxkit compress docs/

# Custom output location
ctxkit compress docs/ -o .compressed/

# Show compression statistics
ctxkit compress docs/ --stats
```

## Typical Workflow

```bash
# 1. Compress your documentation
ctxkit compress docs/

# 2. Index the compressed files
ctxkit index docs.compressed/

# 3. Result:
#    docs.compressed/
#    ├── *.txt (compressed files, single-line)
#    └── index.txt (file manifest)
```

Then add to your `CLAUDE.md`:

```markdown
Read documentation from docs.compressed/ folder.
See docs.compressed/index.txt for available files.
```

## What it does

**Compression** removes markdown formatting while preserving content:
- Headers (`#`, `##`) → removed
- Bold/italic (`**`, `*`) → removed
- Code fences (`` ``` ``) → removed
- Lists (`-`, `1.`) → removed
- Links `[text](url)` → keeps text only
- Tables → converted to plain text
- Filler phrases → removed
- Output → single line

**Results**: ~23% token reduction (measured with GPT-4 tokenizer)

**Index** creates a compact file manifest:
```
<!-- INDEX -->[docs]|root:.|{file1.txt,file2.txt}|subdir:{file3.txt}|<!-- /INDEX -->
```

## Why?

**Large documentation sets are expensive.** Loading 100 files into LLM context costs tokens and money — even when the LLM only needs 2-3 files for the current task.

**Indexing solves this.** A compact manifest (~1KB) tells the LLM what exists. It retrieves specific files on-demand via tools like `Read`. Result: minimal upfront cost, full documentation access.

**Compression helps too.** LLMs don't need markdown formatting to understand content. Stripping `#`, `**`, `` ``` ``, and other syntax reduces token usage by ~23% per file.

## License

MIT
