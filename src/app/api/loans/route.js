import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  try {
    const { data, error } = await supabase.from('tool_loans').select('id, status, date_loan, date_returned, staff(name, staff_no), tools(name, tool_id)');
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
    const { error } = await supabase.from('tool_loans').insert([body]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Loan created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
