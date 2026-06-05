-- Total Students
SELECT COUNT(*) FROM "Student";

-- Total Teams
SELECT COUNT(*) FROM "Team";

-- Total Submissions
SELECT COUNT(*) FROM "Submission";

-- Average Review Count
SELECT AVG(review_count)
FROM "Student";