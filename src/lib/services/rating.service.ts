import { prisma } from '@/lib/db/db';

export const config = {
    startingRating: 1000,
    comboMutliplierLimit: 15,
    maxComboMultiplier: 3,
    erosionStart: 10, // 10 weeks
    erosionValue: 2, // points every week over start
    erosionLimitOffset: 500, // 500 points below base
    positionAdjustmentMutiplier: 100,
    raceK: 64,
    qualiK: 32,
}

export interface EventDataDto {
    id: string;
    date: Date,
    drivers: {
        guid: string,
        rating: number,
        bestRating: number
        combo: number,
        joined: Date,
    }[]
    sessions: SessionDataDto[]
}

export interface SessionDataDto {
    type: string,
    results: {
        driverGuid: string,
        start: number | null,
        finish: number | null,
        laps: number
    }[]
}

export async function updateEventErosion(eventData: EventDataDto): Promise<void> {
    if(eventData.drivers.length <= 1) {
        return;
    }

    const activeDriverGuids = eventData.drivers.map(d => d.guid);

    const erodedDrivers = await prisma.driver.findMany({
        where: {
            guid: {
                notIn: activeDriverGuids
            },
            joined: {
                lte: eventData.date
            }
        }
    });

    if (erodedDrivers.length === 0) return;

    const prismaOperations = [];

    for (const driver of erodedDrivers) {
        const newRating = calcuateEventErodedRating(driver.currentRating, driver.erosion);

        const currentRatingInt = Math.round(newRating);
        const previousRatingInt = Math.round(driver.currentRating);

        const nextDriverErosion = driver.erosion + 1;
        const nextDriverCombo = 0;

        prismaOperations.push(
            prisma.rating.upsert({
                where: {
                    eventId_driverGuid: {
                        eventId: eventData.id,
                        driverGuid: driver.guid,
                    },
                },
                update: {
                    tookPart: false,
                    current: currentRatingInt,
                    previous: previousRatingInt,
                    combo: driver.combo,
                    erosion: driver.erosion,
                },
                create: {
                    eventId: eventData.id,
                    driverGuid: driver.guid,
                    tookPart: false,
                    current: currentRatingInt,
                    previous: previousRatingInt,
                    combo: driver.combo,
                    erosion: driver.erosion,
                },
            })
        );

        prismaOperations.push(
            prisma.driver.update({
                where: { guid: driver.guid },
                data: {
                    currentRating: newRating,
                    combo: nextDriverCombo,
                    erosion: nextDriverErosion,
                },
            })
        );
    }

    try {
        await prisma.$transaction(prismaOperations);
    } catch (error) {
        console.error("Błąd podczas naliczania erozji rankingowej:", error);
        throw error;
    }
}

export async function updateEventRating(eventData: EventDataDto): Promise<void> {
    if(eventData.drivers.length <= 1) {
        return;
    }

    // Initialize rating change
    const ratingChange: Record<string, { base: number, change: number }> = {};
    eventData.drivers.forEach(driver => ratingChange[driver.guid] = { base: driver.rating, change: 0 })

    for (const sessionData of eventData.sessions) {
        calculateRatingChange(ratingChange, sessionData)
    }

    const prismaOperations = [];
    for (const driver of eventData.drivers) {
        const change = ratingChange[driver.guid];

        const calculatedNewRating = calcualteEventResultRating(
            driver.rating,
            driver.combo,
            ratingChange[driver.guid].change
        );

        // Round just in case
        const currentRatingInt = Math.round(calculatedNewRating);
        const previousRatingInt = Math.round(driver.rating);

        const nextDriverCombo = driver.combo + 1;
        const ratingHistoryCombo = driver.combo;
        const erosion = 0 // Reset erosion on participation     

        const nextBestRating = Math.round(calculatedNewRating > driver.bestRating
            ? calculatedNewRating
            : driver.bestRating);

        console.debug(`Driver ${driver.guid}`)
        console.debug({
            prev: previousRatingInt,
            next: currentRatingInt,
            best: nextBestRating,
            combo:ratingHistoryCombo,
            nextcombo: nextDriverCombo,
        })

        prismaOperations.push(
            prisma.rating.upsert({
                where: {
                    eventId_driverGuid: {
                        eventId: eventData.id,
                        driverGuid: driver.guid,
                    },
                },
                update: {
                    tookPart: true,
                    current: currentRatingInt,
                    previous: previousRatingInt,
                    combo: ratingHistoryCombo,
                    erosion: erosion,
                },
                create: {
                    eventId: eventData.id,
                    driverGuid: driver.guid,
                    tookPart: true,
                    current: currentRatingInt,
                    previous: previousRatingInt,
                    combo: ratingHistoryCombo,
                    erosion: erosion,
                },
            })
        );

        prismaOperations.push(
            prisma.driver.update({
                where: { guid: driver.guid },
                data: {
                    currentRating: currentRatingInt,
                    bestRating: nextBestRating,
                    combo: nextDriverCombo,
                    erosion: erosion
                },
            })
        );
    }

    try {
        await prisma.$transaction(prismaOperations);
        console.log("Saved")
    } catch (error) {
        console.error("Failed when saving result:", error);
        throw error;
    }
}

