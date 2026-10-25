import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function PUT(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { error } = await supabase.from('tool_loans').update(body).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Loan updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { id } = await params;
  
  try {
    const { error } = await supabase.from('tool_loans').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
