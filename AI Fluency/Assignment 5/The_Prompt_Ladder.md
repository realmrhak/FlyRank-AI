# The Prompt Ladder

**Haroon Ameer Khan — FlyRank AI Fluency Track — Week 2**

Track context: backend engineering. The bug used throughout is a real subtle bug from my own CRUD API project (Week 2, Assignment 1) — an ID-collision bug caused by generating new task IDs with `tasks.length + 1`, which breaks once tasks have been deleted.

---

## Baseline (Weak Prompt)

**Prompt:**
> "Fix my bug"

**Output:**
> "I'd be happy to help fix your bug! Could you please share the code you're working with, the error message you're seeing, and what behavior you expected instead? Without more details, I can't diagnose the issue."

This is the embarrassing baseline — no code, no context, so the AI can't do anything except ask for the information that should have been in the prompt from the start.

---

## Version 1 — + Real Context

**Prompt:**
> "Fix my bug. Here's my code:
> ```javascript
> app.post('/tasks', (req, res) => {
>   const { title } = req.body;
>   if (!title) return res.status(400).json({ error: 'Title is required' });
>   const newTask = { id: tasks.length + 1, title, done: false };
>   tasks.push(newTask);
>   res.status(201).json(newTask);
> });
> ```
> After I delete a task and then create a new one, the new task sometimes gets the same ID as an existing task."

**Output:**
> "The bug is in how you generate IDs: `tasks.length + 1`. This works only if tasks are never deleted. Once you delete a task, the array shrinks, so `tasks.length + 1` can produce an ID that already exists among the remaining tasks. Fix: track a separate incrementing counter, or calculate the next ID as `Math.max(...tasks.map(t => t.id), 0) + 1` so it's always based on the highest existing ID, not the array length."

**Notes:**
- **What changed in the prompt:** Added the actual code and a description of the specific failure behavior.
- **What improved in the output:** AI correctly diagnosed the root cause (length-based ID vs. array shrinking) and gave a specific, usable fix — not a generic "check your logic."
- **What still failed:** Doesn't explain why to pick one fix over the other, or how to test it.
- **What to try next:** Add a clearer goal so the AI has a basis for recommending one solution over the other.

---

## Version 2 — + Clearer Goal

**Prompt:**
> "Fix my bug. Here's my code: [same code]. After I delete a task and then create a new one, the new task sometimes gets the same ID as an existing task. My goal is to pick the most robust fix for an in-memory array like this — not just any fix that works today, but one that won't break again if I add more operations later (like bulk delete)."

**Output:**
> "For an in-memory array with arbitrary deletes, `Math.max(...tasks.map(t => t.id), 0) + 1` is more robust than a separate counter variable in one specific way: it self-corrects even if the array is mutated in unexpected ways elsewhere in your code. A separate counter can drift out of sync with the actual array contents if something modifies `tasks` directly. The trade-off: `Math.max` recalculates on every insert (fine at this scale), while a counter is O(1) but requires discipline to keep in sync."

**Notes:**
- **What changed in the prompt:** Added a specific goal — the most robust option for future changes, not just any fix.
- **What improved in the output:** AI now compares two solutions and explains why one is more robust, with a concrete trade-off.
- **What still failed:** Doesn't tell me which one to actually use given my specific situation — stays neutral.
- **What to try next:** Add audience/context about who I am so it can commit to a recommendation.

---

## Version 3 — + Defined Audience

**Prompt:**
> "Fix my bug. Here's my code: [same code]. [same bug description]. My goal is to pick the most robust fix for an in-memory array like this. I'm a solo developer working on a small learning project — not optimizing for scale, just want the simplest fix that won't break again."

**Output:**
> "Given that context, use `Math.max(...tasks.map(t => t.id), 0) + 1`. Skip the separate counter — it adds a second piece of state you have to remember to keep in sync, which isn't worth it for a small solo project. `Math.max` is self-contained: it always derives the next ID from the actual data, so there's nothing extra to maintain or get wrong later."

**Notes:**
- **What changed in the prompt:** Added who I am — solo dev, small project, not optimizing for scale.
- **What improved in the output:** AI now commits to one answer confidently instead of listing neutral trade-offs.
- **What still failed:** Still doesn't show the actual corrected code — just the concept.
- **What to try next:** Ask for a specified output format — the code itself, not just an explanation.

---

## Version 4 — + Specified Output Format

**Prompt:**
> "Fix my bug. Here's my code: [same code]. [same bug description, goal, and audience context]. Give me the corrected code, not just an explanation."

**Output:**
> ```javascript
> app.post('/tasks', (req, res) => {
>   const { title } = req.body;
>   if (!title) return res.status(400).json({ error: 'Title is required' });
>   const nextId = Math.max(...tasks.map(t => t.id), 0) + 1;
>   const newTask = { id: nextId, title, done: false };
>   tasks.push(newTask);
>   res.status(201).json(newTask);
> });
> ```
> "This replaces `tasks.length + 1` with `Math.max(...tasks.map(t => t.id), 0) + 1`, so the next ID is always one higher than the current maximum ID in the array — regardless of how many tasks have been deleted."

**Notes:**
- **What changed in the prompt:** Explicitly asked for corrected code, not just an explanation.
- **What improved in the output:** I can copy-paste directly — no translation step from concept to implementation.
- **What still failed (honest gap):** Doesn't tell me how to verify the fix actually works — no test sequence, no way to confirm the edge case is really handled.
- **What to try next:** Add a verification requirement so the output includes a way to test the fix.

---

## Version 5 — + Verification Requirement

**Prompt:**
> "Fix my bug. Here's my code: [same code]. [same bug description, goal, audience, and output format request]. Also tell me exactly how to verify the fix actually works — a specific sequence of requests I can run to confirm."

**Output:**
> [Same corrected code as Version 4]
>
> "To verify: 1) Start with your 3 seed tasks (IDs 1, 2, 3). 2) DELETE `/tasks/3`. 3) POST a new task — it should get ID 4, not ID 3 (which the old code would have produced, since `tasks.length` would be 2 at that point, giving `2 + 1 = 3` — a collision with the task you just deleted). 4) DELETE `/tasks/1` and `/tasks/2` as well, then POST again — it should now get ID 5, correctly continuing from the highest ID ever used, not resetting based on how many tasks remain."

**Notes:**
- **What changed in the prompt:** Asked for a specific verification sequence, not just the fix.
- **What improved in the output:** Now I have an exact test scenario I can run immediately — no guessing how to confirm the fix works.
- **What still failed:** Minor gap — doesn't explicitly address the edge case of an empty `tasks` array (`Math.max()` with no arguments returns `-Infinity`, though the `, 0` default in the code actually handles this correctly; the explanation just doesn't call it out).
- **What to try next:** Could add a "constraints" layer to force explicit handling of edge cases like an empty array — but this is a reasonable stopping point after 5 versions.

---

## Final Reusable Prompt

> "Fix this bug: [paste code]. Symptom: [describe the exact wrong behavior]. My goal: [what 'fixed' should mean — e.g., simplest robust fix, not necessarily most scalable]. Context: [who you are / constraints, e.g., solo dev, small project]. Give me: (1) the corrected code, and (2) a specific request sequence I can run to verify the fix works."

This works for a stranger on the same track — they only need to fill in the bracketed placeholders with their own bug, without needing me in the room to explain what I meant.
