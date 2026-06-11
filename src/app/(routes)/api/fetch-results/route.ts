import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge runtime jest idealny do prostego przekazywania danych

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Brak parametru URL' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Opcjonalnie: cachuj wyniki na godzinę
    });

    if (!response.ok) {
      throw new Error(`Błąd serwera ACSM: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}