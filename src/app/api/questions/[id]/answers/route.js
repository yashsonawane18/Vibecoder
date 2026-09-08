import { NextResponse } from 'next/server';
import { getQuestionById, createAnswer, getAnswersByQuestionId, markBestFit } from '@/lib/storage';
import { analyzeBestFit } from '@/lib/ai';

export async function POST(request, context) {
  try {
    const { id } = await context.params;
    const requestBody = await request.json();
    const { body } = requestBody;
    let { authorName, authorRole } = requestBody;

    if (!body) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    authorName = authorName || 'Anonymous Mentor';
    authorRole = authorRole || 'senior';

    const question = getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const answer = createAnswer({
      questionId: id,
      body,
      authorName,
      authorRole
    });

    const allAnswers = getAnswersByQuestionId(id);
    
    if (allAnswers.length >= 2) {
      const result = await analyzeBestFit(question.title, question.body, allAnswers);
      if (result && result.bestFitId) {
        markBestFit(id, result.bestFitId, result.reason);
      }
    }

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
