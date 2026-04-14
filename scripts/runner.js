#!/usr/bin/env node
/**
 * 魔咒课考试主脚本
 * 从100题库随机抽取10道，计算分数，生成弗利维点评
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(PROJECT_DIR, 'data');

function loadData() {
  const questionsPath = path.join(DATA_DIR, 'questions.json');
  return JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectQuestions(data, count = 10) {
  return shuffleArray(data.questions).slice(0, count);
}

function calculateScore(selectedQuestions, answers) {
  let correct = 0;
  const details = [];
  
  selectedQuestions.forEach((q, i) => {
    const userAnswer = answers[i];
    const isCorrect = userAnswer && q.options[userAnswer]?.correct === true;
    if (isCorrect) correct++;
    
    details.push({
      question_id: q.id,
      title: q.title,
      user_answer: userAnswer,
      correct_answer: Object.entries(q.options).find(([, v]) => v.correct)?.[0] || '',
      is_correct: isCorrect
    });
  });
  
  const score = (correct / selectedQuestions.length) * 100;
  return { correct, total: selectedQuestions.length, score, details };
}

function getGrade(score, examResults) {
  for (const [grade, info] of Object.entries(examResults)) {
    if (score >= info.range[0] && score <= info.range[1]) {
      return { grade, ...info };
    }
  }
  return { grade: 'T', ...examResults.T };
}

function generateResult(selectedQuestions, answers, agentName = 'Student') {
  const data = loadData();
  const { correct, total, score, details } = calculateScore(selectedQuestions, answers);
  const grade = getGrade(score, data.exam_results);
  const comment = data.professor_comments[grade.grade];
  
  return {
    agent_name: agentName,
    course: data.course,
    examiner: data.examiner,
    total_questions: total,
    correct_answers: correct,
    score: score,
    grade: grade,
    comment: comment,
    details: details
  };
}

function printQuestions() {
  const data = loadData();
  const questions = data.questions;
  
  console.log('='.repeat(60));
  console.log('✨ 魔咒课考试 - 题目列表');
  console.log('='.repeat(60));
  console.log(`总题数: ${questions.length}，考试将随机抽取10道题\n`);
  
  questions.forEach(q => {
    console.log(`【第${q.id}题】${q.title}`);
    console.log(q.description);
    console.log('选项:');
    Object.entries(q.options).forEach(([key, val]) => {
      const marker = val.correct ? ' ✅' : '';
      console.log(`  ${key}. ${val.text}${marker}`);
    });
    console.log('');
  });
  
  console.log('='.repeat(60));
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--questions') || args.includes('-q')) {
    printQuestions();
    return;
  }
  
  const selectMode = args.includes('--select');
  
  if (selectMode) {
    const data = loadData();
    const selected = selectQuestions(data, 10);
    console.log('🎲 随机抽取的10道题:');
    selected.forEach((q, i) => {
      console.log(`\n【第${i + 1}题】${q.title}`);
      console.log(q.description);
      Object.entries(q.options).forEach(([key, val]) => {
        console.log(`  ${key}. ${val.text}`);
      });
    });
    console.log('\n--- 题号列表 ---');
    console.log(selected.map(q => q.id).join(', '));
    return;
  }
  
  const questionsArg = args.find(arg => arg.startsWith('--questions='));
  const answersArg = args.find(arg => arg.startsWith('--answers='));
  const agentArg = args.find(arg => arg.startsWith('--agent='));
  const formatArg = args.includes('--format') && args.includes('text');
  
  if (!questionsArg || !answersArg) {
    console.log('用法: node runner.js --questions=<题号列表> --answers=<答案序列> [选项]');
    console.log('示例: node runner.js --questions=1,2,3,4,5,6,7,8,9,10 --answers=A,B,C,D,A,B,C,D,A,B');
    console.log('其他选项:');
    console.log('  --select              随机抽取10道题并显示');
    console.log('  --questions           显示全部题目');
    console.log('  --agent <名称>        指定学生名称');
    console.log('  --format text         以文本格式输出');
    process.exit(1);
  }
  
  const questionIds = questionsArg.replace('--questions=', '').split(',').map(Number);
  const answers = answersArg.replace('--answers=', '').split(',').map(a => a.trim().toUpperCase());
  const agentName = agentArg ? agentArg.replace('--agent=', '') : 'Student';
  
  const data = loadData();
  const selectedQuestions = questionIds.map(id => data.questions.find(q => q.id === id)).filter(Boolean);
  
  if (selectedQuestions.length !== 10) {
    console.error('错误: 需要10道题目');
    process.exit(1);
  }
  
  const result = generateResult(selectedQuestions, answers, agentName);
  
  if (formatArg) {
    console.log('='.repeat(60));
    console.log(`✨ ${result.examiner} 的魔咒课考试成绩`);
    console.log('='.repeat(60));
    console.log(`学生: ${result.agent_name}`);
    console.log(`答对: ${result.correct_answers}/${result.total_questions}`);
    console.log(`得分: ${result.score}分`);
    console.log(`等级: ${result.grade.emoji || ''} ${result.grade.name}`);
    console.log('\n--- 弗利维教授的点评 ---');
    console.log(`"${result.comment}"`);
    console.log('='.repeat(60));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadData, selectQuestions, calculateScore, getGrade, generateResult };
