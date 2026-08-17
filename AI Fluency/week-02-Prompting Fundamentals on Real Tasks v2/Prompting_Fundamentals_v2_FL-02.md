# Prompting Fundamentals on Real Tasks v2

**Haroon Ameer Khan — FlyRank AI Fluency Track — Week 2 (FL-02)**

Task source: FL-01 workflow audit — "Debugging bugs in my own code" (Delegate to AI, then review). Real bug used throughout: an ID-collision bug in my CRUD API project, caused by generating new task IDs with `tasks.length + 1`, which breaks once tasks have been deleted.

---

## Baseline (Naive Prompt)

**Prompt:**
> "Fix my bug"

**Output:**
> "I'd need to see your code, the error you're getting, and what you expected to happen instead — can you share those details?"

---

## Version 1 — + Role Assignment

**Prompt:**
> "You are a senior backend engineer conducting a code review. Fix my bug: [CRUD API code + ID collision symptom]."

**Output:**
> "As a reviewer, I'd flag this immediately: your ID generation (`tasks.length + 1`) assumes the array never shrinks. That assumption breaks the moment deletes are allowed — which they are, per your DELETE endpoint. Replace it with `Math.max(...tasks.map(t => t.id), 0) + 1`, which derives the next ID from the data itself rather than the array's current size."

**Note:** Role assignment shifted the tone and framing — the output now reads like a peer-review comment rather than a neutral tutorial answer, and it explicitly connects the bug to the DELETE endpoint (systemic reasoning), not just the POST route in isolation.

---

## Version 2 — + Context and Motivation

**Prompt:**
> "[Same as above]. Context: this is a learning project for my internship, but I want to build habits that would hold up in a real production system — I don't want to learn a fix that only works by accident."

**Output:**
> "Given that goal, avoid the tempting-but-fragile fix of just resetting the counter or hardcoding around today's test data — that's exactly the kind of fix that works by accident. `Math.max(...tasks.map(t => t.id), 0) + 1` is the right habit because it derives correctness from actual state, not from assumptions about how the array was built up to this point — the same principle applies whether this is an in-memory array or a real database with auto-incrementing IDs."

**Note:** Adding motivation changed the depth of reasoning — the output warned against a fragile alternative I hadn't even asked about, and generalized the principle beyond this one bug because it understood why I cared, not just what I wanted fixed.

---

## Version 3 — + Few-Shot Example

**Prompt:**
> "[Same as above]. Here's an example of the kind of fix I'm looking for, from a past bug: 'Root cause: relied on array index instead of a stable key, breaking after reordering. Fix: switched to filtering by unique ID instead of array position. Why: index-based logic silently breaks under any mutation.' Follow this style — root cause, fix, and a one-line 'why' for the underlying principle."

**Output:**
> "Root cause: ID generation relied on `tasks.length`, an incidental property of the array's current size, instead of a stable derived value. Fix: `Math.max(...tasks.map(t => t.id), 0) + 1`. Why: any logic based on collection size instead of collection contents breaks silently the moment items are removed — the failure won't throw an error, it'll just quietly produce wrong data."

**Note:** The example locked in a consistent structure (root cause / fix / why) matching my example's format exactly, and mirrored my example's abstraction style — stating a general principle, not just the specific case.

---

## Version 4 — + Output Structure

**Prompt:**
> "[Same as above]. Format your answer with three labeled sections: 'Root Cause', 'Fix' (as a code block), and 'Verification Steps' (a numbered list of requests to run to confirm it works)."

**Output:**
> **Root Cause:** ID generation used `tasks.length`, a value that shrinks when items are deleted, causing new IDs to collide with existing ones.
>
> **Fix:**
> ```javascript
> const nextId = Math.max(...tasks.map(t => t.id), 0) + 1;
> ```
>
> **Verification Steps:**
> 1. Seed tasks with IDs 1, 2, 3.
> 2. DELETE task 3.
> 3. POST a new task — confirm it receives ID 4, not 3.
> 4. DELETE tasks 1 and 2, POST again — confirm ID 5, not a reused lower number.

**Note:** Explicit structure made the output immediately scannable and directly usable — I can jump straight to "Fix" if I just want the code, or to "Verification Steps" if I'm testing, without reading prose to find them.

---

## Version 5 — + Step Decomposition

**Prompt:**
> "[Same as above]. Before answering, work through this in steps: (1) identify the root cause, (2) list two possible fixes and their tradeoffs, (3) recommend one given my context, (4) provide the code, (5) provide verification steps. Show your reasoning for each step."

**Output:**
> **Step 1 — Root cause:** `tasks.length + 1` assumes array size reflects the highest ID ever issued; deletions break that assumption.
>
> **Step 2 — Two options:** (a) a separate incrementing counter variable, independent of the array; (b) `Math.max(...tasks.map(t => t.id), 0) + 1`, derived from current data. Tradeoff: (a) is O(1) but can drift out of sync if the array is ever modified directly elsewhere; (b) is always correct but recomputes on every insert.
>
> **Step 3 — Recommendation:** given this is a learning project prioritizing correct habits over performance at scale, option (b) is better — it can't drift out of sync, which matters more here than the minor performance cost.
>
> **Step 4 — Code:** `const nextId = Math.max(...tasks.map(t => t.id), 0) + 1;`
>
> **Step 5 — Verification:** [same steps as Version 4]

**Note:** Forcing explicit steps made the reasoning visible and auditable — I can see exactly why option (b) was chosen over (a), not just receive the conclusion. This is the most "show your work" version of all six.

---

## Cross-Model Comparison — Claude vs. ChatGPT

Same final prompt (role + context + step decomposition + output structure), same bug, run on both models.

**The biggest difference — contradictory recommendation:**
Claude recommended `Math.max(...tasks.map(t => t.id), 0) + 1`, reasoning that it always derives correctness from current data and can't drift out of sync. ChatGPT recommended a separate incrementing counter (`nextTaskId++`), reasoning that it's O(1), simpler, and matches how real databases implement auto-increment IDs. Given the identical context, the two models reached opposite conclusions — both defensible, but genuinely different engineering judgment calls, not a stylistic difference.

**Tone:** Claude was concise and prose-heavy, sticking closely to the requested structure. ChatGPT was more exhaustive — full markdown headers, horizontal rules, and extra sections I hadn't asked for (e.g., thread safety, resource cleanup under "Additional Checks").

**Accuracy:** ChatGPT surfaced an honest limitation on its own recommendation — that a counter resets on server restart unless persisted — which is a real weakness Claude didn't call out about its own suggestion. ChatGPT also introduced UUIDs as a more production-grade alternative, which Claude didn't mention.

**Structure:** ChatGPT's verification section was more rigorous — it included a 100+ task stress-test scenario in addition to the basic delete/create sequence, going further than what was explicitly requested.

**Failure point:** On the first pass (before I supplied the actual bug details), ChatGPT declined to answer the templated placeholder prompt and asked for the real code/symptom instead of guessing — the safer behavior, but it cost an extra round-trip that Claude's simulated pass didn't need.

---

## Final Reusable Prompt

> "You are a senior engineer conducting a code review. Fix this bug: [code + symptom]. Context: [why correctness/robustness matters here]. Work through it in steps: (1) root cause, (2) two possible fixes with tradeoffs, (3) your recommendation given the context, (4) the code, (5) verification steps to confirm the fix works. Format with labeled sections."

This works for a stranger on the same track — they only need to fill in the bracketed placeholders with their own bug and context.
