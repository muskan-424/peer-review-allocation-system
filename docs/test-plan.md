# QA Test Plan — Peer Review Allocation System

**Prepared by:** Member 5 — QA & Analytics Engineer  
---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Scope](#2-scope)
3. [Test Objectives](#3-test-objectives)
4. [Constraint Reference](#4-constraint-reference)
5. [Test Cases — Hard Constraints](#5-test-cases--hard-constraints)
6. [Test Cases — Soft Constraints](#6-test-cases--soft-constraints)
7. [Test Cases — Edge Cases](#7-test-cases--edge-cases)
8. [Test Cases — Database Constraints](#8-test-cases--database-constraints)
9. [Sample Test Data](#9-sample-test-data)
10. [Testing Tools](#10-testing-tools)
11. [QA Schedule](#11-qa-schedule)

---

## 1. Introduction

This test plan covers the quality assurance strategy for the Peer Review Allocation System.  
The system allocates peer reviewers to student submissions while enforcing conflict rules and fairness constraints.

The plan is based on:
- Algorithm constraints defined by Member 1 (Allocation Algorithm Engineer)
- Database schema defined by Member 3 (Database Engineer)

---

## 2. Scope

| Area | Included |
|------|----------|
| Allocation Algorithm Logic | Yes |
| Database Constraint Validation | Yes |
| Backend API Endpoints | Yes |
| Frontend UI Flows | Yes |
| Instructor Analytics / Reporting | Yes |

---

## 3. Test Objectives

- Verify all hard constraints are strictly enforced and never violated
- Verify soft constraints are applied wherever possible
- Validate database-level constraint enforcement
- Ensure every submission receives a minimum of 2 reviews
- Confirm reviewer workload is balanced across all students
- Validate correct handling of all identified edge cases
- Ensure instructor reporting metrics are accurate

---

## 4. Constraint Reference

### Hard Constraints (Must Never Be Violated)

| ID | Description |
|----|-------------|
| HC-01 | No Self Review — a student cannot review their own submission |
| HC-02 | No Same Team Review — same-team students cannot review each other |
| HC-03 | Minimum Two Reviews Per Submission |
| HC-04 | No Duplicate Review Assignment — same reviewer cannot be assigned to same submission twice |
| HC-05 | Reviewer Must Be Active — inactive students cannot be assigned |

### Soft Constraints (Applied When Possible)

| ID | Description |
|----|-------------|
| SC-01 | Avoid Repeat Reviewer Pairs across assignments |
| SC-02 | Balanced Reviewer Workload across all students |

---

## 5. Test Cases — Hard Constraints

### TC-HC-01 — No Self Review

| Field | Detail |
|-------|--------|
| **Constraint** | HC-01 |
| **Scenario** | Student A is the owner of Submission SA. System attempts to assign A as a reviewer for SA. |
| **Input** | Reviewer: A, Submission Owner: A |
| **Expected Result** | Assignment is REJECTED. A is removed from eligible reviewers list. |
| **Pass Condition** | System does not create a ReviewTask where reviewer_id = owner_id |

---

### TC-HC-02 — No Same Team Review

| Field | Detail |
|-------|--------|
| **Constraint** | HC-02 |
| **Scenario** | Student A (Team T1) and Student B (Team T1) are on the same team. System attempts to assign B as reviewer for SA. |
| **Input** | Reviewer: B (T1), Submission Owner: A (T1) |
| **Expected Result** | Assignment is REJECTED. B is filtered out from eligible reviewers. |
| **Pass Condition** | System does not create a ReviewTask where reviewer and owner share the same team_id |

---

### TC-HC-03 — Minimum Two Reviews Per Submission

| Field | Detail |
|-------|--------|
| **Constraint** | HC-03 |
| **Scenario** | Allocation runs but only 1 reviewer is assigned to Submission SA. |
| **Input** | SA has review_count = 1 after allocation |
| **Expected Result** | Allocation is flagged as INCOMPLETE. Warning is generated. |
| **Pass Condition** | No submission has review_count < 2 after a successful allocation run |

---

### TC-HC-04 — No Duplicate Review Assignment

| Field | Detail |
|-------|--------|
| **Constraint** | HC-04 |
| **Scenario** | Student D is already assigned to review SA. System attempts to assign D to SA again. |
| **Input** | Reviewer: D, Submission: SA (D already exists in ReviewTask for SA) |
| **Expected Result** | Duplicate assignment is REJECTED. |
| **Pass Condition** | Unique constraint on (reviewer_id, submission_id) in ReviewTask table is never violated |

---

### TC-HC-05 — Active Reviewers Only

| Field | Detail |
|-------|--------|
| **Constraint** | HC-05 |
| **Scenario** | Student F has status = inactive. System attempts to assign F as a reviewer. |
| **Input** | Reviewer: F, status: inactive |
| **Expected Result** | F is excluded from eligible reviewers list. Assignment is REJECTED. |
| **Pass Condition** | System only assigns reviewers where student.status = active |

---

## 6. Test Cases — Soft Constraints

### TC-SC-01 — Avoid Repeat Reviewer Pairs

| Field | Detail |
|-------|--------|
| **Constraint** | SC-01 |
| **Scenario** | In a previous assignment, A reviewed C. Current allocation attempts to assign A to review C again. |
| **Input** | PairHistory contains record: reviewer=A, reviewee=C |
| **Expected Result** | System prefers assigning A to D, E, or F instead of C. |
| **Pass Condition** | Reviewer with no prior history with the submission owner is preferred over one with existing history |

---

### TC-SC-02 — Balanced Reviewer Workload

| Field | Detail |
|-------|--------|
| **Constraint** | SC-02 |
| **Scenario** | After allocation, Student A has 6 review tasks while B and C each have 1. |
| **Input** | review_count: A=6, B=1, C=1 |
| **Expected Result** | System flags this as an unbalanced distribution. |
| **Pass Condition** | Review tasks are distributed evenly. Eligible reviewer with lowest review_count is preferred during assignment. |

---

## 7. Test Cases — Edge Cases

### TC-EC-01 — Less Than Two Eligible Reviewers Available

| Field | Detail |
|-------|--------|
| **Scenario** | After applying all hard constraints, fewer than 2 eligible reviewers remain for a submission. |
| **Input** | Eligible reviewers list has < 2 students after filtering |
| **Expected Result** | Allocation warning is raised. Instructor is notified. Manual intervention flag is set. |
| **Pass Condition** | System does not force an invalid assignment. Warning is logged and surfaced to instructor. |

---

### TC-EC-02 — All Students Belong to Same Team

| Field | Detail |
|-------|--------|
| **Scenario** | All students in the course are members of the same team. |
| **Input** | All students have team_id = T1 |
| **Expected Result** | HC-02 blocks all allocations. Instructor notification is generated. |
| **Pass Condition** | System does not allocate any reviews. Instructor is notified of the conflict. |

---

### TC-EC-03 — Reviewer Becomes Inactive After Assignment

| Field | Detail |
|-------|--------|
| **Scenario** | Student D was assigned to review SA, but later becomes inactive (drops the course). |
| **Input** | D's status changes to inactive after ReviewTask is created |
| **Expected Result** | Existing task is marked as unassigned. A new eligible reviewer is allocated to SA. |
| **Pass Condition** | SA still receives 2 completed reviews from active students |

---

### TC-EC-04 — Late Submission After Allocation Is Complete

| Field | Detail |
|-------|--------|
| **Scenario** | A new submission arrives after the main allocation run has already completed. |
| **Input** | New submission SG added after full allocation run |
| **Expected Result** | Partial allocation runs for SG only. 2 reviewers are assigned to SG. |
| **Pass Condition** | SG receives 2 reviewer assignments without disrupting existing allocations |

---

## 8. Test Cases — Database Constraints

| Test ID | Table | Field / Check | Scenario | Expected Result |
|---------|-------|---------------|----------|-----------------|
| TC-DB-01 | ReviewTask | reviewer_id ≠ owner_id | Insert task where reviewer = owner | Insert REJECTED |
| TC-DB-02 | ReviewTask | team_id mismatch check | Insert task where reviewer and owner share team | Insert REJECTED |
| TC-DB-03 | Submission | review_count >= 2 | Submission has only 1 review after allocation | Flag as incomplete |
| TC-DB-04 | ReviewTask | UNIQUE (reviewer_id, submission_id) | Insert duplicate reviewer-submission pair | Insert REJECTED |
| TC-DB-05 | Student | status = active check | Assign reviewer with status = inactive | Assignment skipped |
| TC-DB-06 | PairHistory | pair_count tracking | Same reviewer-reviewee assigned again | pair_count incremented, soft warning raised |

---

## 9. Sample Test Data

### Students

| Student ID | Name | Team |
|------------|------|------|
| S1 | A | T1 |
| S2 | B | T1 |
| S3 | C | T2 |
| S4 | D | T2 |
| S5 | E | T3 |
| S6 | F | T3 |

### Submissions

| Submission ID | Owner |
|---------------|-------|
| SA | A |
| SB | B |
| SC | C |
| SD | D |
| SE | E |
| SF | F |

### Expected Valid Allocation (Sample)

| Submission | Reviewer 1 | Reviewer 2 |
|------------|------------|------------|
| SA (Owner: A, Team T1) | C or D | E or F |
| SB (Owner: B, Team T1) | C or D | E or F |
| SC (Owner: C, Team T2) | A or B | E or F |
| SD (Owner: D, Team T2) | A or B | E or F |
| SE (Owner: E, Team T3) | A or B | C or D |
| SF (Owner: F, Team T3) | A or B | C or D |

---

## 10. Testing Tools

| Tool | Purpose |
|------|---------|
| Jest | Unit testing — algorithm logic and constraint validation |
| Postman | API endpoint testing |
| Prisma Studio | Database constraint verification |
| Manual Testing | UI flow and reviewer dashboard testing |

---

## 11. QA Schedule

| Day | QA Activity |
|-----|-------------|
| Day 1 | Requirements analysis, constraint study, test plan creation |
| Day 2 | Validation approach design, analytics metrics definition, test case refinement |
| Day 3 | Allocation result verification, constraint enforcement testing, fairness validation |
| Day 4 | Integration testing, end-to-end system testing, defect tracking |
| Day 5 | Performance analysis, instructor reporting validation, QA summary report |

---
