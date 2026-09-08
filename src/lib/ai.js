import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiFallbackClient {
  constructor(apiKeys) {
    this.apiKeys = apiKeys.filter(key => key && key !== 'your-primary-key-here');
    this.currentKeyIndex = 0;
  }

  async generate(prompt) {
    if (this.apiKeys.length === 0) {
      throw new Error('No valid Gemini API keys available');
    }

    while (this.currentKeyIndex < this.apiKeys.length) {
      try {
        const key = this.apiKeys[this.currentKeyIndex];
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        const status = error.status || (error.response && error.response.status);
        if (status === 429 || status === 403 || error.name === 'NetworkError' || error.message.includes('fetch')) {
          console.warn(`API key at index ${this.currentKeyIndex} failed: ${error.message}. Trying next key...`);
          this.currentKeyIndex++;
        } else {
          throw error;
        }
      }
    }
    
    this.currentKeyIndex = 0;
    throw new Error('All provided Gemini API keys have been exhausted or failed.');
  }
}

const getApiKeys = () => {
  return [
    process.env.PRIMARY_GEMINI_API_KEY,
    process.env.SECONDARY_GEMINI_API_KEY,
  ];
};

const getClient = () => {
  return new GeminiFallbackClient(getApiKeys());
};

export const checkDuplicates = async (title, body, subject, existingQuestions) => {
  const client = getClient();
  if (client.apiKeys.length === 0 || !existingQuestions || existingQuestions.length === 0) {
    return [];
  }

  const subjectQuestions = existingQuestions.filter(q => q.subject === subject);
  if (subjectQuestions.length === 0) return [];

  const questionsList = subjectQuestions.map(q => `ID: ${q.id}, Title: ${q.title}`).join('\n');
  const prompt = `Given this new question: ${title} ${body}. Check if any of these existing questions are semantically similar (asking the same thing):\n${questionsList}\nReturn a JSON array of matching question IDs. If none match, return []. Return ONLY the JSON array, no other text.`;

  try {
    const responseText = await client.generate(prompt);
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const ids = JSON.parse(cleanedText);
    if (Array.isArray(ids)) {
      return subjectQuestions.filter(q => ids.includes(q.id));
    }
    return [];
  } catch (error) {
    console.error('Error in checkDuplicates:', error);
    return [];
  }
};

export const getAIAnswer = async (title, body, subject) => {
  const client = getClient();
  if (client.apiKeys.length === 0) {
    return 'AI is currently unavailable. Please configure your Gemini API key.';
  }

  const prompt = `You are an expert academic tutor. A student has asked: Subject: ${subject}. Question: ${title}. Details: ${body}. Provide a clear, concise, and accurate explanation. Use examples where helpful. Format with markdown.`;

  try {
    const responseText = await client.generate(prompt);
    return responseText;
  } catch (error) {
    console.error('Error in getAIAnswer:', error);
    return 'We encountered an error while generating the AI answer. Please try again later.';
  }
};

export const analyzeBestFit = async (questionTitle, questionBody, answers) => {
  const client = getClient();
  if (client.apiKeys.length === 0 || !answers || answers.length < 1) {
    return null;
  }

  const answersList = answers.map(a => `ID: ${a.id}, Body: ${a.body}`).join('\n\n');
  const prompt = `A student asked: ${questionTitle} ${questionBody}. The following answers were submitted:\n${answersList}\nAnalyze each answer for correctness, completeness, and clarity. Select the BEST answer. Return JSON: {"bestFitId": "the-answer-id", "reason": "brief explanation of why this is the best answer"}. Return ONLY the JSON.`;

  try {
    const responseText = await client.generate(prompt);
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);
    if (data && data.bestFitId && data.reason) {
      return { bestFitId: data.bestFitId, reason: data.reason };
    }
    return null;
  } catch (error) {
    console.error('Error in analyzeBestFit:', error);
    return null;
  }
};
