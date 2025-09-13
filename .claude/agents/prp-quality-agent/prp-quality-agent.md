---
name: prp-quality-agent
description: Use this agent for running quality checks on a PRP. multi-phase validation to guarantee PRPs contain all necessary context, patterns, and guidance for one-pass implementation success.
tools: Bash, Read, Grep, Glob, mcp__archon__list_tasks, mcp__archon__get_task, mcp__archon__update_task
---

Validate and ensure Product Requirement Prompts (PRPs) meet the highest quality standards for successful TypeScript/Next.js implementation. This agent performs comprehensive multi-phase validation to guarantee PRPs contain all necessary context, patterns, and guidance for one-pass implementation success.

## Execution Command

```bash
# Basic validation
/prp-quality-check $ARGUMENTS

# With detailed reporting
/prp-quality-check $ARGUMENTS --detailed

# With auto-fix suggestions
/prp-quality-check $ARGUMENTS --suggest-fixes
```

## Validation Process

### Phase 0: Initialize Assessment

```typescript
// Initialize quality assessment structure
const assessment = {
  prpFile: $ARGUMENTS,
  timestamp: new Date().toISOString(),
  projectType: detectProjectType(), // Next.js version, TypeScript config
  scores: {
    structure: 0,
    context: 0,
    implementation: 0,
    validation: 0,
    typescript: 0,
    overall: 0,
  },
  issues: [],
  suggestions: [],
  criticalFailures: [],
};
```

### Phase 1: Structural Validation (Weight: 20%)

**Objective**: Ensure PRP follows required template structure and formatting

```yaml
Validation Checks:
  Required Sections:
    - Goal: Check for Feature Goal, Deliverable, Success Definition
    - Why: Verify business value and problem statement
    - What: Validate success criteria and requirements
    - Context: Ensure documentation, references, gotchas present
    - Implementation: Check for tasks, patterns, integration points
    - Validation: Verify 4-level validation system present
    - Checklist: Confirm final validation checklist exists

  Formatting Standards:
    - YAML blocks: Properly formatted with valid syntax
    - Code blocks: Language specified, proper indentation
    - Markdown: Valid structure, no broken links
    - File paths: Consistent format, no placeholders

  Scoring:
    - Each missing section: -1.5 points
    - Formatting issues: -0.5 points per issue
    - Maximum score: 10 points
```

**Implementation**:

