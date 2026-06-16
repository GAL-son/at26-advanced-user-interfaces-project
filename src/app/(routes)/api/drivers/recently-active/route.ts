import { NextResponse } from 'next/server';
import { getRecentlyActiveDrivers } from '@/lib/services/drivers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const since = searchParams.get('since') || '7d';

    // Korzystamy z tej samej zunifikowanej logiki
    const drivers = await getRecentlyActiveDrivers({ sinceParam: since, limitParam: limit });

    const response = NextResponse.json({
      success: true,
      count: drivers.length,
      drivers // Uwaga: struktura pol tutaj będzie zmapowana (name zamiast mainName itp.)
    });
    
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return response;

  } catch (error: any) {
    console.error("[Recently Active Drivers API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}