# PRP Quality Check Command

## PRP File: $ARGUMENTS

## Mission: Validate PRP Quality for TypeScript/Next.js Implementation Success

Execute the PRP Quality Agent to perform comprehensive multi-phase validation ensuring the specified PRP meets the highest quality standards for successful TypeScript/Next.js implementation.

## Command Execution

Run the PRP Quality Agent with the provided PRP file:

```typescript
// Parse command arguments
const args = parseArguments($ARGUMENTS);
const prpFile = args.file;
const detailed = args.flags.includes('--detailed');
const suggestFixes = args.flags.includes('--suggest-fixes');

// Execute the PRP Quality Agent
await executeAgent('.claude/agents/prp-quality-agent/prp-quality-agent.md', {
  prpFile,
  detailed,
  suggestFixes
});
```

## Agent Execution Process

1. **Load and Parse PRP**: Read the specified PRP file and extract content
2. **Initialize Assessment**: Set up quality assessment structure with scoring categories
3. **Run Multi-Phase Validation**:
   - Phase 1: Structural Validation (20% weight)
   - Phase 2: Context Completeness (30% weight) 
   - Phase 3: Implementation Quality (25% weight)
   - Phase 4: Validation Commands (15% weight)
   - Phase 5: TypeScript/Next.js Specifics (10% weight)
4. **Calculate Overall Score**: Compute weighted scores and determine readiness
5. **Generate Reports**: Output summary, detailed analysis, and fix suggestions

## Expected Output

### Basic Report
```
═══════════════════════════════════════════════════════════════════
                 PRP QUALITY ASSESSMENT REPORT
═══════════════════════════════════════════════════════════════════

PRP: feature-name.md
Date: 2024-01-15
Project Type: Next.js 15 / TypeScript

OVERALL SCORE: 8.5/10 ✅ READY FOR IMPLEMENTATION

Category Scores:
├─ Structure:        9/10 ✅
├─ Context:          8/10 ✅
├─ Implementation:   9/10 ✅
├─ Validation:       8/10 ✅
└─ TypeScript:       8.5/10 ✅

Confidence Level: HIGH - Minor adjustments may be needed

═══════════════════════════════════════════════════════════════════
```

### Detailed Report (--detailed flag)
```
DETAILED ANALYSIS:

Structure Issues:
  Line 45: Missing 'User Persona' section
  Line 120: YAML syntax error in documentation block

Context Gaps:
  - Documentation: Missing section anchors in React Hook Form URLs
    Fix: Add #api/useform to documentation URL
  - File patterns: No examples from existing codebase
    Fix: Reference components/existing/ExampleComponent.tsx

Implementation Concerns:
  Task 3: Generic task description lacks specific file paths
  Task 5: Missing dependency relationship to Task 2

Validation Problems:
  Level 2: Missing unit test commands
  Level 4: No E2E testing specified

TypeScript/Next.js Issues:
  - Missing 'use client' directive examples
  - No interface definitions for component props
```

### Auto-Fix Suggestions (--suggest-fixes flag)
```
AUTO-FIX SUGGESTIONS:

Fix for "Missing required section: User Persona":
## User Persona (if applicable)

**Target User**: [Specific user type - developer, end user, admin, etc.]
**Use Case**: [Primary scenario when this feature will be used]
---

Fix for "No TypeScript interface definitions":
```typescript
interface FeatureProps {
  data: FeatureData;
  onAction?: (id: string) => void;
}
```
---
```

## Quality Gate Integration

### Pass/Fail Logic
- **PASS**: Overall score ≥ 8.0/10 AND no critical failures
- **FAIL**: Overall score < 8.0/10 OR critical failures present

### Exit Codes
- `0`: PRP passes quality validation
- `1`: PRP fails quality validation  
- `2`: Command execution error (file not found, parsing error)

### Integration with PRP Workflow

This command integrates seamlessly with the PRP creation workflow:

```bash
# Standard PRP creation flow
/prp-ts-create PRPs/INITIAL.md

# Quality validation (automatically called by prp-ts-create)
/prp-quality-check PRPs/generated-feature.md --detailed

# If quality check passes (score ≥ 8), proceed to execution
/prp-ts-execute PRPs/generated-feature.md
```

## Command Flags

### Available Flags
- `--detailed`: Include comprehensive issue analysis with line numbers and specific fixes
- `--suggest-fixes`: Generate auto-fix suggestions for common issues
- `--json`: Output results in JSON format for CI/CD integration
- `--config`: Use custom quality thresholds from configuration file

### Usage Examples

```bash
# Basic quality check
/prp-quality-check PRPs/user-auth.md

# Detailed analysis with fix suggestions
/prp-quality-check PRPs/user-auth.md --detailed --suggest-fixes

# JSON output for CI/CD
/prp-quality-check PRPs/user-auth.md --json

# Custom quality thresholds
/prp-quality-check PRPs/user-auth.md --config .claude/agents/prp-quality-agent/custom-config.json
```

## Error Handling

### Common Errors and Resolution

```typescript
const errorHandling = {
  'PRP file not found': {
    message: 'Specified PRP file does not exist',
    resolution: 'Verify file path and ensure PRP was created successfully'
  },
  'Invalid PRP format': {
    message: 'PRP file is not valid Markdown or missing required structure',
    resolution: 'Use PRPs/templates/prp_base_typescript.md as template'
  },
  'Quality agent error': {
    message: 'Error executing quality validation logic',
    resolution: 'Check agent file exists and has proper permissions'
  },
  'Low quality score': {
    message: 'PRP does not meet minimum quality standards',
    resolution: 'Review detailed report and address identified issues'
  }
};
```

## Continuous Improvement

### Metrics Collection
Every quality check execution contributes to quality metrics:
- Track average scores over time
- Identify common failure patterns
- Monitor improvement trends
- Generate quality insights

### Learning Integration  
Quality check results feed back into:
- PRP template improvements
- Common gotchas documentation
- Training for PRP authors
- Quality agent enhancements

## Integration Points

### CI/CD Pipeline
```yaml
# .github/workflows/prp-quality.yml
- name: PRP Quality Gate
  run: /prp-quality-check PRPs/${{ matrix.prp }} --json
  continue-on-error: false
```

### Pre-commit Hooks
```bash
# Automatic quality checking before PRP commits
if git diff --cached --name-only | grep -q "PRPs/.*\.md$"; then
  /prp-quality-check PRPs/*.md
fi
```

### Development Workflow
```bash
# Integrated into daily development
/prp-ts-create PRPs/INITIAL.md    # Creates PRP
# Quality check runs automatically
# Fix issues if score < 8.0
/prp-ts-execute PRPs/feature.md   # Execute when ready
```

---

**Result**: This command ensures every PRP meets the highest quality standards, dramatically increasing the likelihood of successful one-pass TypeScript/Next.js implementation.