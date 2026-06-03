// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  ApiError;
}

export interface ApiError {
  code:     string;
  message:  string;
  details?: Record<string, unknown>;
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface StudentInput {
  name:   string;
  email:  string;
  teamId: string;
}

export interface TeamInput {
  name:         string;
  assignmentId: string;
}

export interface SubmissionInput {
  assignmentId: string;
  ownerId:      string;
}

export interface ReviewSubmitInput {
  score: number;   // 0–100
}

export interface LoginInput {
  email:    string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  role:   "INSTRUCTOR" | "STUDENT";
}

// ─── Allocation Types ─────────────────────────────────────────────────────────

export interface AllocationResult {
  submissionId:      string;
  assignedReviewers: string[];
  tasksCreated:      number;
}

export interface AllocationSummary {
  totalSubmissions:   number;
  tasksCreated:       number;
  submissionsCovered: number;
  relaxedConstraints: string[];
  durationMs:         number;
}
