import { filterCandidates, sortCandidates } from "../services/allocation.service";

describe("Peer Review Allocation Algorithm - Unit Tests", () => {
  // Test data based on Muskan's test-plan.md
  const mockStudents = [
    { id: "student-a", name: "Alice", email: "alice@lms.com", status: "ACTIVE", reviewCount: 2, teamId: "team-t1" },
    { id: "student-b", name: "Bob", email: "bob@lms.com", status: "ACTIVE", reviewCount: 1, teamId: "team-t1" },
    { id: "student-c", name: "Carol", email: "carol@lms.com", status: "ACTIVE", reviewCount: 0, teamId: "team-t2" },
    { id: "student-d", name: "David", email: "david@lms.com", status: "ACTIVE", reviewCount: 3, teamId: "team-t2" },
    { id: "student-e", name: "Eva", email: "eva@lms.com", status: "ACTIVE", reviewCount: 0, teamId: "team-t3" },
    { id: "student-f", name: "Frank", email: "frank@lms.com", status: "INACTIVE", reviewCount: 0, teamId: "team-t3" }, // Inactive student
  ];

  describe("Stage 2 - Hard Constraint Filtering (filterCandidates)", () => {
    test("TC-HC-05: Only ACTIVE students should be included (excludes Student F)", () => {
      const existing = new Set<string>();
      const filtered = filterCandidates(mockStudents, "student-a", "team-t1", existing);
      const ids = filtered.map((s) => s.id);
      expect(ids).not.toContain("student-f");
    });

    test("TC-HC-01: No Self Review - Should exclude submission owner (Alice / student-a)", () => {
      const existing = new Set<string>();
      const filtered = filterCandidates(mockStudents, "student-a", "team-t1", existing);
      const ids = filtered.map((s) => s.id);
      expect(ids).not.toContain("student-a");
    });

    test("TC-HC-02: No Same Team Review - Should exclude team members (Bob / student-b, team-t1)", () => {
      const existing = new Set<string>();
      const filtered = filterCandidates(mockStudents, "student-a", "team-t1", existing);
      const ids = filtered.map((s) => s.id);
      expect(ids).not.toContain("student-b");
    });

    test("TC-HC-04: No Duplicate Review Assignment - Should exclude already assigned reviewers", () => {
      const existing = new Set<string>(["student-c"]);
      const filtered = filterCandidates(mockStudents, "student-a", "team-t1", existing);
      const ids = filtered.map((s) => s.id);
      expect(ids).not.toContain("student-c");
    });

    test("Combined Hard Constraints - For Alice (team-t1), should leave only Carol (student-c), David (student-d), and Eva (student-e)", () => {
      const existing = new Set<string>();
      const filtered = filterCandidates(mockStudents, "student-a", "team-t1", existing);
      const ids = filtered.map((s) => s.id);
      // Alice is owner (filtered)
      // Bob is same team (filtered)
      // Frank is inactive (filtered)
      // Carol, David, Eva should remain
      expect(ids).toEqual(["student-c", "student-d", "student-e"]);
    });
  });

  describe("Stage 3 & 4 - Soft Constraints & Workload Balancing (sortCandidates)", () => {
    test("TC-SC-02: Workload Balancing - Should sort candidates by reviewCount ascending", () => {
      const pool = [
        { id: "student-c", reviewCount: 3 },
        { id: "student-d", reviewCount: 1 },
        { id: "student-e", reviewCount: 0 },
      ];
      const pairHistory: any[] = [];
      const relaxed: string[] = [];

      const { sortedPool } = sortCandidates(pool, pairHistory, "student-a", 2, relaxed, "sub-sa");
      const ids = sortedPool.map((s) => s.id);
      expect(ids).toEqual(["student-e", "student-d", "student-c"]); // 0, 1, 3
    });

    test("TC-SC-01: Avoid Repeat Reviewer Pairs - Should deprioritize / remove prior reviewers if pool is large enough", () => {
      // Pool contains C, D, E
      const pool = [
        { id: "student-c", reviewCount: 0 },
        { id: "student-d", reviewCount: 0 },
        { id: "student-e", reviewCount: 0 },
      ];
      // Carol (student-c) previously reviewed Alice (student-a)
      const pairHistory = [
        { reviewerId: "student-c", revieweeId: "student-a", assignmentId: "assign-0" }
      ];
      const relaxed: string[] = [];

      const { sortedPool, sc01Applied } = sortCandidates(pool, pairHistory, "student-a", 2, relaxed, "sub-sa");
      const ids = sortedPool.map((s) => s.id);

      expect(sc01Applied).toBe(true);
      expect(ids).not.toContain("student-c"); // Carol is removed because she's a repeat pair and pool has 2 others (D, E)
      expect(ids).toEqual(["student-d", "student-e"]);
      expect(relaxed.length).toBe(0);
    });

    test("TC-SC-01 (Relaxed): Avoid Repeat Reviewer Pairs - Should relax constraint if removing repeat pairs leaves too few candidates", () => {
      // Pool only has C and D
      const pool = [
        { id: "student-c", reviewCount: 0 },
        { id: "student-d", reviewCount: 0 },
      ];
      // Carol (student-c) previously reviewed Alice (student-a)
      const pairHistory = [
        { reviewerId: "student-c", revieweeId: "student-a", assignmentId: "assign-0" }
      ];
      const relaxed: string[] = [];

      const { sortedPool, sc01Applied } = sortCandidates(pool, pairHistory, "student-a", 2, relaxed, "sub-sa");
      const ids = sortedPool.map((s) => s.id);

      expect(sc01Applied).toBe(false); // Relaxed!
      expect(ids).toContain("student-c"); // Carol is retained
      expect(ids).toEqual(["student-c", "student-d"]);
      expect(relaxed).toContain("SC-01 relaxed for submission sub-sa");
    });
  });
});
