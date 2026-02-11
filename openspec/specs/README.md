# Specifications

This directory contains your main specifications - the single source of truth for your project.

## What Goes Here

After you complete and archive changes, their specs are merged here. This becomes your living documentation that evolves with your codebase.

## Organization

Organize specs by feature, component, or domain as makes sense for your project:

```
specs/
  ├── auth/
  │   ├── authentication.md
  │   └── authorization.md
  ├── api/
  │   └── endpoints.md
  └── database/
      └── schema.md
```

## Getting Started

This directory starts empty. As you complete changes and archive them, your specs will accumulate here.

1. Create a change with `/new` or `openspec-new-change`
2. Work through the artifacts
3. Implement the change
4. Archive with `/archive` - the spec gets added here

## Keeping Specs Current

- **Archive regularly** - Don't let changes pile up
- **Sync related changes** - Use `/sync` to update specs without archiving
- **Review periodically** - Ensure specs match reality
- **Refactor when needed** - Reorganize as your project grows

## Specs as Context

When you start new changes, OpenSpec uses these specs as context to:
- Understand existing architecture
- Maintain consistency
- Build on previous decisions
- Avoid conflicts

The more complete your specs, the better the AI assistance.
