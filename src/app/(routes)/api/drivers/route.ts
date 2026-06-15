import { NextResponse } from 'next/server';
import { getDriversList } from '@/lib/services/drivers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'elo';

    const { drivers, hasMore } = await getDriversList({ page, limit, search, sortBy });

    return NextResponse.json({
      success: true,
      drivers,
      hasMore,
      nextPage: hasMore ? page + 1 : null
    });

  } catch (error: any) {
    console.error("[Drivers API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}