import { prisma } from '@/lib/db';

interface ACSMDriver {
    Guid: string;
    Name: string;
}

interface ACSMCar {
    Driver: ACSMDriver;
}

interface ACSMResultsJson {
    Cars: ACSMCar[];
}

export async function processEventDrivers(event: { id: string; resultsJsonUrl: string }) {
    const response = await fetch(event.resultsJsonUrl, {
        headers: { 'User-Agent': 'ACSM-Drivers-Processor' },
        cache: 'no-store'
    });

    if (response.status === 429) {
        throw new Error('RATE_LIMIT');
    }

    if (!response.ok) {
        throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const resultsData = (await response.json()) as ACSMResultsJson;

    if (!resultsData || !resultsData.Cars || !Array.isArray(resultsData.Cars)) {
        return { skipped: true, reason: 'Empty or corrupt JSON' };
    }

    const validCars = resultsData.Cars.filter(car => car && car.Driver && car.Driver.Guid);

    for (const car of validCars) {
        const guid = car.Driver.Guid.trim();
        const currentRaceName = car.Driver.Name.trim();

        if (!guid || !currentRaceName) continue;

        const existingDriver = await prisma.driver.findUnique({ where: { guid } });

        if (!existingDriver) {
            // NOWY KIEROWCA
            await prisma.driver.create({
                data: {
                    guid,
                    mainName: currentRaceName,
                    altNames: null,
                    currentElo: 1000.0
                }
            });
        } else {
            // ISTNIEJĄCY KIEROWCA - Rotacja nicków (najnowszy staje się głównym)
            const isMainNameMatch = existingDriver.mainName === currentRaceName;

            if (!isMainNameMatch) {
                const oldMainName = existingDriver.mainName;
                const existingAltNames = existingDriver.altNames
                    ? existingDriver.altNames.split(',').map(n => n.trim())
                    : [];

                if (!existingAltNames.includes(oldMainName)) {
                    existingAltNames.push(oldMainName);
                }

                const filteredAltNames = existingAltNames.filter(n => n !== currentRaceName);
                const updatedAltNamesString = filteredAltNames.length > 0 ? filteredAltNames.join(', ') : null;

                await prisma.driver.update({
                    where: { guid },
                    data: {
                        mainName: currentRaceName,
                        altNames: updatedAltNamesString
                    }
                });
            }
        }
    }

    return { success: true, processedDriversCount: validCars.length };
}