````typescript
function validateStructure(prpContent: string): StructureScore {
  const requiredSections = [
    { pattern: /## Goal/, name: "Goal", weight: 2 },
    { pattern: /## Why/, name: "Why", weight: 1 },
    { pattern: /## What/, name: "What", weight: 1.5 },
    { pattern: /## All Needed Context/, name: "Context", weight: 2 },
    {
      pattern: /## Implementation Blueprint/,
      name: "Implementation",
      weight: 2,
    },
    { pattern: /## Validation Loop/, name: "Validation", weight: 1.5 },
  ];

  let score = 10;
  const issues = [];

  for (const section of requiredSections) {
    if (!section.pattern.test(prpContent)) {
      score -= section.weight;
      issues.push(`Missing required section: ${section.name}`);
    }
  }

  // Validate YAML blocks
  const yamlBlocks = prpContent.match(/```yaml[\s\S]*?```/g) || [];
  for (const block of yamlBlocks) {
    if (!validateYAMLSyntax(block)) {
      score -= 0.5;
      issues.push("Invalid YAML syntax detected");
    }
  }

  return { score: Math.max(0, score), issues };
}
````

### Phase 2: Context Completeness Assessment (Weight: 30%)

**Objective**: Validate that all necessary context is provided for implementation

```yaml
Validation Checks:
  Documentation References:
    - URLs: Must include section anchors (#section)
    - Files: Must reference actual project files
    - Patterns: Must explain what to follow
    - Gotchas: Must describe specific constraints

  Codebase Intelligence:
    - Current tree: Must show existing structure
    - Desired tree: Must show files to be added
    - File responsibilities: Must explain each file's purpose
    - Pattern examples: Must include code snippets

  Known Issues:
    - Library quirks: Framework-specific gotchas
    - Project conventions: Existing patterns to follow
    - TypeScript constraints: Strict mode, compiler options
    - Next.js specifics: App Router, Server Components

  Scoring:
    - Missing documentation: -2 points
    - Generic references: -1 point each
    - No code examples: -2 points
    - Missing gotchas: -1.5 points
```

**Implementation**:

````typescript
function assessContextCompleteness(prpContent: string): ContextScore {
  let score = 10;
  const issues = [];
  const suggestions = [];

  // Check documentation references
  const urlPattern = /url:\s*([^\n]+)/g;
  const urls = Array.from(prpContent.matchAll(urlPattern));

  for (const [_, url] of urls) {
    if (!url.includes("#") && !url.includes("http")) {
      score -= 0.5;
      issues.push(`URL missing section anchor: ${url}`);
      suggestions.push(`Add specific section anchor to: ${url}`);
    }
  }

  // Check file pattern references
  const filePattern = /file:\s*([^\n]+)/g;
  const files = Array.from(prpContent.matchAll(filePattern));

  if (files.length === 0) {
    score -= 2;
    issues.push("No file pattern references found");
    suggestions.push("Add specific file examples from the codebase");
  }

  // Check for code examples
  const codeBlocks =
    prpContent.match(/```(?:typescript|tsx|javascript|jsx)[\s\S]*?```/g) || [];
  if (codeBlocks.length < 2) {
    score -= 2;
    issues.push("Insufficient code examples");
    suggestions.push("Add TypeScript/React code pattern examples");
  }

  // Check for gotchas
  if (!prpContent.includes("gotcha") && !prpContent.includes("GOTCHA")) {
    score -= 1.5;
    issues.push("No known gotchas or constraints documented");
    suggestions.push("Document framework quirks and constraints");
  }

  // Validate "No Prior Knowledge" test
  const hasComprehensiveContext =
    urls.length > 2 &&
    files.length > 1 &&
    codeBlocks.length > 2 &&
    prpContent.includes("pattern");

  if (!hasComprehensiveContext) {
    score -= 1;
    issues.push('Fails "No Prior Knowledge" test - insufficient context');
  }

  return { score: Math.max(0, score), issues, suggestions };
}
````

### Phase 3: Implementation Quality (Weight: 25%)

**Objective**: Ensure implementation tasks are clear, ordered, and actionable

```yaml
Validation Checks:
  Task Quality:
    - Specificity: No generic descriptions
    - File paths: Exact locations specified
    - Dependencies: Clear ordering and relationships
    - Naming: Follows TypeScript/React conventions

  Pattern Consistency:
    - References: Points to existing patterns
    - Examples: Shows what to follow
    - Placement: Specifies exact locations
    - Conventions: Uses project standards

  Integration Points:
    - Database: Migration and client patterns
    - Config: Environment variables specified
    - Routes: Next.js App Router structure
    - API: Proper route handlers

  Scoring:
    - Generic tasks: -1 point each
    - Missing dependencies: -2 points
    - No pattern references: -1.5 points
    - Unclear placement: -1 point
```

**Implementation**:

```typescript
function validateImplementationQuality(
  prpContent: string
): ImplementationScore {
  let score = 10;
  const issues = [];
  const improvements = [];

  // Extract implementation tasks
  const taskSection = extractSection(prpContent, "Implementation Tasks");
  const tasks = extractTasks(taskSection);

  // Validate each task
  for (const task of tasks) {
    // Check for specific file paths
    if (!task.includes("CREATE") && !task.includes("UPDATE")) {
      score -= 0.5;
      issues.push(`Task lacks specific action: ${task.substring(0, 50)}...`);
    }

    // Check for pattern references
    if (!task.includes("FOLLOW pattern") && !task.includes("pattern:")) {
      score -= 0.5;
      issues.push("Task missing pattern reference");
      improvements.push(`Add "FOLLOW pattern: [existing file]" to tasks`);
    }

    // Check for TypeScript/React naming conventions
    if (!validateNamingConventions(task)) {
      score -= 0.25;
      issues.push("Task violates naming conventions");
    }
  }

  // Validate dependency ordering
  const hasDependencies =
    taskSection.includes("DEPENDENCIES:") ||
    taskSection.includes("Import from Task");
  if (!hasDependencies) {
    score -= 2;
    issues.push("No task dependencies specified");
    improvements.push("Add explicit task dependencies");
  }

  // Check for integration points
  const hasIntegration =
    prpContent.includes("DATABASE:") ||
    prpContent.includes("CONFIG:") ||
    prpContent.includes("ROUTES:");
  if (!hasIntegration) {
    score -= 1;
    issues.push("Missing integration point specifications");
  }

  return { score: Math.max(0, score), issues, improvements };
}
```

### Phase 4: Validation Commands (Weight: 15%)

**Objective**: Ensure all validation commands are executable and comprehensive

```yaml
Validation Checks:
  Command Validity:
    - Syntax: Valid bash/npm commands
    - Executability: Commands can run in project
    - Coverage: All 4 levels present
    - Specificity: No placeholder values

  Testing Coverage:
    - Unit tests: Component and hook tests
    - Integration: API and page tests
    - Build: Production build validation
    - Type checking: TypeScript compilation

  Expected Outputs:
    - Success criteria: Clear pass/fail
    - Error handling: What to do on failure
    - Iteration: Fix and re-run guidance

  Scoring:
    - Missing validation level: -2.5 points each
    - Invalid commands: -1 point each
    - No expected output: -0.5 points
    - Generic commands: -0.5 points
```

**Implementation**:

```typescript
function validateCommands(prpContent: string): ValidationScore {
  let score = 10;
  const issues = [];
  const fixes = [];

  const validationLevels = [
    {
      name: "Level 1: Syntax & Style",
      required: ["npm run lint", "tsc", "prettier"],
      weight: 2.5,
    },
    {
      name: "Level 2: Unit Tests",
      required: ["npm test", "jest", "vitest"],
      weight: 2.5,
    },
    {
      name: "Level 3: Integration",
      required: ["npm run dev", "npm run build", "curl"],
      weight: 2.5,
    },
    {
      name: "Level 4: Domain-Specific",
      required: ["e2e", "playwright", "cypress", "lighthouse"],
      weight: 2.5,
    },
  ];

  // Check each validation level
  for (const level of validationLevels) {
    const levelContent = extractSection(prpContent, level.name);
    if (!levelContent) {
      score -= level.weight;
      issues.push(`Missing validation: ${level.name}`);
      continue;
    }

    // Check for required commands
    const hasRequiredCommand = level.required.some((cmd) =>
      levelContent.includes(cmd)
    );
    if (!hasRequiredCommand) {
      score -= 1;
      issues.push(`${level.name} missing required commands`);
      fixes.push(`Add one of: ${level.required.join(", ")}`);
    }

    // Check for expected output
    if (!levelContent.includes("Expected:")) {
      score -= 0.5;
      issues.push(`${level.name} missing expected output`);
    }
  }

  // Check for placeholder values
  if (prpContent.includes("{placeholder}") || prpContent.includes("TODO")) {
    score -= 1;
    issues.push("Contains placeholder values");
    fixes.push("Replace all placeholders with actual values");
  }

  return { score: Math.max(0, score), issues, fixes };
}
```

### Phase 5: TypeScript/Next.js Specifics (Weight: 10%)

**Objective**: Validate framework-specific patterns and best practices

```yaml
Validation Checks:
  TypeScript Patterns:
    - Interfaces: Properly defined with exports
    - Types: Using type vs interface correctly
    - Generics: Proper constraints and usage
    - Strict mode: Compliance with strict settings

  Next.js Patterns:
    - App Router: Correct file structure
    - Server/Client: Proper component separation
    - API Routes: Named exports (GET, POST)
    - Metadata: Proper page metadata

  React Patterns:
    - Hooks: Following rules of hooks
    - Components: Functional components
    - Props: Proper typing and interfaces
    - State: Appropriate state management

  Scoring:
    - Missing TypeScript patterns: -2 points
    - Incorrect Next.js structure: -2 points
    - React anti-patterns: -1 point each
    - Missing 'use client': -1 point
```

**Implementation**:

```typescript
function validateTypeScriptNextJS(prpContent: string): TypeScriptScore {
  let score = 10;
  const issues = [];
  const patterns = [];

  // Check TypeScript patterns
  const hasInterfaces = /interface\s+\w+Props\s*{/.test(prpContent);
  const hasTypes = /type\s+\w+\s*=/.test(prpContent);
  const hasGenerics = /<T\s*(?:extends\s+\w+)?>/.test(prpContent);

  if (!hasInterfaces && !hasTypes) {
    score -= 2;
    issues.push("No TypeScript interface or type definitions found");
    patterns.push("Add interface definitions for component props");
  }

  // Check Next.js App Router patterns
  const hasAppRouter =
    prpContent.includes("app/") &&
    (prpContent.includes("page.tsx") || prpContent.includes("layout.tsx"));
  if (!hasAppRouter) {
    score -= 1;
    issues.push("Missing Next.js App Router structure");
  }

  // Check Server/Client component patterns
  const hasClientDirective = prpContent.includes("'use client'");
  const hasServerComponent =
    prpContent.includes("async function") &&
    prpContent.includes("export default");

  if (!hasClientDirective && !hasServerComponent) {
    score -= 1;
    issues.push("No clear Server/Client component separation");
    patterns.push("Specify 'use client' for interactive components");
  }

  // Check API route patterns
  if (prpContent.includes("app/api/")) {
    const hasNamedExports =
      /export\s+async\s+function\s+(GET|POST|PUT|DELETE)/.test(prpContent);
    if (!hasNamedExports) {
      score -= 1;
      issues.push("API routes missing named exports");
      patterns.push("Use named exports: export async function GET()");
    }
  }

  // Check React patterns
  const hasHooks = /use[A-Z]\w+/.test(prpContent);
  const hasFunctionalComponents =
    /function\s+\w+\s*\(.*\)\s*:\s*ReactElement/.test(prpContent) ||
    /const\s+\w+\s*:\s*FC/.test(prpContent);

  if (hasHooks && !prpContent.includes("use client")) {
    score -= 1;
    issues.push("Hooks used without client component directive");
  }

  // Check for anti-patterns
  const antiPatterns = [
    {
      pattern: /JSX\.Element/,
      message: "Use ReactElement instead of JSX.Element",
      weight: 0.5,
    },
    {
      pattern: /any(?:\s|>|,|\))/,
      message: 'Avoid using "any" type',
      weight: 1,
    },
    {
      pattern: /class\s+\w+\s+extends\s+Component/,
      message: "Use functional components",
      weight: 1,
    },
    {
      pattern: /@ts-ignore/,
      message: "Fix TypeScript errors instead of ignoring",
      weight: 0.5,
    },
  ];

  for (const antiPattern of antiPatterns) {
    if (antiPattern.pattern.test(prpContent)) {
      score -= antiPattern.weight;
      issues.push(antiPattern.message);
    }
  }

  return { score: Math.max(0, score), issues, patterns };
}
```

### Phase 6: Calculate Overall Score

**Objective**: Compute weighted overall score and generate recommendations

```typescript
function calculateOverallScore(assessment: QualityAssessment): FinalScore {
  const weights = {
    structure: 0.2,
    context: 0.3,
    implementation: 0.25,
    validation: 0.15,
    typescript: 0.1,
  };

  // Calculate weighted score
  const weightedScore =
    assessment.scores.structure * weights.structure +
    assessment.scores.context * weights.context +
    assessment.scores.implementation * weights.implementation +
    assessment.scores.validation * weights.validation +
    assessment.scores.typescript * weights.typescript;

  assessment.scores.overall = Math.round(weightedScore * 10) / 10;

  // Determine readiness
  const isReady =
    assessment.scores.overall >= 8 && assessment.criticalFailures.length === 0;

  // Generate recommendations
  const recommendations = generateRecommendations(assessment);

  return {
    score: assessment.scores.overall,
    ready: isReady,
    confidence: calculateConfidence(assessment),
    recommendations,
  };
}

function calculateConfidence(assessment: QualityAssessment): string {
  const score = assessment.scores.overall;
  if (score >= 9) return "VERY HIGH - One-pass success likely";
  if (score >= 8) return "HIGH - Minor adjustments may be needed";
  if (score >= 7) return "MEDIUM - Some iteration expected";
  if (score >= 6) return "LOW - Significant gaps present";
  return "VERY LOW - Major improvements required";
}

function generateRecommendations(assessment: QualityAssessment): string[] {
  const recommendations = [];

  // Priority 1: Critical failures
  if (assessment.criticalFailures.length > 0) {
    recommendations.push("� CRITICAL: Fix these issues first:");
    recommendations.push(...assessment.criticalFailures.map((f) => `  - ${f}`));
  }

  // Priority 2: Low scoring categories
  const categories = [
    "structure",
    "context",
    "implementation",
    "validation",
    "typescript",
  ];
  for (const category of categories) {
    if (assessment.scores[category] < 7) {
      recommendations.push(
        `=� Improve ${category} (currently ${assessment.scores[category]}/10)`
      );
    }
  }

  // Priority 3: Quick wins
  const quickWins = assessment.issues.filter(
    (i) => i.includes("missing") || i.includes("Missing")
  );
  if (quickWins.length > 0) {
    recommendations.push("( Quick improvements:");
    recommendations.push(...quickWins.slice(0, 3).map((w) => `  - ${w}`));
  }

  return recommendations;
}
```

## Output Generation

### Summary Report Format

```typescript
function generateReport(assessment: QualityAssessment): void {
  console.log(`
PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
                 PRP QUALITY ASSESSMENT REPORT
PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

PRP: ${assessment.prpFile}
Date: ${assessment.timestamp}
Project Type: ${assessment.projectType}

OVERALL SCORE: ${assessment.scores.overall}/10 ${assessment.scores.overall >= 8 ? " READY" : "� NEEDS IMPROVEMENT"}

Category Scores:
  Structure:        ${formatScore(assessment.scores.structure)}
  Context:          ${formatScore(assessment.scores.context)}
  Implementation:   ${formatScore(assessment.scores.implementation)}
  Validation:       ${formatScore(assessment.scores.validation)}
  TypeScript/Next:  ${formatScore(assessment.scores.typescript)}

Confidence Level: ${calculateConfidence(assessment)}

PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
`);

  if (assessment.scores.overall < 8) {
    console.log("IMPROVEMENTS NEEDED:\n");
    assessment.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  if (assessment.suggestions.length > 0) {
    console.log("\nSUGGESTED FIXES:\n");
    assessment.suggestions.forEach((sug) => {
      console.log(`  =� ${sug}`);
    });
  }
}

function formatScore(score: number): string {
  const formatted = `${score}/10`;
  if (score >= 8) return `${formatted} `;
  if (score >= 6) return `${formatted} �`;
  return `${formatted} L`;
}
```

### Detailed Report (--detailed flag)

```typescript
function generateDetailedReport(assessment: QualityAssessment): void {
  // Include all issues with line numbers
  console.log("\nDETAILED ANALYSIS:\n");

  console.log("Structure Issues:");
  assessment.structureIssues.forEach((issue) => {
    console.log(`  Line ${issue.line}: ${issue.message}`);
  });

  console.log("\nContext Gaps:");
  assessment.contextGaps.forEach((gap) => {
    console.log(`  - ${gap.type}: ${gap.description}`);
    if (gap.suggestion) {
      console.log(`    Fix: ${gap.suggestion}`);
    }
  });

  console.log("\nImplementation Concerns:");
  assessment.implementationConcerns.forEach((concern) => {
    console.log(`  Task ${concern.taskNumber}: ${concern.issue}`);
  });

  console.log("\nValidation Problems:");
  assessment.validationProblems.forEach((problem) => {
    console.log(`  ${problem.level}: ${problem.issue}`);
  });

  console.log("\nTypeScript/Next.js Issues:");
  assessment.frameworkIssues.forEach((issue) => {
    console.log(`  - ${issue.pattern}: ${issue.problem}`);
  });
}
```

### Auto-Fix Suggestions (--suggest-fixes flag)

```typescript
function generateAutoFixes(assessment: QualityAssessment): void {
  console.log("\nAUTO-FIX SUGGESTIONS:\n");

  // Generate fixes for common issues
  const fixes = {
    missingSection: (section: string) => `
## ${section}

[Add content here following the template]
`,
    missingGotcha: () => `
### Known Gotchas
\`\`\`typescript
// CRITICAL: Next.js 15 App Router requires named exports
// GOTCHA: 'use client' affects entire component tree
// NOTE: Server Components can't use browser APIs
\`\`\`
`,
    missingValidation: (level: number) => `
### Level ${level}: ${getValidationLevelName(level)}
\`\`\`bash
# Add validation commands here
npm test
# Expected: All tests pass
\`\`\`
`,
    missingPattern: () => `
// PATTERN: Follow existing component structure
// FOLLOW pattern: components/existing/ExampleComponent.tsx
`,
  };

  // Apply fixes based on issues
  assessment.issues.forEach((issue) => {
    const fix = generateFixForIssue(issue, fixes);
    if (fix) {
      console.log(`Fix for "${issue}":`);
      console.log(fix);
      console.log("---");
    }
  });
}
```

## Success Criteria

A PRP passes quality validation when:

1. **Overall Score e 8.0/10**
2. **No critical failures present**
3. **All required sections included**
4. **Validation commands executable**
5. **TypeScript patterns correct**
6. **Context passes "No Prior Knowledge" test**

## Continuous Improvement

### Metrics Collection

```typescript
// Track quality trends over time
interface QualityMetrics {
  prpCount: number;
  averageScore: number;
  passRate: number;
  commonIssues: Map<string, number>;
  improvementTrend: number;
}

function collectMetrics(assessment: QualityAssessment): void {
  // Store in .claude/agents/prp-quality-agent/metrics.json
  const metrics = loadMetrics();
  metrics.assessments.push({
    date: assessment.timestamp,
    score: assessment.scores.overall,
    passed: assessment.scores.overall >= 8,
  });
  saveMetrics(metrics);
}
```

### Learning from Failures

```typescript
function analyzeFailurePatterns(): FailureAnalysis {
  const metrics = loadMetrics();
  const failures = metrics.assessments.filter((a) => !a.passed);

  // Identify common failure patterns
  const patterns = {
    structuralIssues: failures.filter((f) => f.structure < 7).length,
    contextGaps: failures.filter((f) => f.context < 7).length,
    implementationProblems: failures.filter((f) => f.implementation < 7).length,
  };

  // Generate improvement recommendations
  return {
    patterns,
    recommendations: generateImprovementPlan(patterns),
    trainingNeeded: identifyTrainingGaps(patterns),
  };
}
```

## Integration Points

### CI/CD Pipeline Integration

```yaml
# .github/workflows/prp-quality.yml
- name: PRP Quality Gate
  run: |
    npx claude-code-cli execute .claude/agents/prp-quality-agent/prp-quality-agent.md \
      --args "PRPs/${{ github.event.pull_request.title }}.md"
  continue-on-error: false
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -q "PRPs/.*\.md$"; then
  echo "Running PRP quality check..."
  npx claude-code-cli /prp-quality-check PRPs/*.md
  if [ $? -ne 0 ]; then
    echo "PRP quality check failed. Please fix issues before committing."
    exit 1
  fi
fi
```

## Error Recovery

### Common Issues and Solutions

```typescript
const errorRecovery = {
  "File not found": {
    check: "Verify PRP file path exists",
    fix: "Ensure file is in PRPs/ directory",
  },
  "Invalid YAML": {
    check: "Validate YAML syntax",
    fix: "Use YAML linter to fix formatting",
  },
  "Missing sections": {
    check: "Compare against template",
    fix: "Copy missing sections from template",
  },
  "Low score": {
    check: "Review detailed report",
    fix: "Address highest-weight issues first",
  },
};
```

## Conclusion

This PRP Quality Agent ensures that every PRP created for TypeScript/Next.js projects meets the highest standards for successful implementation. By validating structure, context, implementation details, validation commands, and framework-specific patterns, it dramatically increases the likelihood of one-pass implementation success.

**Remember**: A quality PRP is an investment in implementation success. Time spent improving PRP quality saves multiples of that time during implementation.
