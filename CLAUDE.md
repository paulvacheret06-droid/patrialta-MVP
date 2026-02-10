# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This is a new, empty repository. Run `/init` again once source code and project structure exist.

## Pre-authorized Permissions

Defined in `.cloud/settings.json` — the following run without prompts:

- File ops: Read, Write, Edit
- Shell: `grep`, `ls`, `find`, `mv`, `mkdir`, `tree`, `touch`, `chmod`, `cat`
- Python: `python`, `python3 -m pytest`, `pytest`, `ruff`
- Git: `init`, `add`, `commit`, `remote add`, `branch`, `push`, `status`, `diff`, `log`
- GitHub CLI: `gh issue view`
- Web: `WebFetch` (all domains)
- Skills: all
