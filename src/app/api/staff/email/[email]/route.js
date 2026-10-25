import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  const { email } = await params;
  
  try {
    const { data, error } = await supabase.from('staff').select('staff_no').eq('email', decodeURIComponent(email)).maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
