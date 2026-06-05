-- Email should be unique
ALTER TABLE Student
ADD CONSTRAINT unique_email UNIQUE(email);

-- Prevent duplicate review assignment
ALTER TABLE ReviewTask
ADD CONSTRAINT unique_review_assignment
UNIQUE(submission_id, reviewer_id);