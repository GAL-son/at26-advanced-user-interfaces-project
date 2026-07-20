// src/app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Event as DisplayEvent } from '@/model/event'
import { Event } from '@/lib/db/types';
import { getEventById } from '@/lib/services/events.service';

interface EventPathParams {
    params: Promise<{id: string}>
}

export async function GET(
    request: Request,
    { params }: EventPathParams
) {
    const {id} = await params;
    const event = await getEventById(id);

    if(!event) {
        return NextResponse.json({message: "No such event"}, {status: 404});
    }

    return NextResponse.json(event);
}