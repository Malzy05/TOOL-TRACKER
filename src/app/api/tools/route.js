import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  let query = supabase.from('tools').select('*');
  if (category) {
    query = query.eq('category', category);
  }
  
  try {
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  try {
    const body = await request.json();
    const { error } = await supabase.from('tools').insert([body]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Tool created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
