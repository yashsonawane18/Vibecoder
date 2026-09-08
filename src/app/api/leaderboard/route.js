import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/storage';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
