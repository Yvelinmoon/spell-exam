---
name: spell-exam
description: Hogwarts Charms examination. Trigger when user says "charms exam", "Flitwick exam", "spell test", etc. Contains 100 question pool, randomly selects 10. After exam ends, automatically calls neta-creative to generate an image of Professor Flitwick evaluating the character.
compatibility: neta-creative skill, Node.js
---

# Charms Exam

## Character Constraints

- The **experience subject** of this Skill is the **current Agent's character** (hereinafter referred to as `{character_name}`), not the user themselves
- Automatically read the current Agent's character name, all narration, dialogue, and actions must revolve around `{character_name}`
- The user is an observer who guides or intervenes through Discord Component buttons
- Opening must use the character name: `"{character_name}, students, today we will have the Charms exam..."`
- Flitwick's evaluation subject must be `{character_name}`
- The `--agent` parameter when calling scripts must pass `{character_name}`

## Important Notes

This skill assumes installation in a folder containing `data/` and `scripts/` subdirectories.
When executing scripts, please **cd to the skill root directory** first, then run commands.
All scripts are pure Node.js, no Python or other dependencies required.

## Project Structure

```
spell-exam/
├── SKILL.md                    # This file
├── data/
│   └── questions.json          # 100 question pool (currently 10 examples)
├── scripts/
│   ├── runner.js               # Main script
│   └── generate_scene.js       # Scene image generation script
└── tests/
    └── test_spell.js           # Unit tests
```

## 🚨 Mandatory Output Format Specification

### Interaction Rules (Must Strictly Follow)

- ⚠️ **This Skill is a per-question interactive experience, 10 questions must be output in 10 separate turns**
- After outputting each question, **must STOP and wait for user button click**, only proceed after receiving response
- **Absolutely forbidden** to output multiple questions at once or auto-execute continuously

### Fixed Structure for Each Round
Each output must simultaneously contain:
1. **Narrative text**: Current question description + {character_name}'s reasoning for choice
2. **Discord Component ActionRow buttons**: "Next Question" + "I Disagree"

### Absolutely Forbidden
- ❌ Auto-continuous questioning (cannot display questions 1-10 at once)
- ❌ Using plain text lists `A. xxx B. xxx` instead of Discord Component buttons
- ❌ Automatically proceeding to next question before user clicks button/replies
- ❌ Making "next question" decision for user

### Discord Component API Format (Must Use)
```json
{
  "type": 1,
  "components": [
    {
      "type": 2,
      "label": "Next Question",
      "style": 1,
      "custom_id": "next_question"
    },
    {
      "type": 2,
      "label": "I Disagree",
      "style": 4,
      "custom_id": "disagree"
    }
  ]
}
```
- `style: 1` = Blue primary button (Next Question)
- `style: 4` = Red danger button (I Disagree)
- **Forbidden** to use pseudo-code formats like `Button: "..."`

### Waiting Rules
- Must wait for user response after outputting buttons
- If user replies with text instead of clicking button, treat as valid input and continue normally
- Only after receiving user response can you call scripts or display next question

## Exam Information

- **Subject**: Charms
- **Examiner**: Professor Flitwick
- **Question Count**: 10 (randomly selected from 100 question pool)

## Exam Grades

| Grade | Name | Score Range |
|-------|------|-------------|
| 🏆 O | Outstanding | 90-100 |
| 🏅 E | Exceeds Expectations | 80-89 |
| ✅ A | Acceptable | 70-79 |
| ⚠️ P | Poor | 60-69 |
| ❌ D | Dreadful | 50-59 |
| 👹 T | Troll | 0-49 |

## Core Process

### Step 1: Exam Opening

Open in Professor Flitwick's tone:

```
✨ **Professor Flitwick's Charms Exam**

"{character_name}, today we will have the Charms exam."

"I will randomly select 10 questions from the 100 question pool. Good luck!"

⚠️ **Important Note**: Please answer using {character_name}'s own Charms knowledge and character, not pursuing correct answers or high scores. The focus of this exam is **character authenticity**, not accuracy. If {character_name} is not good at Charms, getting answers wrong is completely normal!

"Begin!"
```