function calculateRatingChange(
    eloChange: Record<string, { base: number, change: number }>,
    sessionData: SessionDataDto,
) {
    console.debug(sessionData.type)
    const driverCount = sessionData.results.length;
    const eventChange: Record<string, number> = {};
    sessionData.results.forEach(result => {eventChange[result.driverGuid] = 0})


    for (let i = 0; i < sessionData.results.length; i++) {
        for (let j = i + 1; j < sessionData.results.length; j++) {
            const driverA = sessionData.results[i];
            const driverB = sessionData.results[j];

            console.debug(`Comparing drivers: A: ${driverA.driverGuid} vs. B: ${driverB.driverGuid}`);
            console.debug(`A: ${driverA.start} => ${driverA.finish} vs B: ${driverB.start} => ${driverB.finish}`)
            const resultA = sessionData.results[i];
            const resultB = sessionData.results[j];

            if (resultA.driverGuid == resultB.driverGuid) {
                continue;
            }

            let ratingA = eloChange[resultA.driverGuid].base;
            let ratingB = eloChange[resultB.driverGuid].base;

            console.debug(`Raw A: ${ratingA} vs B: ${ratingB}`)

            // Standard head to head is the base case (quali)
            let K = config.qualiK;

            // When processing races need to adjust for starting position
            if (sessionData.type == "RACE") {
                K = config.raceK;
                ratingA = adjustForStartingPosition(ratingA, driverCount, resultA.start as number);
                ratingB = adjustForStartingPosition(ratingB, driverCount, resultB.start as number)
            }

            console.debug(`Adjusted A: ${ratingA} vs B: ${ratingB}`)

            const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
            const actualA = Number((resultA.finish as number) < (resultB.finish as number));
            console.log(`ExpectedA ${expectedA} vs ActualA ${actualA}`)

            const pointsExchanged = (K * (actualA - expectedA));
            console.debug(`Exchanged points for A: ${pointsExchanged}`)

            eventChange[resultA.driverGuid] += pointsExchanged;
            eventChange[resultB.driverGuid] += pointsExchanged * (-1);

            console.debug("Current Elo change A: " + eventChange[resultA.driverGuid])
            console.debug("Current Elo change B: " + eventChange[resultB.driverGuid])
        }
    }

    console.debug(driverCount - 1)
    for (const guid in eventChange) {
        if (eventChange.hasOwnProperty(guid)) {
            
            eventChange[guid] /= (driverCount - 1);
            eloChange[guid].change += eventChange[guid];
            console.debug(`TOTAL ${guid} => ${eventChange[guid]}`)
            console.debug(`CHANGE FOR ${guid} => ${eloChange[guid].change}`)
        }
    }

    
}

/**
 * Caclulates combo multiplier
 * @param combo 
 * @returns 
 */
function calculateComboMultiplier(combo: number): number {
    if (combo <= 1) return 1;

    // Quadratic curve
    const multiplier = 1 + (Math.max(0, Math.min(combo, config.comboMutliplierLimit) - 1) / 9) ** 2

    // Clamp to max value
    return Math.min(config.maxComboMultiplier, multiplier)
}

/**
 * Calcualtes the <b>amout of erosion<b>
 * @param erosion 
 */
function calculateErosion(erosion: number): number {
    return Math.max(0, erosion - config.erosionStart + 1) * config.erosionValue;
}

function calcuateEventErodedRating(rating: number, erosion: number): number {
    return Math.max(config.startingRating - config.erosionLimitOffset, rating - calculateErosion(erosion));
}

function calcualteEventResultRating(rating: number, combo: number, ratingChange: number): number {
    let comboMultiplier = 1;

    if (ratingChange > 0) {
        comboMultiplier = calculateComboMultiplier(combo);
    }

    return Math.max(0, rating + ratingChange * comboMultiplier);
}

function adjustForStartingPosition(rating: number, numberOfDrivers: number, startingPosition: number): number {
    const adjustmentRate = ((startingPosition-1) - (numberOfDrivers - 1) / numberOfDrivers ) / numberOfDrivers; // 0.5 dla 4 kierowców,
    return rating - adjustmentRate * config.positionAdjustmentMutiplier;
}

