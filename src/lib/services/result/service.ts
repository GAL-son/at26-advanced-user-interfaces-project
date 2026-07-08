"use server"
import { prisma } from '@/lib/db/db';
import { AcsmDriverResult, AcsmSessionType } from "../acsm/types";

export async function syncResultFromAcsm(sessionId: string, driverResult : AcsmDriverResult, isSessionQualify: boolean, index: number, gap: number): Promise<void> {
    return await prisma.result.upsert({
        where: {
            sessionId_driverGuid: {
                sessionId: sessionId,
                driverGuid: driverResult.DriverGuid,
            }
        },
        update:{},
        create: {
            sessionId: sessionId,
            driverGuid: driverResult.DriverGuid,
            start: isSessionQualify ? null : driverResult.GridPosition,
            finish: index,
            car: driverResult.CarModel,
            laps: driverResult.NumLaps,
            totalTime: driverResult.TotalTime,
            bestLap: driverResult.BestLap,
            gap: gap,
        }
    });
}
