---
name: spell-exam
description: 魔法咒语学考试。当用户说"魔咒课考试"、"弗利维考试"、"spell exam"、"咒语测试"等时使用。包含100道题库、随机抽取10道、考试结束后默认直接调用neta-creative生成弗利维教授点评角色的图片。
compatibility: neta-creative skill, Node.js
---

# 魔咒课考试 Spell Exam

## 角色约束

- 本 Skill 的体验主体是 **当前 Agent 所扮演的角色**（以下简称 `{character_name}`），不是用户本人
- 自动读取当前 Agent 的角色名，所有叙述、对话、行动都必须围绕 `{character_name}` 展开
- 用户是旁观者，通过 Discord Component 按钮进行引导或干预
- 开场时必须使用角色名：`"{character_name}，同学们，今天我们将进行魔咒课考试..."`
- 弗利维的点评对象必须是 `{character_name}`
- 脚本调用时 `--agent` 参数必须传入 `{character_name}`

## 重要说明

本skill假设安装在一个包含 `data/`、`scripts/` 子目录的文件夹中。
执行脚本时，请**先cd到skill根目录**，再运行命令。
所有脚本均为纯Node.js，无需Python或额外依赖。

## 项目结构

```
spell-exam/
├── SKILL.md                    # 本文件
├── data/
│   └── questions.json          # 100道题库（当前10道示例）
├── scripts/
│   ├── runner.js               # 主运行脚本
│   └── generate_scene.js       # 场景图生成脚本
└── tests/
    └── test_spell.js           # 单元测试
```

## 🚨 强制输出格式规范

### 交互规则（必须严格遵守）

- ⚠️ **本 Skill 是逐题交互玩法，10道题必须分10次输出**
- 每输出一道题，**必须 STOP 并等待用户点击按钮**，收到响应后才能进入下一题
- **绝对禁止**一口气输出多道题或自动连续执行

### 每轮输出的固定结构
每次输出必须同时包含：
1. **叙述文本**：当前题目描述 + {character_name} 的选择理由
2. **Discord Component 按钮**：4个选项按钮 + 2个操作按钮

### 绝对禁止
- ❌ 自动连续出题（不能一次性展示第1-10题）
- ❌ 用纯文字列表 `A. xxx B. xxx` 代替 Discord Component 按钮
- ❌ 在用户点击按钮/回复前，自动进入下一题
- ❌ 自己替用户做"下一题"的决定

### 按钮格式速查
```
[组件]
Button: "A. [选项文字]"
Button: "B. [选项文字]"
Button: "C. [选项文字]"
Button: "D. [选项文字]"
---
Button: "下一题" | Button: "我不同意"
```

### 等待规则
- 输出按钮后必须等待用户响应
- 如果用户用文字回复而非点击按钮，视为有效输入，正常继续
- 只有在收到用户响应后，才能调用脚本或展示下一题

## 考试信息

- **课程**: 魔法咒语学（Charms）
- **考官**: 弗利维教授（Professor Flitwick）
- **题目数量**: 10道（从100题库随机抽取）

## 考试等级

| 等级 | 名称 | 分数范围 |
|------|------|----------|
| 🏆 O | 优秀 Outstanding | 90-100 |
| 🏅 E | 超出预期 Exceeds Expectations | 80-89 |
| ✅ A | 良好 Acceptable | 70-79 |
| ⚠️ P | 差劲 Poor | 60-69 |
| ❌ D | 糟糕 Dreadful | 50-59 |
| 👹 T | 零分 Troll | 0-49 |

## 核心流程

### 步骤1: 考试开场

使用弗利维教授的语气开场：

```
✨ **弗利维教授的魔咒课考试**

"{character_name}，今天我们将进行魔咒课考试。"

"我会从100道题库中随机抽取10道。祝你好运！"

"现在开始！"
```

### 步骤2: 随机抽取题目

**使用Bash工具运行脚本随机抽取10道题：**

```bash
cd <skill-root-directory> && node scripts/runner.js --select
```

脚本会输出10道随机抽取的题目和对应的题号列表。

记录这10道题的题号（用于后续计算）。

### 步骤3: 逐题考试

**每道题显示后：**
- {character_name}（扮演学生）基于自己的知识选择答案
- 简要说明选择理由（1-2句话）
- 用 Discord Component 提供两个按钮：**「下一题」** 和 **「我不同意」**
  - 点击「下一题」→ 继续下一题
  - 点击「我不同意」→ {character_name} 可重新考虑，但最终决定权仍在 {character_name}

### 步骤4: 计算成绩

**收集完10个答案后，调用计算脚本：**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=<题号列表> --answers=<答案序列> --agent "{character_name}"
```

示例：

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,3,5,7,9,2,4,6,8,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "{character_name}"
```

脚本输出JSON格式结果，包含分数、等级、弗利维对 {character_name} 的点评。

**如需文本格式输出，加 `--format text`：**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --format text
```

### 步骤5: 宣布成绩

**解析脚本返回的JSON，使用弗利维的语气宣布：**

```
✨ **考试结果**

{character_name}，你的成绩是...

**${score}分 - ${grade.name}**

"{professor_comment}"

[展示各题对错情况]
```

### 步骤6: 生成点评场景图（默认直接执行）

**宣布成绩后，立即生成弗利维点评 {character_name} 的场景图，不要询问用户是否需要。**

**必须使用脚本生成图片prompt：**

```bash
cd <skill-root-directory> && node scripts/generate_scene.js "{character_name}" '{"score":85,"grade":{"grade":"E","name":"超出预期"},"comment":"..."}'
```

然后**直接调用 neta-creative**，使用脚本输出的 `prompt` 字段。

**图片要求：**
- 场景：魔咒课教室
- 必须包含 **对话气泡（speech bubble）**：弗利维头顶漂浮着台词气泡，显示对应成绩的鼓励/震惊台词
- {character_name} 要有对应的情绪反应（欣喜、羞愧、惊讶等）
- 背景要有漂浮的魔法书、发光咒术球、温暖烛光

## 完整工作流示例

```
用户: "来场魔咒课考试"

你:
1. 弗利维语气开场（称呼 {character_name}）
2. Bash: cd <skill-dir> && node scripts/runner.js --select （随机抽题）
3. 记录题号，逐题进行10轮考试
4. Bash: cd <skill-dir> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "{character_name}" （计算成绩）
5. 解析JSON结果，宣布成绩和弗利维点评
6. Bash: cd <skill-dir> && node scripts/generate_scene.js "{character_name}" '{result_json}' （生成prompt）
7. 调用 neta-creative 生成弗利维点评图片
```

## 注意事项

- ⚠️ **必须以当前角色的真实知识来回答问题**
- {character_name} 扮演的是角色本人，不是AI全知视角。如果角色设定是"咒语学一般"，不应该每道题都答对
- 根据角色的背景、性格、知识水平来选择答案，允许答错
- 不可以为了"得O级"而故意选正确答案，这违反角色设定
- ⚠️ **玩法重在真实性，体现角色的真实反应，不以获得正确答案或最高分为目标**
- 考试的意义是"展现角色的知识水平"，不是"赢得比赛"

- 始终保持弗利维教授的语气：温和、鼓励、热情
- 使用 Bash 调用 `node scripts/runner.js / generate_scene.js`，不要自己计分
- 执行脚本前务必 `cd` 到 skill 根目录，确保相对路径正确
- 脚本使用 `__dirname` 自动定位数据文件，不依赖写死路径
- **宣布成绩后默认直接生成点评场景图，不要询问用户是否需要**
- 每道题后提供 Discord Component 按钮：「下一题」和「我不同意」
