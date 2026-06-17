import { NextResponse } from "next/server";

const mockRegistrations = [
  { id: "1", driverName: "Max Verstappen", steamId: "76561198000000001", car: "Ferrari 488 GT3" },
  { id: "2", driverName: "Lewis Hamilton", steamId: "76561198000000002", car: "Porsche 911 GT3" }
];

export async function GET() {
  // Losowe rzucanie błędu (średnio raz na 3 zapytania)
  if (Math.floor(Math.random() * 100) % 3 === 0) {
    return NextResponse.json(
      { error: "Błąd połączenia z bazą danych (Symulacja błędu sieciowego)" }, 
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(mockRegistrations);
  } catch {
    return NextResponse.json({ error: "Błąd sieciowy." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Losowe rzucanie błędu przy wysyłaniu formularza
  if (Math.floor(Math.random() * 100) % 3 === 0) {
    return NextResponse.json(
      { error: "Serwer jest przeciążony. Nie udało się zapisać danych." }, 
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const newRegistration = {
      id: crypto.randomUUID(),
      driverName: body.driverName,
      steamId: body.steamId,
      car: body.car
    };
    mockRegistrations.push(newRegistration);
    return NextResponse.json(newRegistration, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}