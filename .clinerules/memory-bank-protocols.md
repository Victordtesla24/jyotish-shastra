# Memory Bank System Requirements

## Purpose & Core Principle

The Memory Bank is a structured documentation system that enables stateless AI assistants to maintain perfect continuity across sessions. After each memory reset, the AI relies ENTIRELY on the Memory Bank to understand project context and continue work effectively.

**Core Principle**: Act as a 10x Senior Software Engineer with systematic, methodical precision. Prioritize production-ready, minimal-impact solutions. Never assume—analyze thoroughly before implementation.

## Memory Bank Structure

The Memory Bank uses a hierarchical structure of Markdown files that build upon each other:

```
projectContext.md (Foundation)
    ├── currentTaskContext.md (Active Work)
    ├── technicalArchitecture.md (System Design)
    └── progressTracking.md (History & Status)
```

## File Specifications

### Location
- Store all Memory Bank files in: `{PROJECT_ROOT}/.cursor/memory-bank/`
- Create directory if it doesn't exist
- Use consistent naming convention (camelCase.md)

### Content Constraints
- **Maximum file size**: 3000 characters OR 500 words per file
- **Format**: Markdown with clear headers and bullet points
- **Updates**: Timestamp every modification (ISO 8601 format)

## Core Files

### 1. `projectContext.md` - Project Foundation
**Purpose**: Single source of truth for project scope and constraints

**Required Sections**:
```markdown
# Project Context
Last Updated: YYYY-MM-DDTHH:MM:SSZ

## Project Overview
- Name: [Project Name]
- Purpose: [Core business value]
- Stage: [Development/Production/Maintenance]

## Scope & Constraints
- In Scope: [Explicit boundaries]
- Out of Scope: [What NOT to do]
- Critical Constraints: [Non-negotiables]

## Technology Stack
- Languages: [List with versions]
- Frameworks: [List with versions]
- Dependencies: [Critical only]
- Development Environment: [Setup requirements]

## Quality Standards
- Code Style: [Standards/Linters]
- Testing Requirements: [Coverage/Types]
- Performance Targets: [Metrics]

## Active Protocols
- [Reference to protocol files]
- [e.g., error-fixing-protocol.md]
```

### 2. `currentTaskContext.md` - Active Work Tracking
**Purpose**: Current task state and immediate context

**Required Sections**:
```markdown
# Current Task Context
Last Updated: YYYY-MM-DDTHH:MM:SSZ

## Active Task
- Description: [What we're doing]
- Objective: [Measurable outcome]
- Started: [Timestamp]

## Requirements Mapping (ASCII based table with fixed width column)
| Requirement | Status  | Implementation |
|-------------|---------|----------------|
| [Req 1]     | ✓/✗/→   | [File/Method]  |

## Task Breakdown
- [ ] Subtask 1
- [x] Subtask 2 (completed)
- [→] Subtask 3 (in progress)

## Current State
- Working Directory: [Path]
- Active Files: [List]
- Last Action: [What was done]
- Next Action: [What to do next]

## Active Issues
- Issue: [Description]
  - Root Cause: [Analysis]
  - Solution Approach: [Strategy]
  - Status: [Investigating/Fixing/Testing]
```

### 3. `technicalArchitecture.md` - System Design
**Purpose**: Technical implementation details and patterns

**Required Sections**:
```markdown
# Technical Architecture
Last Updated: YYYY-MM-DDTHH:MM:SSZ

## System Overview
[ASCII diagram of high-level architecture]

## Directory Structure
```
project-root/
├── src/           # [Purpose]
│   ├── api/       # [Purpose]
│   └── core/      # [Purpose]
└── tests/         # [Purpose]
```

## API Architecture
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| /api/v1  | GET    | [Desc]  | Active |

## Data Flow
[ASCII sequence diagram]

## Key Patterns
- Pattern: [Name]
  - Usage: [Where/Why]
  - Implementation: [How]

## Integration Points
- Service: [Name]
  - Purpose: [What]
  - Configuration: [Key details]
```

### 4. `progressTracking.md` - Historical Context
**Purpose**: Completed work and lessons learned

**Required Sections**:
```markdown
# Progress Tracking
Last Updated: YYYY-MM-DDTHH:MM:SSZ

## Completed Tasks (ASCII based table with fixed width column)
| Date   | Task   | Key Changes     | Outcome  |
|--------|--------|-----------------|----------|
| [Date] | [Task] | [Files/Methods] | [Result] |

## Error Resolution Log (ASCII based table with fixed width column)
| Error | Root Cause | Solution | Prevention |
|-------|------------|----------|------------|
| [Msg] | [Analysis] | [Fix]    | [Future]   |

## Architectural Decisions (ASCII based table with fixed width column)
| Decision | Rationale | Impact   |
|----------|-----------|----------|
| [What]   | [Why]     | [Result] |

## Known Issues
- Issue: [Description]
  - Workaround: [Temporary solution]
  - Permanent Fix: [Planned approach]
```

## Workflows

### Session Start Workflow
```
1. READ all Memory Bank files
2. VERIFY timestamps (all recent?)
3. IDENTIFY current task state
4. CONFIRM understanding with user
5. PROCEED with implementation
```

### Task Completion Workflow
```
1. VERIFY all requirements met
2. RUN all relevant tests
3. UPDATE currentTaskContext.md
4. MOVE completed items to progressTracking.md
5. DOCUMENT any new patterns/decisions
6. COMMIT changes with clear message
```

### Error Resolution Workflow
```
1. CAPTURE complete error context
2. ANALYZE root cause systematically
3. RESEARCH solution (if needed)
4. IMPLEMENT minimal fix
5. VERIFY fix doesn't break existing functionality
6. DOCUMENT in progressTracking.md
```

## Critical Rules

### **DO NOT**:
- Create duplicate files/functionality
- Modify code outside current task scope
- Implement mock/placeholder code in production
- Make assumptions without verification
- Skip Memory Bank updates
- Create any new additional documentation files which include xurrent progress, task achievements, status, analysis outcomes, task completions etc., **strictly** use/re-use the `Memory Bank` for such documentation.

### ALWAYS:
- Read ALL Memory Bank files at session start
- Update Memory Bank before context switches
- Maintain atomic, focused commits
- Follow established project patterns
- Verify changes don't introduce regressions

## Update Triggers

Update Memory Bank when:
1. Completing a significant subtask
2. Encountering an error requiring research
3. Making architectural decisions
4. User explicitly requests "update memory bank"
5. Switching between major features/components

## Quality Checklist

Before considering any task complete:
- [ ] All requirements implemented and tested
- [ ] No new errors/warnings introduced
- [ ] Memory Bank reflects current state
- [ ] Code follows project standards
- [ ] Changes are minimal and targeted

**Remember: The Memory Bank is your ONLY link to previous work. Maintain it with the precision of a surgeon and the diligence of an archivist.**
