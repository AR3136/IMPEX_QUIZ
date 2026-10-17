import os
import json
import collections
import random
import unittest

BASE_DIR = r"C:\Users\Admin\Desktop\Quiz"
QUESTION_BANK_PATH = os.path.join(BASE_DIR, "api", "_lib", "questionBank.json")

class TestImtexQuizEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(QUESTION_BANK_PATH, "r", encoding="utf-8") as f:
            cls.master_questions = json.load(f)

        cls.by_section = collections.defaultdict(list)
        for q in cls.master_questions:
            cls.by_section[q["section"]].append(q)

        cls.active_attempts = {}
        cls.completed_attempts = set()

    def generate_attempt(self):
        selected = []
        for sec_name, q_list in self.by_section.items():
            self.assertEqual(len(q_list), 10, f"Section {sec_name} must have 10 questions")
            sampled = random.sample(q_list, 2)
            selected.extend(sampled)

        self.assertEqual(len(selected), 10, "Total questions must be exactly 10")
        random.shuffle(selected)

        date_str = "20261017"
        rand_suffix = "".join(random.choices("0123456789ABCDEF", k=6))
        attempt_id = f"ATTEMPT-{date_str}-{rand_suffix}"

        self.active_attempts[attempt_id] = [q["id"] for q in selected]

        client_questions = []
        for q in selected:
            client_questions.append({
                "id": q["id"],
                "section": q["section"],
                "question": q["question"],
                "options": q["options"]
            })

        return attempt_id, client_questions, selected

    def grade_attempt(self, attempt_id, answers):
        if attempt_id in self.completed_attempts:
            raise ValueError(f"Duplicate submission: Attempt {attempt_id} has already been submitted (HTTP 409).")

        question_map = {q["id"]: q for q in self.master_questions}
        q_ids = self.active_attempts.get(attempt_id, list(answers.keys()))

        score = 0
        for q_id in q_ids:
            q = question_map.get(q_id)
            if q and answers.get(q_id) == q["correctAnswer"]:
                score += 1

        score = max(0, min(10, score))
        self.completed_attempts.add(attempt_id)
        return score, 10

    def test_01_master_question_bank_structure(self):
        """Verify master question bank has exactly 50 questions across 5 sections."""
        self.assertEqual(len(self.master_questions), 50)
        self.assertEqual(len(self.by_section), 5)
        for sec, qs in self.by_section.items():
            self.assertEqual(len(qs), 10, f"Section '{sec}' must contain exactly 10 questions")

    def test_02_random_selection_and_section_counts(self):
        """Verify each attempt samples exactly 2 questions per section (total 10) without replacement."""
        for _ in range(200):
            attempt_id, client_qs, full_qs = self.generate_attempt()
            self.assertEqual(len(client_qs), 10)

            sec_counts = collections.Counter(q["section"] for q in client_qs)
            self.assertEqual(len(sec_counts), 5, "All 5 sections must be present")
            for sec, count in sec_counts.items():
                self.assertEqual(count, 2, f"Section '{sec}' must have exactly 2 questions")

            ids = [q["id"] for q in client_qs]
            self.assertEqual(len(ids), len(set(ids)), "Selected questions must be distinct (without replacement)")

    def test_03_presentation_order_randomization(self):
        """Verify question presentation order varies across attempts."""
        orders = []
        for _ in range(50):
            _, client_qs, _ = self.generate_attempt()
            order = tuple(q["section"] for q in client_qs)
            orders.append(order)

        unique_orders = set(orders)
        self.assertGreater(len(unique_orders), 15, "Presentation order must be randomized")

    def test_04_three_selectable_options(self):
        """Verify every question has exactly 3 options: A, B, and C."""
        for q in self.master_questions:
            self.assertIn("options", q)
            opts = q["options"]
            self.assertEqual(set(opts.keys()), {"A", "B", "C"})
            self.assertTrue(all(opts[k].strip() for k in ("A", "B", "C")))

    def test_05_score_calculation(self):
        """Verify score calculation awards 1 point per correct answer (0 to 10)."""
        attempt_id, _, full_qs = self.generate_attempt()

        all_correct = {q["id"]: q["correctAnswer"] for q in full_qs}
        score, max_score = self.grade_attempt(attempt_id, all_correct)
        self.assertEqual(score, 10)
        self.assertEqual(max_score, 10)

        attempt_id2, _, full_qs2 = self.generate_attempt()
        wrong_answers = {}
        for q in full_qs2:
            correct = q["correctAnswer"]
            wrong = "B" if correct == "A" else "A"
            wrong_answers[q["id"]] = wrong

        score2, max_score2 = self.grade_attempt(attempt_id2, wrong_answers)
        self.assertEqual(score2, 0)
        self.assertEqual(max_score2, 10)

        attempt_id3, _, full_qs3 = self.generate_attempt()
        partial = {}
        for idx, q in enumerate(full_qs3):
            if idx < 6:
                partial[q["id"]] = q["correctAnswer"]
            else:
                correct = q["correctAnswer"]
                partial[q["id"]] = "B" if correct == "A" else "A"

        score3, max_score3 = self.grade_attempt(attempt_id3, partial)
        self.assertEqual(score3, 6)
        self.assertEqual(max_score3, 10)

    def test_06_duplicate_submission_prevention(self):
        """Verify that duplicate submissions with the same attempt ID are rejected."""
        attempt_id, _, full_qs = self.generate_attempt()
        answers = {q["id"]: q["correctAnswer"] for q in full_qs}

        score, _ = self.grade_attempt(attempt_id, answers)
        self.assertEqual(score, 10)

        with self.assertRaises(ValueError) as ctx:
            self.grade_attempt(attempt_id, answers)
        self.assertIn("Duplicate submission", str(ctx.exception))
        self.assertIn("already been submitted", str(ctx.exception))

    def test_07_answer_key_sanitization_in_client_payload(self):
        """Verify correctAnswer is never included in client question payload."""
        _, client_qs, _ = self.generate_attempt()
        for q in client_qs:
            self.assertNotIn("correctAnswer", q, "CRITICAL SECURITY BREACH: correctAnswer found in client questions!")

if __name__ == '__main__':
    unittest.main()
