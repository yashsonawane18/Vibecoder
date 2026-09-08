import { NextResponse } from 'next/server';
import { getQuestionById, getAnswersByQuestionId, markBestFit } from '@/lib/storage';
import { analyzeBestFit } from '@/lib/ai';

export async function POST(request, context) {
  try {
    const { id } = await context.params;
    
    const question = getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const answers = getAnswersByQuestionId(id);
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'No answers to analyze' }, { status: 400 });
    }

    const result = await analyzeBestFit(question.title, question.body, answers);
    if (!result) {
      return NextResponse.json({ error: 'AI analysis failed or unavailable' }, { status: 500 });
    }

    if (result.bestFitId) {
      markBestFit(id, result.bestFitId, result.reason);
    }

    return NextResponse.json({ bestFitId: result.bestFitId, reason: result.reason });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
