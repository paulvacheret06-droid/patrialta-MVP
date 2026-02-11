# OpenSpec Workflow

This directory contains your OpenSpec configuration for spec-driven development.

## Directory Structure

- `config.yaml` - Project configuration and rules
- `specs/` - Main specifications (source of truth after changes are archived)
- `changes/` - Active changes being worked on

## Workflow Overview

OpenSpec follows an artifact-based workflow for making changes:

1. **Start a change** - Create a new change with a clear goal
2. **Create artifacts** - Build proposal, spec, and tasks
3. **Implement** - Execute the tasks
4. **Verify** - Validate implementation matches artifacts
5. **Archive** - Move completed change to specs/

## Getting Started

### Quick Start

To start a new change:
```
Use the openspec-new-change skill or run:
openspec new "Your change description"
```

### Available Skills

- `openspec-new-change` - Start a new change
- `openspec-continue-change` - Create the next artifact
- `openspec-ff-change` - Fast-forward through all artifacts
- `openspec-apply-change` - Implement tasks
- `openspec-verify-change` - Verify implementation
- `openspec-archive-change` - Archive completed change
- `openspec-explore` - Thinking partner mode
- `openspec-sync-specs` - Sync changes to main specs

### Slash Commands

Available in your IDE (after restart):
- `/new` - Start new change
- `/continue` - Continue current change
- `/apply` - Start implementation
- `/verify` - Verify implementation
- `/archive` - Archive change
- `/explore` - Enter explore mode
- `/ff` - Fast-forward artifacts
- `/sync` - Sync to main specs
- `/bulk-archive` - Archive multiple changes
- `/onboard` - Guided onboarding

## Configuration

Edit `config.yaml` to:
- Add project context (tech stack, conventions, domain knowledge)
- Customize artifact rules
- Set workflow preferences

Example:
```yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  We use conventional commits
  Domain: e-commerce platform

rules:
  proposal:
    - Keep proposals under 500 words
  tasks:
    - Break tasks into chunks of max 2 hours
```

## Best Practices

1. **One change at a time** - Focus on a single coherent change
2. **Clear goals** - Start with a well-defined objective
3. **Review artifacts** - Check each artifact before moving forward
4. **Verify before archiving** - Always verify implementation matches spec
5. **Keep specs updated** - Archive changes to maintain single source of truth

## Workflow Details

### Artifact Flow

```
Proposal → Spec → Tasks → Implementation → Verification → Archive
```

Each artifact builds on the previous:
- **Proposal** - What and why, options, recommendation
- **Spec** - Detailed design decisions
- **Tasks** - Implementation checklist

### Change States

- **Active** - In `changes/` directory, being worked on
- **Archived** - Merged into `specs/` as source of truth

### Explore Mode

Use `openspec-explore` to:
- Investigate problems before starting a change
- Clarify requirements mid-change
- Think through architectural decisions
- Ask questions without affecting artifacts

## Tips

- Use `/onboard` for a guided walkthrough
- Fast-forward (`/ff`) when you're confident in the approach
- Step-by-step (`/new` → `/continue`) when you want to review each artifact
- Enter explore mode anytime you need to think things through
- Sync changes to specs without archiving when working on related changes

## Learn More

Run the onboarding skill to see a complete workflow example:
```
Use: openspec-onboard skill
```
