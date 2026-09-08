import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/storage';
import { checkDuplicates } from '@/lib/ai';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { title, body, subject } = requestBody;

    if (!title || !body || !subject) {
      return NextResponse.json({ error: 'Title, body, and subject are required' }, { status: 400 });
    }

    const existingQuestions = getQuestions();
    const duplicates = await checkDuplicates(title, body, subject, existingQuestions);
    
    return NextResponse.json({ duplicates: duplicates || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
