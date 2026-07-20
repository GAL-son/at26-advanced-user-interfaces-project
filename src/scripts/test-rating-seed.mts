import { getAllEventsChronologically } from '@/lib/services/events.service';
import { updateEventRating, updateEventErosion } from '@/lib/services/rating.service';
import { config } from '@/lib/services/rating.service';
import { prisma } from '../lib/db/db';

const testConfig = {
    limit: 500
}

async function main() {
    console.log("Seeding Ratings - Full Chronological Recalculation (DB Driven)");

    try {
        await prisma.$transaction([
            prisma.rating.deleteMany({}),
            prisma.driver.updateMany({
                data: {
                    currentRating: config.startingRating,
                    bestRating: config.startingRating,
                    combo: 0,
                    erosion: 0
                }
            })
        ]);

        const allEvents = await getAllEventsChronologically();
        console.log(`Found ${allEvents.length} Events.`);

        let processedCount = 0;
        for (const event of allEvents) {
            if (processedCount >= testConfig.limit) {
                break;
            }

            console.log(`\nProcessing: [${event.date.toISOString().split('T')[0]}] - ${event.name}`);

            const driverGuidsInEvent = new Set<string>();
            event.sessions.forEach(session => {
                session.results.forEach(res => driverGuidsInEvent.add(res.driverGuid));
            });

            const guidsArray = Array.from(driverGuidsInEvent);

            if (guidsArray.length === 0) {
                console.log(`No drivers in this event - skipping rating & erosion`);
                processedCount++;
                continue; 
            }

            const driversFromDb = await prisma.driver.findMany({
                where: {
                    guid: { in: guidsArray }
                },
                select: {
                    guid: true,
                    currentRating: true,
                    bestRating: true,
                    combo: true,
                    joined: true
                }
            });

            const eventDataDto = {
                id: event.id,
                date: event.date,
                drivers: driversFromDb.map(d => ({
                    guid: d.guid,
                    rating: d.currentRating,
                    bestRating: d.bestRating,
                    combo: d.combo,
                    joined: d.joined
                })),
                sessions: event.sessions
            };

            await updateEventRating(eventDataDto);
            console.log(`Updated rating for ${driversFromDb.length} drivers.`);

            const erosionEventDto = {
                id: event.id,
                date: event.date,
                drivers: driversFromDb.map(d => ({
                    guid: d.guid,
                    rating: d.currentRating,
                    bestRating: d.bestRating,
                    combo: d.combo,
                    joined: d.joined
                })),
                sessions: []
            };

            await updateEventErosion(erosionEventDto);
            console.log(`Erosion calculated`);

            processedCount++;
        }

        console.log("\nFinished successfully!");

    } catch (error) {
        console.error("Failed seed", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();