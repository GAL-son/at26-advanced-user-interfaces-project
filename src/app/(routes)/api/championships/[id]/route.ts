import { NextRequest, NextResponse } from 'next/server';
import { getChampionship } from '@/features/championships/services/championships.service';

interface PathParams {
    params: {id: string;};
};


export async function GET(request: NextRequest, {params}: PathParams) {
    const {id} = await params;

    const championship = await getChampionship(id);

    if(!championship) {
        return NextResponse.json({error: "Championship not found"}, {status: 404});
    }

    return NextResponse.json(championship);
}