# Changes

This directory contains your active changes - work in progress.

## What Is a Change?

A change is a cohesive unit of work with:
- A clear goal
- Artifacts (proposal, spec, tasks)
- Implementation tracking
- Verification before completion

## Change Structure

Each change gets its own directory:

```
changes/
  └── add-user-authentication/
      ├── 01-proposal.md
      ├── 02-spec.md
      ├── 03-tasks.md
      └── meta.yaml
```

### Artifacts

1. **Proposal** (`01-proposal.md`)
   - What you're building and why
   - Options considered
   - Recommended approach
   
2. **Spec** (`02-spec.md`)
   - Detailed design
   - Architecture decisions
   - Implementation details

3. **Tasks** (`03-tasks.md`)
   - Concrete implementation checklist
   - Ordered steps
   - Acceptance criteria

### Metadata

`meta.yaml` tracks:
- Change creation date
- Current status
- Next artifact to create
- Implementation progress

## Workflow

### Starting a Change

```
/new "add user authentication"
```

Creates the change directory and proposal.

### Creating Artifacts

```
/continue    # Create next artifact (proposal → spec → tasks)
/ff          # Fast-forward through all artifacts
```

### Implementing

```
/apply       # Start working on tasks
```

AI will work through your task list, updating progress.

### Completing

```
/verify      # Check implementation matches spec
/archive     # Move spec to main specs/, remove change
```

## Multiple Changes

You can have multiple active changes:

```
changes/
  ├── add-user-authentication/
  ├── refactor-database-layer/
  └── fix-memory-leak/
```

Work on one at a time, or archive in bulk:

```
/bulk-archive
```

## When to Create a Change

✅ **Good reasons:**
- Adding a new feature
- Refactoring a component
- Fixing a complex bug
- Architectural change

❌ **Skip for:**
- Tiny fixes (typos, simple bugs)
- Emergency hotfixes
- Exploratory work (use `/explore` instead)

## Tips

- **Keep changes focused** - One coherent goal per change
- **Name clearly** - Use descriptive change names
- **Review artifacts** - Don't rush through to implementation
- **Track progress** - Let the workflow update metadata
- **Archive when done** - Don't accumulate stale changes

## Explore Mode

Not ready to commit to a change? Use explore mode:

```
/explore
```

Think through problems, investigate, and clarify before starting a formal change.
