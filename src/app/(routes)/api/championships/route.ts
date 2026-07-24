import { NextRequest, NextResponse } from 'next/server';
import { ChampionshipListItemDto } from '@/features/championships/championships.types';
import { getAllChampionships, getChampionshipsList } from '@/features/championships/services/championships.service';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    let championships: ChampionshipListItemDto[] = [];
    if (!searchParams) {
        championships = await getAllChampionships();
    } else {
        const take = parseInt(searchParams.get("take") || '10');
        const skip = parseInt(searchParams.get("skip") || '0');
        const search = searchParams.get("search") || undefined;
        championships = await getChampionshipsList(skip, take, search);
    }
    
    return NextResponse.json(championships);
}