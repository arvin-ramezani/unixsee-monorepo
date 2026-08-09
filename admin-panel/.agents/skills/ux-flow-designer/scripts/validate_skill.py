#!/usr/bin/env python3
from pathlib import Path
import re, sys

root = Path(__file__).resolve().parents[1]
errors, warnings = [], []

required = [
    root / "SKILL.md",
    root / "references/foundations/evidence-traceability.md",
    root / "references/user-needs/user-needs.md",
    root / "references/journey/current-journey.md",
    root / "references/journey/future-journey.md",
    root / "references/flow/core-flow.md",
    root / "references/review/heuristic-method.md",
    root / "references/review/accessibility-keyboard-focus.md",
    root / "references/output/output-principles.md",
    root / "templates/ux-flow-specification.md",
    root / "examples/refund-approval-flow.md",
]

for p in required:
    if not p.exists():
        errors.append(f"Missing: {p.relative_to(root)}")
    elif not p.read_text(encoding="utf-8").strip():
        errors.append(f"Empty: {p.relative_to(root)}")

skill = root / "SKILL.md"
if skill.exists():
    text = skill.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append("SKILL.md YAML frontmatter is missing or malformed")
    else:
        fm = m.group(1)
        if "name:" not in fm:
            errors.append("SKILL.md frontmatter missing name")
        if "description:" not in fm:
            errors.append("SKILL.md frontmatter missing description")

for p in root.rglob("*.md"):
    lines = p.read_text(encoding="utf-8").splitlines()
    if p.name != "SKILL.md" and len(lines) > 500:
        warnings.append(f"{p.relative_to(root)} has {len(lines)} lines")
    if len(lines) > 300:
        first = "\n".join(lines[:80]).lower()
        if "contents" not in first and p.parent.name != "templates":
            warnings.append(f"{p.relative_to(root)} lacks an early Contents section")

print(f"Skill: {root}")
print(f"Markdown files: {len(list(root.rglob('*.md')))}")
if warnings:
    print("Warnings:")
    for w in warnings:
        print(f"- {w}")
if errors:
    print("Errors:")
    for e in errors:
        print(f"- {e}")
    sys.exit(1)
print("Validation passed.")
