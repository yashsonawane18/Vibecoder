import { NextResponse } from 'next/server';
import { getQuestionById, getAnswersByQuestionId } from '@/lib/storage';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    
    const question = getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const answers = getAnswersByQuestionId(id);
    
    return NextResponse.json({ question, answers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
