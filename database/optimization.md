# Database Query Optimization
Day 4 - Testing & Optimization

1. Verified Team table contains 3 teams.
2. Verified Student table contains 6 students.
3. Verified Submission table contains 6 submissions.
4. Tested unique email constraint.
5. Verified foreign key relationships between Team, Student and Submission.

## Indexes Added

1. student_id
2. team_id
3. reviewer_id
4. submission_id

## Purpose

- Faster record searching
- Faster reviewer allocation
- Improved query performance
- Better scalability for large datasets

## Constraints Tested

### No Self Review
Verified that a student cannot review their own submission.

### No Same Team Review
Verified that reviewers from the same team are excluded.

### No Duplicate Assignment
Verified duplicate reviewer-submission pairs are prevented.

### Active Reviewer Check
Verified only active students can be assigned.

### Minimum Two Reviews
Verified each submission receives at least two reviews.

