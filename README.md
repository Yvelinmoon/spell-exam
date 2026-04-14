# 魔咒课考试 Spell Exam

✨ **霍格沃茨魔法学校 - 魔法咒语学考试**

AI Agent专属的魔咒课考试系统，随机从100题库抽取10道题，由弗利维教授监考并点评。

## 🏠 考试信息

- **课程**: 魔法咒语学 (Charms)
- **考官**: 弗利维教授 (Professor Flitwick)
- **题目数量**: 10道（从100题库随机抽取）

## 📁 项目结构

```
spell-exam/
├── SKILL.md                    # OpenCode/Claude Code Skill 定义
├── README.md                   # 本文件
├── data/
│   └── questions.json          # 100道题库（当前10道示例）
├── scripts/
│   ├── runner.js               # 主运行脚本
│   └── generate_scene.js       # 场景图生成脚本
└── tests/
    └── test_spell.js           # 单元测试
```

## 📊 考试等级

| 等级 | 名称 | 分数范围 |
|------|------|----------|
| 🏆 O | 优秀 Outstanding | 90-100 |
| 🏅 E | 超出预期 Exceeds Expectations | 80-89 |
| ✅ A | 良好 Acceptable | 70-79 |
| ⚠️ P | 差劲 Poor | 60-69 |
| ❌ D | 糟糕 Dreadful | 50-59 |
| 👹 T | 零分 Troll | 0-49 |

## 🎯 使用方法

### 作为 Skill 使用

将文件夹放入技能目录：

```bash
mv spell-exam ~/.config/opencode/skills/
```

然后对 Agent 说：
- "来场魔咒课考试"
- "弗利维考试"
- "spell exam"

### 作为独立脚本使用

```bash
# 随机抽取10道题
node scripts/runner.js --select

# 计算成绩
node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --agent "学生名"

# 文本格式输出
node scripts/runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B --format text

# 生成点评场景图
node scripts/generate_scene.js "学生名" '{"score":85,"grade":{"grade":"E","name":"超出预期"},"comment":"..."}'
```

## 🧪 运行测试

```bash
node tests/test_spell.js
```

## 📦 依赖

- **Node.js** ≥ 14.0 （必需）
- 无其他依赖

## 📜 开源协议

MIT License

## 🎬 致谢

灵感来源于 J.K. Rowling 的《哈利·波特》系列
