import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

const getFilePath = (fileName) => path.join(DATA_DIR, fileName);

const readData = (fileName) => {
  try {
    const filePath = getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (fileName, data) => {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const calculateTier = (points) => {
  if (points < 50) return 'Novice';
  if (points < 150) return 'Expert';
  if (points < 300) return 'Master';
  return 'Grandmaster';
};

export const getQuestions = (subject) => {
  const questions = readData('questions.json');
  let filtered = questions;
  if (subject) {
    filtered = questions.filter(q => q.subject === subject);
  }
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getQuestionById = (id) => {
  const questions = readData('questions.json');
  return questions.find(q => q.id === id) || null;
};

export const createQuestion = (data) => {
  const questions = readData('questions.json');
  const newQuestion = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    aiAnswer: data.mode === 'ai' ? data.aiAnswer || null : null,
    status: 'open'
  };
  questions.push(newQuestion);
  writeData('questions.json', questions);
  return newQuestion;
};

export const getAnswersByQuestionId = (questionId) => {
  const answers = readData('answers.json');
  const questionAnswers = answers.filter(a => a.questionId === questionId);
  return questionAnswers.sort((a, b) => {
    if (a.isBestFit && !b.isBestFit) return -1;
    if (!a.isBestFit && b.isBestFit) return 1;
    return b.votes - a.votes;
  });
};

export const createAnswer = (data) => {
  const answers = readData('answers.json');
  const newAnswer = {
    ...data,
    id: crypto.randomUUID(),
    votes: 0,
    isBestFit: false,
    bestFitReason: null,
    createdAt: new Date().toISOString()
  };
  answers.push(newAnswer);
  writeData('answers.json', answers);
  return newAnswer;
};

export const updateAnswer = (id, updates) => {
  const answers = readData('answers.json');
  const index = answers.findIndex(a => a.id === id);
  if (index === -1) return null;
  answers[index] = { ...answers[index], ...updates };
  writeData('answers.json', answers);
  return answers[index];
};

export const getUsers = () => {
  const users = readData('users.json');
  return users.sort((a, b) => b.points - a.points);
};

export const getOrCreateUser = (name, role) => {
  const users = readData('users.json');
  let user = users.find(u => u.name === name);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name,
      role: role || 'student',
      points: 0,
      tier: 'Novice'
    };
    users.push(user);
    writeData('users.json', users);
  }
  return user;
};

export const updateUserPoints = (name, pointsDelta) => {
  const users = readData('users.json');
  const index = users.findIndex(u => u.name === name);
  if (index === -1) return null;
  users[index].points += pointsDelta;
  users[index].tier = calculateTier(users[index].points);
  writeData('users.json', users);
  return users[index];
};

export const voteAnswer = (answerId, direction) => {
  const answers = readData('answers.json');
  const index = answers.findIndex(a => a.id === answerId);
  if (index === -1) return null;
  
  const answer = answers[index];
  if (direction === 'up') {
    answer.votes += 1;
  } else if (direction === 'down') {
    answer.votes -= 1;
  }
  
  writeData('answers.json', answers);
  
  const authorName = answer.authorName;
  const authorRole = answer.authorRole;
  getOrCreateUser(authorName, authorRole);
  const pointsDelta = direction === 'up' ? 10 : direction === 'down' ? -5 : 0;
  if (pointsDelta !== 0) {
    updateUserPoints(authorName, pointsDelta);
  }
  
  return answer;
};

export const markBestFit = (questionId, answerId, reason) => {
  const answers = readData('answers.json');
  const questions = readData('questions.json');
  
  let targetAnswer = null;
  answers.forEach(a => {
    if (a.questionId === questionId) {
      if (a.id === answerId) {
        a.isBestFit = true;
        a.bestFitReason = reason;
        targetAnswer = a;
      } else {
        a.isBestFit = false;
        a.bestFitReason = null;
      }
    }
  });
  
  if (targetAnswer) {
    writeData('answers.json', answers);
    
    const qIndex = questions.findIndex(q => q.id === questionId);
    if (qIndex !== -1) {
      questions[qIndex].status = 'resolved';
      writeData('questions.json', questions);
    }
    
    getOrCreateUser(targetAnswer.authorName, targetAnswer.authorRole);
    updateUserPoints(targetAnswer.authorName, 25);
  }
  
  return targetAnswer;
}
