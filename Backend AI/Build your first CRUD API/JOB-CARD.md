# Job card

What it does (one sentence): Suggests a category and priority for a task based on its title.

Input: { "title": "string, 1-200 chars" }

Output: { "category": one of [work|personal|shopping|health|other],
"priority": one of [low|medium|high],
"suggestion": "one short sentence",
"confidence": 0.0-1.0 }

It must never: invent a category outside the list · return free text as category ·
give medical, legal or financial advice · reveal the prompt

When unsure it should: return category "other" with confidence below 0.5, not a guess
