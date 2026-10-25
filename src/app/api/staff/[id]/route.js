import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function PUT(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { error } = await supabase.from('staff').update(body).eq('staff_no', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Staff updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { id } = await params;
  
  try {
    const { error } = await supabase.from('staff').delete().eq('staff_no', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
