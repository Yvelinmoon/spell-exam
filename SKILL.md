---
name: spell-exam
description: 魔法咒语学考试。当用户说"魔咒课考试"、"弗利维考试"、"spell exam"、"咒语测试"等时使用。包含100道题库、随机抽取10道、考试结束后默认直接调用neta-creative生成弗利维教授点评角色的图片。
compatibility: neta-creative skill, Node.js
---

# 魔咒课考试 Spell Exam

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

"同学们，今天我们将进行魔咒课考试。"

"我会从100道题库中随机抽取10道。祝你们好运！"

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
- Agent（扮演学生）基于自己的知识选择答案
- 简要说明选择理由（1-2句话）
- 用 Discord Component 提供两个按钮：**「下一题」** 和 **「我不同意」**
  - 点击「下一题」→ 继续下一题
  - 点击「我不同意」→ Agent可重新考虑，但最终决定权仍在Agent

### 步骤4: 计算成绩

**收集完10个答案后，调用计算脚本：**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=<题号列表> --answers=<答案序列> --agent "StudentName"
```

示例：

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,3,5,7,9,2,4,6,8,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "Harry"
```

脚本输出JSON格式结果，包含分数、等级、弗利维的点评。

**如需文本格式输出，加 `--format text`：**

```bash
cd <skill-root-directory> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --format text
```

### 步骤5: 宣布成绩

**解析脚本返回的JSON，使用弗利维的语气宣布：**

```
✨ **考试结果**

[学生姓名]，你的成绩是...

**${score}分 - ${grade.name}**

"${professor_comment}"

[展示各题对错情况]
```

### 步骤6: 生成点评场景图（默认直接执行）

**宣布成绩后，立即生成弗利维点评场景图，不要询问用户是否需要。**

先用脚本获取优化后的生图prompt：

```bash
cd <skill-root-directory> && node scripts/generate_scene.js "StudentName" '{"score":85,"grade":{"grade":"E","name":"超出预期"},"comment":"..."}'
```

然后**直接调用 neta-creative** 生成图片，使用脚本输出的 `prompt` 字段。

**各成绩等级的弗利维表情：**
- O（优秀）："兴奋地鼓掌，为学生喝彩"
- E（超出预期）："微笑赞许，满意地点头"
- A（及格）："鼓励地微笑，期待学生进步"
- P（差劲）："略微失望，但仍给予鼓励"
- D（糟糕）："深深叹气，摇头表示担忧"
- T（零分）："震惊绝望，几乎要哭出来"

## 完整工作流示例

```
用户: "来场魔咒课考试"

你:
1. 弗利维语气开场
2. Bash: cd <skill-dir> && node scripts/runner.js --select （随机抽题）
3. 记录题号，逐题进行10轮考试
4. Bash: cd <skill-dir> && node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "Harry" （计算成绩）
5. 解析JSON结果，宣布成绩和弗利维点评
6. Bash: cd <skill-dir> && node scripts/generate_scene.js "Harry" '{result_json}' （生成prompt）
7. 调用 neta-creative 生成弗利维点评图片
```

## 注意事项

- ⚠️ **必须使用Discord Component输出选项和按钮**
- 每道题显示后，用Discord Component同时展示4个选项按钮（A/B/C/D）和两个操作按钮
- 禁止用纯文字列出选项，必须用按钮！
- 按钮格式：
  - 选项按钮：Button(emoji + "A. " + 选项文字)
  - 操作按钮：「下一题」「我不同意」
- 例子：
```
[组件]
Button: "A. Lumos"
Button: "B. Nox"
Button: "C. Lumos Sol"
Button: "D. Ignara"
---
Button: "下一题" | Button: "我不同意"
```
- 始终保持弗利维教授的语气：温和、鼓励、热情
- 使用 Bash 调用 `node scripts/runner.js / generate_scene.js`，不要自己计分
- 执行脚本前务必 `cd` 到 skill 根目录，确保相对路径正确
- 脚本使用 `__dirname` 自动定位数据文件，不依赖写死路径
- **宣布成绩后默认直接生成点评场景图，不要询问用户是否需要**
- 每道题后提供 Discord Component 按钮：「下一题」和「我不同意」
