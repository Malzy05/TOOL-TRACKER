import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const supabase = getSupabaseServerClient(authHeader);
  
  try {
    const { data: allTools, error: tErr } = await supabase.from('tools').select('*');
    const { data: loans, error: lErr1 } = await supabase.from('tool_loans').select('status, date_loan, date_returned, staff(name), tools(name, tool_id)').order('date_loan', { ascending: false }).limit(5);
    const { data: allLoans, error: lErr2 } = await supabase.from('tool_loans').select('status, date_loan');
    
    if (tErr || lErr1 || lErr2) {
      return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }

    return NextResponse.json({ allTools, loans, allLoans });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
