import { NextResponse } from 'next/server';
import { voteAnswer } from '@/lib/storage';

export async function POST(request, context) {
  try {
    const { id } = await context.params; // eslint-disable-line no-unused-vars
    const requestBody = await request.json();
    const { answerId, direction } = requestBody;

    if (!answerId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid answerId or direction' }, { status: 400 });
    }

    const updatedAnswer = voteAnswer(answerId, direction);
    if (!updatedAnswer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json({ answer: updatedAnswer });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
