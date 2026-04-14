#!/usr/bin/env node
/**
 * 魔咒课考试场景图生成脚本
 * 根据考试成绩生成弗利维教授点评角色的图片prompt
 */

const gradeMoods = {
  O: {
    mood: 'thrilled and excited, clapping hands with joy',
    pose: 'standing on a stack of books, giving enthusiastic applause',
    background: 'enchanted classroom with floating spell books, starry ceiling'
  },
  E: {
    mood: 'pleased and encouraging, smiling warmly',
    pose: 'nodding approvingly,adjusting his pointed hat',
    background: 'cozy charm classroom with glowing orbs, spell scrolls on walls'
  },
  A: {
    mood: 'satisfied but hopeful, encouraging smile',
    pose: 'giving a gentle nod, rubbing hands together',
    background: 'classroom with floating candles, magical artifacts'
  },
  P: {
    mood: 'slightly disappointed but not giving up',
    pose: 'sighing, looking at the student with concern',
    background: 'dim classroom, scattered spell books'
  },
  D: {
    mood: 'deeply disappointed, shaking head',
    pose: 'putting hands on hips, looking worried',
    background: 'messy classroom, broken wands scattered'
  },
  T: {
    mood: 'shocked and devastated, near tears',
    pose: 'throwing hands up in despair, looking stunned',
    background: 'chaotic classroom, books falling from shelves'
  }
};

function generatePrompt(studentName, result) {
  const grade = result.grade.grade;
  const moodData = gradeMoods[grade] || gradeMoods.T;
  
  const prompt = `${studentName} receiving evaluation from Professor Flitwick in the Charms classroom, ` +
    `Flitwick is ${moodData.pose}, ${moodData.mood}, ` +
    `${moodData.background}, warm candlelight, ` +
    `magical atmosphere, whimsical Harry Potter aesthetic`;
  
  const promptCN = `${studentName}在魔咒课教室里接受弗利维教授的点评，` +
    `弗利维教授${moodData.pose}，表情${moodData.mood}，` +
    `${moodData.background}，温暖的烛光，魔法氛围，哈利波特奇幻风格`;
  
  return { prompt, promptCN };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法: node generate_scene.js "<student_name>" \'<result_json>\'');
    console.log('示例: node generate_scene.js "Harry" \'{"grade":{"grade":"O","name":"优秀"}}\'');
    process.exit(1);
  }
  
  const studentName = args[0];
  let result;
  try {
    result = JSON.parse(args[1]);
  } catch (e) {
    console.error('错误: 无法解析JSON结果');
    process.exit(1);
  }
  
  const { prompt, promptCN } = generatePrompt(studentName, result);
  
  const output = {
    student: studentName,
    grade: result.grade,
    score: result.score,
    comment: result.comment,
    prompt: prompt,
    prompt_cn: promptCN
  };
  
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { generatePrompt, gradeMoods };
