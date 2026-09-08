import { NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/lib/storage';
import { getAIAnswer } from '@/lib/ai';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const questions = getQuestions(subject);
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { title, body, subject, mode } = requestBody;
    let { authorName, authorRole } = requestBody;

    if (!title || !body || !subject) {
      return NextResponse.json({ error: 'Title, body, and subject are required' }, { status: 400 });
    }

    authorName = authorName || 'Anonymous Student';
    authorRole = authorRole || 'student';

    const newQuestion = createQuestion({
      title,
      body,
      subject,
      authorName,
      authorRole,
      mode: mode || 'mentor',
      aiAnswer: null,
      status: 'open'
    });

    if (newQuestion.mode === 'ai') {
      const aiResponse = await getAIAnswer(title, body, subject);
      if (aiResponse) {
        newQuestion.aiAnswer = aiResponse;

        // Persist the AI answer to storage
        try {
          const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
          const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
          const index = questions.findIndex(q => q.id === newQuestion.id);
          if (index !== -1) {
            questions[index].aiAnswer = aiResponse;
            fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
          }
        } catch (updateError) {
          console.error('Failed to persist AI answer:', updateError);
        }
      }
    }

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

