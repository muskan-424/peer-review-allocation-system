# Validation Approach & Analytics Metrics
**Prepared by:** Member 5 — QA & Analytics Engineer  
**Project:** Peer Review Allocation with Conflict Rules  
**Day:** 2  

---

## Table of Contents

1. [Validation Strategy Overview](#1-validation-strategy-overview)
2. [Algorithm Output Validation](#2-algorithm-output-validation)
3. [Stage-wise Validation Checks](#3-stage-wise-validation-checks)
4. [Analytics Metrics Definition](#4-analytics-metrics-definition)
5. [Reporting Metrics for Instructor Dashboard](#5-reporting-metrics-for-instructor-dashboard)
6. [Validation Flow](#6-validation-flow)

---

## 1. Validation Strategy Overview

The validation approach is based on the 4-stage reviewer selection strategy defined by the Algorithm Engineer.

| Stage | Algorithm Action | QA Validation |
|-------|-----------------|---------------|
| Stage 1 | Candidate Generation | Verify all active students are in candidate list |
| Stage 2 | Constraint Filtering | Verify owner, same-team, inactive, duplicates are removed |
| Stage 3 | Fairness Filtering | Verify previous pairs are deprioritized |
| Stage 4 | Workload Balancing | Verify reviewer with lowest workload is selected first |

---

## 2. Algorithm Output Validation

### Expected Input Format
```json
{
  "students": [
    { "id": "A", "team": "T1", "status": "ACTIVE" },
    { "id": "B", "team": "T1", "status": "ACTIVE" },
    { "id": "C", "team": "T2", "status": "ACTIVE" }
  ],
  "submissions": [
    { "id": "SA", "owner": "A" },
    { "id": "SB", "owner": "B" }
  ]
}
```

### Expected Output Format
```json
{
  "allocations": [
    { "submission": "SA", "reviewers": ["C", "D"] },
    { "submission": "SB", "reviewers": ["E", "F"] }
  ]
}
```

### Output Validation Checks

| Check ID | What to Validate | Rule |
|----------|-----------------|------|
| OV-01 | Every submission has exactly 2 reviewers | reviewers.length === 2 |
| OV-02 | No reviewer is the submission owner | reviewer !== submission.owner |
| OV-03 | No two reviewers are from the same team as owner | reviewer.team !== owner.team |
| OV-04 | All assigned reviewers have status = ACTIVE | reviewer.status === "ACTIVE" |
| OV-05 | No duplicate reviewer in same submission | reviewers array has no repeated IDs |
| OV-06 | Output contains allocation for every submission | allocations.length === submissions.length |

---

## 3. Stage-wise Validation Checks

### Stage 1 — Candidate Generation Validation

**What to check:**
- Candidate list contains all students initially
- Only ACTIVE students are included

```
Input:  students = [A(ACTIVE), B(ACTIVE), C(ACTIVE), D(INACTIVE)]
Expected Candidates: [A, B, C]   ← D excluded because INACTIVE
```

---

### Stage 2 — Constraint Filtering Validation

**What to check after filtering:**
- Submission owner is NOT in the list
- Same-team students are NOT in the list
- Already assigned reviewers are NOT in the list

```
Submission: SA, Owner: A (Team T1)
Before Filter: [A, B, C, D, E, F]
After Filter:  [C, D, E, F]
Removed: A (owner), B (same team T1)
```

---

### Stage 3 — Fairness Filtering Validation

**What to check:**
- If PairHistory exists between reviewer X and submission owner Y, X should be deprioritized
- A reviewer with no prior history should appear before one with history

```
PairHistory: A reviewed C before
Submission: SC (Owner: C)
Expected: A is deprioritized, others preferred over A
```

---

### Stage 4 — Workload Balancing Validation

**What to check:**
- Reviewer with lowest assigned reviews is selected first
- Sorted order is correct before selection

```
Eligible: [C(2 reviews), D(1 review), E(0 reviews), F(3 reviews)]
Expected Sort Order: E → D → C → F
Selected: E, D
```

---

## 4. Analytics Metrics Definition

These metrics will be calculated after allocation is complete and displayed on the instructor dashboard.

### Coverage Metrics

| Metric ID | Metric Name | Formula | Target |
|-----------|------------|---------|--------|
| AM-01 | Review Coverage % | (Submissions with >= 2 reviews / Total Submissions) × 100 | 100% |
| AM-02 | Total Review Tasks Generated | Count of all ReviewTask records | 2 × Total Submissions |
| AM-03 | Unreviewed Submissions Count | Submissions with review_count < 2 | 0 |

### Fairness Metrics

| Metric ID | Metric Name | Formula | Target |
|-----------|------------|---------|--------|
| AM-04 | Workload Distribution | Max reviews assigned - Min reviews assigned | As low as possible |
| AM-05 | Average Reviews Per Reviewer | Total Tasks / Total Active Students | Equal distribution |
| AM-06 | Repeat Pair Count | Count of (reviewer, reviewee) pairs that appear more than once | 0 (ideal) |

### Conflict Avoidance Metrics

| Metric ID | Metric Name | Formula | Target |
|-----------|------------|---------|--------|
| AM-07 | Same-Team Conflicts Avoided | Count of same-team pairs blocked | Should match violations attempted |
| AM-08 | Self-Review Attempts Blocked | Count of self-review attempts rejected | Should match violations attempted |
| AM-09 | Constraint Violation Count | Total hard constraint violations in final output | 0 |

---

## 5. Reporting Metrics for Instructor Dashboard

These are the final metrics the instructor will see on Day 5 reporting view.

| Dashboard Card | Metric | Visual |
|---------------|--------|--------|
| Review Coverage | AM-01 — Coverage % | Progress bar / percentage |
| Total Tasks | AM-02 — Total review tasks | Number card |
| Pending Reviews | AM-03 — Unreviewed submissions | Warning count |
| Workload Balance | AM-04 — Max - Min spread | Bar chart per reviewer |
| Conflicts Avoided | AM-07 + AM-08 — Blocked attempts | Counter |
| Fairness Score | AM-06 — Repeat pairs | Lower = better |

---

## 6. Validation Flow

```
Algorithm Output Received
        ↓
OV-01: Every submission has 2 reviewers?
        ↓ YES
OV-02: No reviewer is the owner?
        ↓ YES
OV-03: No same-team reviewer?
        ↓ YES
OV-04: All reviewers are ACTIVE?
        ↓ YES
OV-05: No duplicates in reviewers list?
        ↓ YES
OV-06: All submissions have allocations?
        ↓ YES
   ALLOCATION VALID ✅
        ↓
Calculate Analytics Metrics (AM-01 to AM-09)
        ↓
Send to Instructor Dashboard
```

---

*This document will be used in Day 3 for writing actual Jest test cases.*
