import prisma from '../utils/prisma';
import { pushService } from '../services/push.service';

const REMINDER_TYPE = 'EVENT_REMINDER' as const;
const ENTITY_TYPE = 'EVENT';

function formatEventTime(dateTime: Date): string {
  return dateTime.toISOString();
}

function getReminderMessage(event: {
  company: { name: string };
  title: string;
  type: string;
  dateTime: Date;
  isOnline: boolean;
  venue: string | null;
}): string {
  const location = event.isOnline ? 'Online' : (event.venue || 'Venue TBD');
  return `${event.type} "${event.title}" at ${event.company.name} starts now at ${formatEventTime(event.dateTime)} (${location}).`;
}

async function processEvent(eventId: string, now: Date): Promise<{ sent: number; failed: number }> {
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Event" WHERE "id" = ${eventId} FOR UPDATE`;

    const event = await transaction.event.findUnique({
      where: { id: eventId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            applications: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!event || event.reminderSentAt || event.dateTime > now) {
      return { sent: 0, failed: 0 };
    }

    const title = 'PlacementHub — Event Starting';
    const message = getReminderMessage(event);
    let sent = 0;
    let failed = 0;

    for (const application of event.company.applications) {
      const existingNotification = await transaction.notification.findFirst({
        where: {
          userId: application.userId,
          type: REMINDER_TYPE,
          entityId: event.id,
          entityType: ENTITY_TYPE,
        },
        select: { id: true },
      });

      if (existingNotification) {
        sent += 1;
        continue;
      }

      try {
        await pushService.sendToUser(application.userId, {
          title,
          body: message,
          url: `/companies/${event.company.id}`,
        });

        await transaction.notification.create({
          data: {
            userId: application.userId,
            type: REMINDER_TYPE,
            title,
            message,
            entityId: event.id,
            entityType: ENTITY_TYPE,
          },
        });
        sent += 1;
      } catch (error: unknown) {
        failed += 1;
        const failure = error as { message?: string; statusCode?: number };
        console.error('EVENT REMINDER JOB: user processing failed', {
          eventId,
          userId: application.userId,
          statusCode: failure.statusCode,
          message: failure.message,
        });
      }
    }

    if (failed === 0) {
      await transaction.event.update({
        where: { id: event.id },
        data: { reminderSentAt: now },
      });
    }

    return { sent, failed };
  }, { timeout: 60000 });
}

async function main(): Promise<void> {
  console.log('EVENT REMINDER JOB: started');
  const now = new Date();
  const dueEvents = await prisma.event.findMany({
    where: {
      dateTime: { lte: now },
      reminderSentAt: null,
    },
    select: { id: true },
    orderBy: { dateTime: 'asc' },
  });

  console.log(`EVENT REMINDER JOB: found ${dueEvents.length} due events`);
  for (const event of dueEvents) {
    console.log(`EVENT REMINDER JOB: processing event ${event.id}`);
    try {
      const result = await processEvent(event.id, now);
      console.log(`EVENT REMINDER JOB: sent reminders to ${result.sent} users`, {
        failed: result.failed,
      });
    } catch (error: unknown) {
      const failure = error as { message?: string };
      console.error('EVENT REMINDER JOB: event processing failed', {
        eventId: event.id,
        message: failure.message,
      });
    }
  }

  console.log('EVENT REMINDER JOB: completed');
}

main()
  .catch((error: unknown) => {
    const failure = error as { message?: string };
    console.error('EVENT REMINDER JOB: fatal error', { message: failure.message });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
