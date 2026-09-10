import prisma from '../utils/prisma';
import { EventType } from '@prisma/client';

interface CreateEventInput {
  companyId: string;
  type: EventType;
  title: string;
  dateTime: string;
  venue?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  description?: string;
}

function parseEventDateTime(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw Object.assign(new Error('Invalid event date and time'), { statusCode: 400 });
  }

  return date;
}

export class EventService {
  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};

    return prisma.event.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!event) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }

    return event;
  }

  async create(input: CreateEventInput, userId: string) {
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
    });

    if (!company) {
      throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    }

    const event = await prisma.event.create({
      data: {
        ...input,
        dateTime: parseEventDateTime(input.dateTime),
        isOnline: input.isOnline || false,
        createdById: userId,
      },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify all users who applied to this company
    const applications = await prisma.application.findMany({
      where: { companyId: input.companyId },
      select: { userId: true },
    });

    const notifications = applications.map((app) => ({
      userId: app.userId,
      type: 'EVENT_CREATED' as const,
      title: `New Event: ${event.title}`,
      message: `A new ${input.type} event has been added for ${company.name}.`,
      entityId: event.id,
      entityType: 'Event',
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EVENT_CREATED',
        entity: 'Event',
        entityId: event.id,
        newValue: { title: event.title, type: event.type, company: company.name },
      },
    });

    return event;
  }

  async update(id: string, input: Partial<CreateEventInput>, userId: string) {
    const existing = await prisma.event.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!existing) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }

    const updateData: any = { ...input };
    if (input.dateTime) {
      const dateTime = parseEventDateTime(input.dateTime);
      updateData.dateTime = dateTime;
      if (dateTime.getTime() !== existing.dateTime.getTime()) {
        updateData.reminderSentAt = null;
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify users who applied to this company about the update
    const applications = await prisma.application.findMany({
      where: { companyId: event.companyId },
      select: { userId: true },
    });

    const notifications = applications.map((app) => ({
      userId: app.userId,
      type: 'EVENT_UPDATED' as const,
      title: `Event Updated: ${event.title}`,
      message: `The ${event.type} event for ${event.company.name} has been updated.`,
      entityId: event.id,
      entityType: 'Event',
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EVENT_UPDATED',
        entity: 'Event',
        entityId: id,
        previousValue: { title: existing.title, type: existing.type },
        newValue: { title: event.title, type: event.type },
      },
    });

    return event;
  }

  async delete(id: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!event) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }

    await prisma.event.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EVENT_DELETED',
        entity: 'Event',
        entityId: id,
        previousValue: { title: event.title, type: event.type, company: event.company.name },
      },
    });

    return { message: 'Event deleted successfully' };
  }
}

export const eventService = new EventService();