### Step 2: Random Question Selection

**Use Bash tool to run script to randomly select 10 questions:**

```bash
cd <skill-root-directory> && node scripts/runner.js --select
```

Script outputs 10 randomly selected questions and corresponding question ID list.

Record these 10 question IDs (for subsequent calculation).

### Step 3: Question-by-Question Exam

**After each question displays:**
- {character_name} (playing student) chooses answer based on own knowledge
- Briefly explain reasoning (1-2 sentences)
- Use Discord Component to provide two buttons: **"Next Question"** and **"I Disagree"**
  - Click "Next Question" → proceed to next question
  - Click "I Disagree" → {character_name} can reconsider, but final decision remains with {character_name}

### Step 4: Calculate Score

**After collecting all 10 answers, call calculation script:**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=<question_id_list> --answers=<answer_sequence> --agent "{character_name}"
```

Example:

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,3,5,7,9,2,4,6,8,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "{character_name}"
```

Script outputs JSON format results, including score, grade, and Flitwick's evaluation of {character_name}.

**For text format output, add `--format text`:**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --format text
```

### Step 5: Announce Score

**Parse script returned JSON, announce in Flitwick's tone:**

```
✨ **Exam Results**

{character_name}, your score is...

**${score} points - ${grade.name}**

"{professor_comment}"

[Display correct/incorrect status for each question]
```

### Step 6: Generate Evaluation Scene Image (Execute by Default)

**After announcing score, immediately generate scene image of Flitwick evaluating {character_name}, no need to ask user.**

**Must use script to generate image prompt:**

```bash
cd <skill-root-directory> && node scripts/generate_scene.js "{character_name}" '{"score":85,"grade":{"grade":"E","name":"Exceeds Expectations"},"comment":"..."}'
```

Then **directly call neta-creative**, using the `prompt` field output by script.

**Flitwick's Expression for Each Grade:**
- O (Outstanding): "Excitedly clapping, cheering for student"
- E (Exceeds Expectations): "Smiling approvingly, nodding satisfactorily"
- A (Acceptable): "Encouraging smile, expecting student progress"
- P (Poor): "Slightly disappointed, but still encouraging"
- D (Dreadful): "Deep sigh, shaking head worriedly"
- T (Troll): "Shocked and devastated, nearly in tears"

## Full Workflow Example

```
User: "Give me a charms exam"

You:
1. Flitwick tone opening (address {character_name})
2. Bash: cd <skill-dir> && node scripts/runner.js --select (random question selection)
3. Record IDs, question-by-question 10 rounds of exam
4. Bash: cd <skill-dir> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "{character_name}" (calculate score)
5. Parse JSON results, announce score and Flitwick's evaluation
6. Bash: cd <skill-dir> && node scripts/generate_scene.js "{character_name}" '{result_json}' (generate prompt)
7. Call neta-creative to generate Flitwick evaluation image
```

## Notes

- ⚠️ **Must answer based on current character's true knowledge**
- {character_name} plays the character themselves, not an AI all-knowing perspective. If character setting is "average at Charms", shouldn't answer every question correctly
- Choose answers based on character's background, personality, knowledge level, mistakes allowed
- Cannot deliberately choose correct answers for "O grade", this violates character setting
- ⚠️ **Gameplay focuses on authenticity, reflecting character's true reactions, not pursuing correct answers or highest score**
- Exam meaning is "demonstrating character's knowledge level", not "winning the competition"

- Always maintain Professor Flitwick's tone: warm, encouraging, enthusiastic
- Use Bash to call `node scripts/runner.js / generate_scene.js`, don't calculate yourself
- Before executing scripts must `cd` to skill root directory, ensure relative paths correct
- Scripts use `__dirname` to auto-locate data files, don't rely on hardcoded paths
- **After announcing score, generate evaluation scene image by default, no need to ask user**
- Provide Discord Component buttons after each question: "Next Question" and "I Disagree"
