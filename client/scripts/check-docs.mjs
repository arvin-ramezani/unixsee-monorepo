import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repositoryRoot = process.cwd();
const errors = [];

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".github/copilot-instructions.md",
  "README.md",
  "docs/README.md",
  "docs/engineering/repository-structure.md",
  "docs/engineering/nextjs.md",
  "docs/engineering/ui.md",
  "docs/engineering/quality-and-review.md",
  "docs/workflow/definition-of-done.md",
  "docs/runbooks/development.md",
  "docs/runbooks/deployment.md",
];

const metadataFiles = requiredFiles.filter((file) => file.startsWith("docs/"));
const metadataLabels = ["Status", "Owner", "Last verified"];

function resolveFromRoot(relativePath) {
  return path.resolve(repositoryRoot, relativePath);
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function walkMarkdown(directory) {
  if (!fs.existsSync(directory)) return [];

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(absolutePath);
    }
  }
  return files;
}

for (const requiredFile of requiredFiles) {
  if (!fs.existsSync(resolveFromRoot(requiredFile))) {
    errors.push(`Missing required file: ${requiredFile}`);
  }
}

for (const metadataFile of metadataFiles) {
  const absolutePath = resolveFromRoot(metadataFile);
  if (!fs.existsSync(absolutePath)) continue;

  const content = fs.readFileSync(absolutePath, "utf8");
  for (const label of metadataLabels) {
    if (!content.includes(`**${label}:**`)) {
      errors.push(`${metadataFile} is missing ${label} metadata`);
    }
  }
}

const bridgeRequirements = new Map([
  ["CLAUDE.md", "@AGENTS.md"],
  ["GEMINI.md", "AGENTS.md"],
  [".github/copilot-instructions.md", "AGENTS.md"],
]);

for (const [bridgeFile, expectedText] of bridgeRequirements) {
  const absolutePath = resolveFromRoot(bridgeFile);
  if (!fs.existsSync(absolutePath)) continue;

  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.includes(expectedText)) {
    errors.push(`${bridgeFile} must route to ${expectedText}`);
  }
}

const markdownFiles = [
  resolveFromRoot("README.md"),
  ...walkMarkdown(resolveFromRoot("docs")),
].filter(fs.existsSync);

const markdownLinkPattern = /!??\[[^\]]*\]\(([^)]+)\)/g;

for (const absoluteFile of markdownFiles) {
  const relativeFile = toPosix(path.relative(repositoryRoot, absoluteFile));
  const content = fs.readFileSync(absoluteFile, "utf8");

  if (content.includes("docs/ai/")) {
    errors.push(`${relativeFile} references the retired docs/ai directory`);
  }

  for (const match of content.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    const targetWithoutTitle = rawTarget.split(/\s+["']/)[0];
    const targetPath = targetWithoutTitle.split("#")[0];

    if (
      !targetPath ||
      /^(?:https?:|mailto:|tel:)/i.test(targetPath) ||
      targetPath.startsWith("/")
    ) {
      continue;
    }

    const resolvedTarget = path.resolve(path.dirname(absoluteFile), targetPath);
    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`${relativeFile} has broken link: ${targetPath}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Documentation check failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Documentation check passed.");
