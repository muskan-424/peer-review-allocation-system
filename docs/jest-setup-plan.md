# Jest Setup Plan
**Prepared by:** Member 5 — QA & Analytics Engineer  
**Project:** Peer Review Allocation with Conflict Rules  
**Day:** 2  

---

## Table of Contents

1. [Jest Setup Steps](#1-jest-setup-steps)
2. [Test File Structure](#2-test-file-structure)
3. [Planned Test Cases](#3-planned-test-cases)
4. [Sample Test Skeletons](#4-sample-test-skeletons)

---

## 1. Jest Setup Steps

Once the backend project is set up by Member 2, run these commands:

```bash
# Install Jest and TypeScript support
npm install --save-dev jest ts-jest @types/jest

# Initialize Jest config
npx ts-jest config:init
```

### jest.config.js
```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"]
};
```

---

## 2. Test File Structure

```
__tests__/
├── algorithm/
│   ├── candidateGeneration.test.ts      ← Stage 1
│   ├── constraintFiltering.test.ts      ← Stage 2
│   ├── fairnessFiltering.test.ts        ← Stage 3
│   └── workloadBalancing.test.ts        ← Stage 4
├── output/
│   └── allocationOutput.test.ts         ← Output validation (OV-01 to OV-06)
└── edgeCases/
    └── edgeCases.test.ts                ← Edge case tests
```

---

## 3. Planned Test Cases

### Algorithm Stage Tests

| File | Test ID | Description |
|------|---------|-------------|
| candidateGeneration.test.ts | T-01 | Only ACTIVE students appear in candidate list |
| candidateGeneration.test.ts | T-02 | INACTIVE students are excluded from candidates |
| constraintFiltering.test.ts | T-03 | Submission owner is removed from candidates |
| constraintFiltering.test.ts | T-04 | Same-team students are removed from candidates |
| constraintFiltering.test.ts | T-05 | Already assigned reviewer is not assigned again |
| fairnessFiltering.test.ts | T-06 | Reviewer with prior history is deprioritized |
| fairnessFiltering.test.ts | T-07 | Reviewer with no history is preferred |
| workloadBalancing.test.ts | T-08 | Reviewer with 0 reviews is selected before reviewer with 2 reviews |
| workloadBalancing.test.ts | T-09 | Sorted order of reviewers by workload is correct |

### Output Validation Tests

| File | Test ID | Description |
|------|---------|-------------|
| allocationOutput.test.ts | T-10 | Every submission has exactly 2 reviewers (OV-01) |
| allocationOutput.test.ts | T-11 | No reviewer equals submission owner (OV-02) |
| allocationOutput.test.ts | T-12 | No reviewer is from same team as owner (OV-03) |
| allocationOutput.test.ts | T-13 | All reviewers have status ACTIVE (OV-04) |
| allocationOutput.test.ts | T-14 | No duplicate reviewer in same submission (OV-05) |
| allocationOutput.test.ts | T-15 | Allocation exists for every submission (OV-06) |

### Edge Case Tests

| File | Test ID | Description |
|------|---------|-------------|
| edgeCases.test.ts | T-16 | Less than 2 eligible reviewers → warning generated |
| edgeCases.test.ts | T-17 | All students same team → allocation blocked |
| edgeCases.test.ts | T-18 | Reviewer becomes inactive → task reassigned |
| edgeCases.test.ts | T-19 | Late submission → partial allocation runs correctly |

---

## 4. Sample Test Skeletons

> Note: These are skeleton structures. Actual implementation will be done in Day 3 once the algorithm code is ready from Member 1.

### candidateGeneration.test.ts
```typescript
import { generateCandidates } from "../../src/algorithm/allocation";

describe("Stage 1 - Candidate Generation", () => {

  const students = [
    { id: "A", team: "T1", status: "ACTIVE" },
    { id: "B", team: "T1", status: "ACTIVE" },
    { id: "C", team: "T2", status: "ACTIVE" },
    { id: "D", team: "T2", status: "INACTIVE" }
  ];

  test("T-01: Only ACTIVE students appear in candidate list", () => {
    const candidates = generateCandidates(students);
    candidates.forEach(s => {
      expect(s.status).toBe("ACTIVE");
    });
  });

  test("T-02: INACTIVE students are excluded", () => {
    const candidates = generateCandidates(students);
    const ids = candidates.map(s => s.id);
    expect(ids).not.toContain("D");
  });

});
```

---

### constraintFiltering.test.ts
```typescript
import { applyHardConstraints } from "../../src/algorithm/allocation";

describe("Stage 2 - Constraint Filtering", () => {

  const students = [
    { id: "A", team: "T1", status: "ACTIVE" },
    { id: "B", team: "T1", status: "ACTIVE" },
    { id: "C", team: "T2", status: "ACTIVE" },
    { id: "D", team: "T2", status: "ACTIVE" }
  ];

  const submission = { id: "SA", owner: "A" };

  test("T-03: Submission owner is removed from candidates", () => {
    const filtered = applyHardConstraints(students, submission);
    const ids = filtered.map(s => s.id);
    expect(ids).not.toContain("A");
  });

  test("T-04: Same-team students are removed from candidates", () => {
    const filtered = applyHardConstraints(students, submission);
    const ids = filtered.map(s => s.id);
    expect(ids).not.toContain("B");
  });

});
```

---

### allocationOutput.test.ts
```typescript
import { runAllocation } from "../../src/algorithm/allocation";

describe("Output Validation", () => {

  const input = {
    students: [
      { id: "A", team: "T1", status: "ACTIVE" },
      { id: "B", team: "T1", status: "ACTIVE" },
      { id: "C", team: "T2", status: "ACTIVE" },
      { id: "D", team: "T2", status: "ACTIVE" },
      { id: "E", team: "T3", status: "ACTIVE" },
      { id: "F", team: "T3", status: "ACTIVE" }
    ],
    submissions: [
      { id: "SA", owner: "A" },
      { id: "SB", owner: "B" },
      { id: "SC", owner: "C" }
    ]
  };

  let output: any;

  beforeAll(() => {
    output = runAllocation(input);
  });

  test("T-10: Every submission has exactly 2 reviewers", () => {
    output.allocations.forEach((a: any) => {
      expect(a.reviewers.length).toBe(2);
    });
  });

  test("T-11: No reviewer equals submission owner", () => {
    output.allocations.forEach((a: any) => {
      const submission = input.submissions.find(s => s.id === a.submission);
      a.reviewers.forEach((r: string) => {
        expect(r).not.toBe(submission?.owner);
      });
    });
  });

  test("T-14: No duplicate reviewer in same submission", () => {
    output.allocations.forEach((a: any) => {
      const unique = new Set(a.reviewers);
      expect(unique.size).toBe(a.reviewers.length);
    });
  });

  test("T-15: Allocation exists for every submission", () => {
    expect(output.allocations.length).toBe(input.submissions.length);
  });

});
```

---

### edgeCases.test.ts
```typescript
import { runAllocation } from "../../src/algorithm/allocation";

describe("Edge Cases", () => {

  test("T-17: All students same team → allocation blocked or warned", () => {
    const input = {
      students: [
        { id: "A", team: "T1", status: "ACTIVE" },
        { id: "B", team: "T1", status: "ACTIVE" },
        { id: "C", team: "T1", status: "ACTIVE" }
      ],
      submissions: [{ id: "SA", owner: "A" }]
    };
    const output = runAllocation(input);
    // Expect warning flag or empty reviewers
    expect(output.warnings).toBeDefined();
  });

  test("T-16: Less than 2 eligible reviewers → warning generated", () => {
    const input = {
      students: [
        { id: "A", team: "T1", status: "ACTIVE" },
        { id: "B", team: "T1", status: "ACTIVE" }
      ],
      submissions: [{ id: "SA", owner: "A" }]
    };
    const output = runAllocation(input);
    expect(output.warnings).toBeDefined();
  });

});
```

---

*Actual test implementation will happen on Day 3 after Member 1 shares the algorithm source code.*
