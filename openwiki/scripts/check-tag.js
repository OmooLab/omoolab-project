#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function showHelp() {
  console.log(`Usage: check-tag.js [OPTIONS] PATHS...

Extract and count all tags from markdown files.

PATHS...               One or more directories or files to check
                       (directories are scanned recursively for .md files)

OPTIONS:
  -h, --help            Show this help message
  -d, --detail          Show which files each tag appears in

EXAMPLES:
  check-tag.js openwiki/concepts/
  check-tag.js openwiki/ references/
  check-tag.js openwiki/notes/file.md
  check-tag.js -d openwiki/concepts/`);
}

function extractTags(content) {
  const tags = [];

  let inFrontmatter = false;
  let frontmatterEnd = -1;

  if (content.startsWith('---')) {
    const endMatch = content.indexOf('---', 3);
    if (endMatch !== -1) {
      inFrontmatter = true;
      frontmatterEnd = endMatch;
    }
  }

  if (inFrontmatter) {
    const frontmatter = content.substring(0, frontmatterEnd);
    const tagsMatch = frontmatter.match(/^tags:\s*$/m);
    if (tagsMatch) {
      const afterTags = frontmatter.substring(tagsMatch.index + tagsMatch[0].length);
      const blockMatch = afterTags.match(/^(\s*-\s*.*(?:\n\s*-\s*.*)*)/m);
      if (blockMatch) {
        const tagLines = blockMatch[0].split('\n');
        for (const line of tagLines) {
          const tag = line.replace(/^\s*-\s*/, '').trim();
          if (tag) {
            tags.push(tag);
          }
        }
      }
    }

    const arrayMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
    if (arrayMatch) {
      const tagList = arrayMatch[1].split(',').map(t => t.trim()).filter(t => t);
      for (const tag of tagList) {
        tags.push(tag);
      }
    }
  }

  const inlineRegex = /#([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = inlineRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return tags;
}

function collectFiles(targets) {
  const files = [];

  for (const target of targets) {
    if (fs.existsSync(target)) {
      const stat = fs.statSync(target);
      if (stat.isFile() && target.endsWith('.md')) {
        files.push(target);
      } else if (stat.isDirectory()) {
        walkDir(target, files);
      }
    }
  }

  return files;
}

function walkDir(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const targets = [];
  let showDetail = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-d' || arg === '--detail') {
      showDetail = true;
    } else if (!arg.startsWith('-')) {
      targets.push(arg);
    }
  }

  if (targets.length === 0) {
    console.error('Error: No paths provided. Use -h for help.');
    process.exit(1);
  }

  const tagCount = new Map();
  const tagFiles = new Map();
  const files = collectFiles(targets);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const tags = extractTags(content);
      const uniqueTags = [...new Set(tags)];
      for (const tag of uniqueTags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        if (!tagFiles.has(tag)) {
          tagFiles.set(tag, []);
        }
        tagFiles.get(tag).push(file);
      }
    } catch (err) {
      // skip files that can't be read
    }
  }

  const sorted = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]);

  if (showDetail) {
    for (const [tag, count] of sorted) {
      console.log(`${tag} ${count}`);
      for (const file of tagFiles.get(tag)) {
        console.log(`  - ${file}`);
      }
    }
  } else {
    for (const [tag, count] of sorted) {
      console.log(`${tag} ${count}`);
    }
  }
}

main();