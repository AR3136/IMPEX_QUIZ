import os
import zipfile
import xml.etree.ElementTree as ET
import collections
import json
import sys

BASE_DIR = r"C:\Users\Admin\Desktop\Quiz"
WORKBOOK_PATH = os.path.join(BASE_DIR, "IMTEX_Quiz_Question_Bank_3_Options.xlsx")
OUTPUT_TS_PATH = os.path.join(BASE_DIR, "api", "_lib", "questionBank.ts")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "api", "_lib", "questionBank.json")

def read_sheet(zip_ref, sheet_path):
    # Normalize path
    normalized = sheet_path.replace("\\", "/").lstrip("/")
    if not normalized.startswith("xl/") and ("xl/" + normalized) in zip_ref.namelist():
        normalized = "xl/" + normalized

    tree = ET.fromstring(zip_ref.read(normalized))
    rows = []
    for row in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
        cells = []
        for c in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            t = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
            val = v.text if v is not None else (t.text if t is not None else '')
            cells.append(val.strip() if val else '')
        if any(cells):
            rows.append(cells)
    return rows

def validate_and_load(workbook_path=WORKBOOK_PATH):
    print(f"Loading and validating workbook: {workbook_path}")
    if not os.path.exists(workbook_path):
        raise FileNotFoundError(f"Workbook not found at {workbook_path}")

    with zipfile.ZipFile(workbook_path) as z:
        # 1. Verify sheet names
        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheet_map = {}
        for s in wb_tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            name = s.attrib.get('name')
            r_id = s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            sheet_map[name] = r_id

        print(f"Found sheets: {list(sheet_map.keys())}")
        if 'Question Bank' not in sheet_map:
            raise ValueError("Required sheet 'Question Bank' is missing from workbook.")
        if 'Answer Key' not in sheet_map:
            raise ValueError("Required sheet 'Answer Key' is missing from workbook.")

        # Resolve relationship targets
        rels_tree = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rel_paths = {}
        for r in rels_tree.iter('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
            rel_paths[r.attrib.get('Id')] = r.attrib.get('Target')

        def resolve_target(tid):
            t = rel_paths[tid].replace('\\', '/').lstrip('/')
            if not t.startswith('xl/'):
                t = 'xl/' + t
            return t

        q_sheet_path = resolve_target(sheet_map['Question Bank'])
        a_sheet_path = resolve_target(sheet_map['Answer Key'])

        q_rows = read_sheet(z, q_sheet_path)
        a_rows = read_sheet(z, a_sheet_path)

    errors = []
    warnings = []

    # 2. Validate Question Bank Header
    expected_q_header = ['Question ID', 'Section', 'Question', 'Option A', 'Option B', 'Option C', 'Correct answer']
    q_header = q_rows[0]
    print(f"Question Bank Header: {q_header}")
    if q_header != expected_q_header:
        errors.append(f"Header mismatch in 'Question Bank'. Expected: {expected_q_header}, Found: {q_header}")

    # 3. Validate Answer Key Header
    expected_a_header = ['Question ID', 'Section', 'Correct answer']
    a_header = a_rows[0]
    print(f"Answer Key Header: {a_header}")
    if a_header != expected_a_header:
        errors.append(f"Header mismatch in 'Answer Key'. Expected: {expected_a_header}, Found: {a_header}")

    # 4. Parse & Validate Question Records
    questions = []
    seen_ids = set()
    section_counts = collections.defaultdict(int)

    for row_idx, row in enumerate(q_rows[1:], start=2):
        if len(row) < 7:
            errors.append(f"Row {row_idx}: Incomplete row, expected 7 columns, got {len(row)}: {row}")
            continue

        q_id_str, section, question_text, opt_a, opt_b, opt_c, ans_raw = row[:7]

        # Validate Question ID
        try:
            q_id = int(q_id_str)
            if q_id in seen_ids:
                errors.append(f"Row {row_idx}: Duplicate Question ID: {q_id}")
            seen_ids.add(q_id)
        except ValueError:
            errors.append(f"Row {row_idx}: Invalid Question ID '{q_id_str}' - must be an integer")
            q_id = None

        # Validate Section
        if not section or not section.strip():
            errors.append(f"Row {row_idx} (ID {q_id}): Missing section name")
        else:
            section_counts[section.strip()] += 1

        # Validate Question text
        if not question_text or not question_text.strip():
            errors.append(f"Row {row_idx} (ID {q_id}): Question text is empty")

        # Validate Options A, B, C (exactly three non-empty options)
        if not opt_a or not opt_a.strip():
            errors.append(f"Row {row_idx} (ID {q_id}): Option A is empty")
        if not opt_b or not opt_b.strip():
            errors.append(f"Row {row_idx} (ID {q_id}): Option B is empty")
        if not opt_c or not opt_c.strip():
            errors.append(f"Row {row_idx} (ID {q_id}): Option C is empty")

        # Validate Correct Answer (must be A, B, or C)
        ans = ans_raw.upper().strip()
        if ans not in ('A', 'B', 'C'):
            errors.append(f"Row {row_idx} (ID {q_id}): Invalid Correct Answer '{ans_raw}'. Must be strictly 'A', 'B', or 'C'")

        questions.append({
            "id": q_id,
            "section": section.strip(),
            "question": question_text.strip(),
            "options": {
                "A": opt_a.strip(),
                "B": opt_b.strip(),
                "C": opt_c.strip()
            },
            "correctAnswer": ans
        })

    # 5. Check count = 50
    if len(questions) != 50:
        errors.append(f"Expected exactly 50 questions, found {len(questions)}")

    # 6. Check IDs span 1 to 50
    expected_ids = set(range(1, 51))
    missing_ids = expected_ids - seen_ids
    if missing_ids:
        errors.append(f"Missing Question IDs: {sorted(list(missing_ids))}")

    # 7. Check Section distribution (10 per each of 5 sections)
    print("\nSection Breakdown:")
    for sec_name, count in sorted(section_counts.items()):
        print(f"  * {sec_name}: {count} questions")
        if count != 10:
            errors.append(f"Section '{sec_name}' contains {count} questions (expected exactly 10)")

    if len(section_counts) != 5:
        errors.append(f"Expected exactly 5 sections, found {len(section_counts)}: {list(section_counts.keys())}")

    # 8. Cross-check with Sheet 2: Answer Key
    ak_map = {}
    for row_idx, row in enumerate(a_rows[1:], start=2):
        if len(row) >= 3:
            try:
                ak_id = int(row[0])
                ak_sec = row[1].strip()
                ak_ans = row[2].upper().strip()
                ak_map[ak_id] = {"section": ak_sec, "answer": ak_ans}
            except ValueError:
                errors.append(f"Answer Key Row {row_idx}: Non-integer Question ID '{row[0]}'")

    if len(ak_map) != 50:
        errors.append(f"Answer Key sheet has {len(ak_map)} rows (expected 50)")

    for q in questions:
        q_id = q["id"]
        if q_id not in ak_map:
            errors.append(f"Question ID {q_id} missing from Answer Key sheet")
        else:
            ak_entry = ak_map[q_id]
            if ak_entry["answer"] != q["correctAnswer"]:
                errors.append(f"Answer Key Mismatch for ID {q_id}: Question Bank says '{q['correctAnswer']}' but Answer Key says '{ak_entry['answer']}'")
            if ak_entry["section"] != q["section"]:
                warnings.append(f"Section label discrepancy for ID {q_id}: '{q['section']}' vs '{ak_entry['section']}'")

    # 9. Final Validation Report
    print("\n" + "=" * 60)
    print("VALIDATION REPORT FOR IMTEX QUESTION BANK WORKBOOK")
    print("=" * 60)
    print(f"Total Questions Parsed: {len(questions)}")
    print(f"Unique Question IDs: {len(seen_ids)}")
    print(f"Total Sections: {len(section_counts)}")
    print(f"Validation Errors: {len(errors)}")
    print(f"Validation Warnings: {len(warnings)}")

    if errors:
        print("\n[ERROR] VALIDATION FAILED! The following errors must be reported:")
        for idx, err in enumerate(errors, 1):
            print(f"  {idx}. {err}")
        return False, errors, warnings, []

    print("\n[SUCCESS] VALIDATION PASSED! All 50 questions across 5 sections are 100% compliant.")
    if warnings:
        for w in warnings:
            print(f"  [WARN] Warning: {w}")

    return True, errors, warnings, questions

def generate_server_question_bank(questions):
    """
    Saves the questions to server-only files:
    1. api/_lib/questionBank.json
    2. api/_lib/questionBank.ts
    Ensures answers are NEVER exposed to client-side bundles.
    """
    os.makedirs(os.path.dirname(OUTPUT_TS_PATH), exist_ok=True)

    # 1. Server JSON
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"Saved: {OUTPUT_JSON_PATH}")

    # 2. Server TypeScript Module
    q_json_str = json.dumps(questions, indent=2, ensure_ascii=False)

    ts_code = f'''import {{ Question, ClientQuestion, AnswerOption, QuizAttemptInfo }} from './types.js';

/**
 * MASTER QUESTION BANK (50 QUESTIONS)
 * Source: IMTEX_Quiz_Question_Bank_3_Options.xlsx
 *
 * NOTE: This file is strictly kept on the server/serverless layer.
 * It is never bundled into public client application code.
 */
export const MASTER_QUESTION_BANK: Question[] = {q_json_str};

// Track active and completed quiz attempts to prevent duplicate submissions
const activeAttempts = new Map<string, {{ questionIds: number[]; createdAt: number }}>();
const completedAttempts = new Set<string>();

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray<T>(arr: T[]): T[] {{
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {{
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }}
  return copy;
}}

/**
 * Generate a randomized quiz attempt:
 * 1. Exactly 5 sections.
 * 2. Exactly 2 distinct questions sampled without replacement from each section.
 * 3. Exactly 10 questions total.
 * 4. Randomized presentation order.
 * 5. Exactly 3 selectable options per question.
 * 6. Strips correctAnswer so frontend never receives answers.
 */
export function generateRandomQuizAttempt(): QuizAttemptInfo {{
  const bySection = new Map<string, Question[]>();
  for (const q of MASTER_QUESTION_BANK) {{
    const sec = q.section;
    if (!bySection.has(sec)) bySection.set(sec, []);
    bySection.get(sec)!.push(q);
  }}

  if (bySection.size !== 5) {{
    throw new Error(`Expected exactly 5 sections, found ${{bySection.size}}`);
  }}

  const selectedQuestions: Question[] = [];

  // Sample exactly 2 distinct questions without replacement from each section
  for (const [secName, sectionQuestions] of bySection.entries()) {{
    if (sectionQuestions.length < 2) {{
      throw new Error(`Section "${{secName}}" has fewer than 2 questions`);
    }}
    const shuffled = shuffleArray(sectionQuestions);
    selectedQuestions.push(shuffled[0], shuffled[1]);
  }}

  // Total must be exactly 10
  if (selectedQuestions.length !== 10) {{
    throw new Error(`Expected 10 selected questions, got ${{selectedQuestions.length}}`);
  }}

  // Randomize the presentation order of the 10 questions
  const randomizedQuestions = shuffleArray(selectedQuestions);

  // Generate unique quiz attempt ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const attemptId = `ATTEMPT-${{dateStr}}-${{randomSuffix}}`;

  // Store in active registry
  activeAttempts.set(attemptId, {{
    questionIds: randomizedQuestions.map(q => q.id),
    createdAt: Date.now()
  }});

  // Strip correctAnswer for public client transmission
  const clientQuestions: ClientQuestion[] = randomizedQuestions.map(
    ({{ correctAnswer, ...sanitized }}) => sanitized
  );

  return {{
    attemptId,
    questions: clientQuestions,
    total: clientQuestions.length
  }};
}}

export function isAttemptAlreadyCompleted(attemptId: string): boolean {{
  return completedAttempts.has(attemptId);
}}

/**
 * Authoritative server-side grading and duplicate prevention.
 * Throws an error if the attempt has already been submitted.
 * Returns only the final total score (0 to 10) and maximum score of 10.
 */
export function gradeAndFinalizeAttempt(
  attemptId: string,
  answers: any
): {{ score: number; maxScore: 10 }} {{
  // 1. Guard against duplicate submissions
  if (completedAttempts.has(attemptId)) {{
    const err = new Error(`Duplicate submission: Quiz attempt ${{attemptId}} has already been submitted.`);
    (err as any).statusCode = 409;
    throw err;
  }}

  // Lookup question map
  const questionMap = new Map<number, Question>();
  MASTER_QUESTION_BANK.forEach(q => questionMap.set(q.id, q));

  // Normalize answers into a Map<number, string>
  const answerMap = new Map<number, string>();
  if (Array.isArray(answers)) {{
    for (const item of answers) {{
      const qId = Number(item?.questionId ?? item?.id);
      const val = String(item?.selectedOption ?? item?.answer ?? item?.option ?? '');
      if (qId && val) answerMap.set(qId, val);
    }}
  }} else if (answers && typeof answers === 'object') {{
    for (const [k, v] of Object.entries(answers)) {{
      const qId = Number(k);
      const val = typeof v === 'string' ? v : (v as any)?.selectedOption ?? (v as any)?.answer ?? '';
      if (qId && val) answerMap.set(qId, String(val));
    }}
  }}

  // Determine question set for this attempt
  const attemptData = activeAttempts.get(attemptId);
  const questionIds = attemptData
    ? attemptData.questionIds
    : Array.from(answerMap.keys());

  // Calculate score: +1 for each correct answer
  let score = 0;
  for (const qId of questionIds) {{
    const q = questionMap.get(qId);
    if (!q) continue;

    const userAns = answerMap.get(qId);
    if (userAns && userAns.toUpperCase() === q.correctAnswer) {{
      score += 1;
    }}
  }}

  // Clamp score strictly between 0 and 10
  score = Math.max(0, Math.min(10, score));

  // Mark attempt as completed to permanently block duplicate submissions
  completedAttempts.add(attemptId);
  activeAttempts.delete(attemptId);

  return {{
    score,
    maxScore: 10
  }};
}}

/**
 * Get sanitized client questions (correctAnswer strictly stripped).
 */
export function getClientQuestions(countParam?: number | string): ClientQuestion[] {{
  const res = generateRandomQuizAttempt();
  return res.questions;
}}
'''
    with open(OUTPUT_TS_PATH, "w", encoding="utf-8") as f:
        f.write(ts_code)
    print(f"Saved: {OUTPUT_TS_PATH}")

if __name__ == '__main__':
    wb = sys.argv[1] if len(sys.argv) > 1 else WORKBOOK_PATH
    is_valid, errors, warnings, questions = validate_and_load(wb)
    if not is_valid:
        print("\nStopping import due to validation errors.")
        sys.exit(1)
    
    generate_server_question_bank(questions)
    print("\nQuestion bank import & server generation complete.")
