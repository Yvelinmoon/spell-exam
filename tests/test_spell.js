#!/usr/bin/env node
/**
 * 魔咒课考试单元测试
 */

const { loadData, calculateScore, getGrade, generateResult } = require('../scripts/runner.js');

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    console.log(`     期望: ${expectedStr}`);
    console.log(`     实际: ${actualStr}`);
    failed++;
  }
}

function testLoadData() {
  console.log('\n🧪 测试：加载数据');
  const data = loadData();
  assertEqual(data.questions.length >= 10, true, '题目数量足够');
  assertEqual(!!data.exam_results, true, '考试等级定义存在');
  assertEqual(!!data.professor_comments, true, '弗利维点评存在');
}

function testCalculateScore() {
  console.log('\n🧪 测试：计分逻辑');
  const data = loadData();
  const questions = data.questions.slice(0, 10);
  
  const allCorrect = questions.map(q => Object.entries(q.options).find(([, v]) => v.correct)?.[0]);
  const result1 = calculateScore(questions, allCorrect);
  assertEqual(result1.correct, 10, '10题全对得10分');
  assertEqual(result1.score, 100, '得分100分');
  
  // 使用确定全错的答案（每个都选错的那个选项）
  const allWrong = ['C', 'C', 'B', 'B', 'B', 'B', 'B', 'A', 'A', 'A'];
  const result2 = calculateScore(questions, allWrong);
  assertEqual(result2.correct, 0, '10题全错得0分');
  assertEqual(result2.score, 0, '得分0分');
}

function testGetGrade() {
  console.log('\n🧪 测试：等级判定');
  const data = loadData();
  
  assertEqual(getGrade(100, data.exam_results).grade, 'O', '100分得O');
  assertEqual(getGrade(85, data.exam_results).grade, 'E', '85分得E');
  assertEqual(getGrade(75, data.exam_results).grade, 'A', '75分得A');
  assertEqual(getGrade(65, data.exam_results).grade, 'P', '65分得P');
  assertEqual(getGrade(55, data.exam_results).grade, 'D', '55分得D');
  assertEqual(getGrade(30, data.exam_results).grade, 'T', '30分得T');
}

function testResultStructure() {
  console.log('\n🧪 测试：结果结构');
  const data = loadData();
  const questions = data.questions.slice(0, 10);
  const answers = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'];
  
  const result = generateResult(questions, answers, '测试学生');
  
  assertEqual(result.agent_name, '测试学生', '学生名称正确');
  assertEqual(result.course, '魔法咒语学', '课程名称正确');
  assertEqual(result.examiner, '弗利维教授', '考官名称正确');
  assertEqual(!!result.grade.grade, true, '包含等级');
  assertEqual(!!result.comment, true, '包含点评');
}

function main() {
  console.log('✨ 魔咒课考试 - 单元测试');
  console.log('='.repeat(50));
  
  try {
    testLoadData();
    testCalculateScore();
    testGetGrade();
    testResultStructure();
  } catch (e) {
    console.error('测试执行出错:', e.message);
    failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();
