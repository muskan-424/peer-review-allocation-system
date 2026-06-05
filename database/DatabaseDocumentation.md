# Database Documentation

## Team Table

Purpose:
Stores team information used for reviewer allocation.

Columns:
- team_id (Primary Key)
- team_name

Relationship:
One Team can have many Students.

---

## Student Table

Purpose:
Stores student information and workload tracking.

Columns:
- student_id (Primary Key)
- name
- email
- status
- review_count
- team_id (Foreign Key)

Relationship:
Belongs to one Team.
Can own many Submissions.
Can perform many Reviews.

---

## Submission Table

Purpose:
Stores assignment submissions uploaded by students.

Columns:
- submission_id (Primary Key)
- owner_id (Foreign Key)
- assignment_id
- submitted_at
- review_count
- status

Relationship:
Belongs to one Student.
Can have multiple ReviewTasks.

---

## ReviewTask Table

Purpose:
Stores reviewer assignments.

Columns:
- task_id
- submission_id
- reviewer_id
- assigned_at
- completed_at
- score
- status

Relationship:
Links Students and Submissions.

---

## PairHistory Table

Purpose:
Stores reviewer-reviewee history.

Columns:
- history_id
- reviewer_id
- reviewee_id
- assignment_id
- pair_count

Relationship:
Used to avoid repeated reviewer assignments.