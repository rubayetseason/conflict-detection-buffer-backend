import httpStatus from 'http-status';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/shared/prisma';

describe('Booking Availability - /api/v1/bookings/available-slots', () => {
  const resource = 'Resource 1';

  beforeAll(async () => {
    await prisma.booking.create({
      data: {
        resource,
        startTime: new Date('2025-07-26T14:00:00.000Z'),
        endTime: new Date('2025-07-26T15:00:00.000Z'),
        requestedBy: 'TestSeeder',
        userId: '687f9356c0d6241e4cdd9a6b',
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({
      where: { resource, requestedBy: 'TestSeeder' },
    });
    await prisma.$disconnect();
  });

  const scenarios = [
    {
      name: '❌ Rejected - overlaps buffer before (12:55 - 13:55)',
      startTime: '2025-07-26T12:55:00.000Z',
      endTime: '2025-07-26T13:55:00.000Z',
      expectedAvailable: false,
    },
    {
      name: '❌ Rejected - overlaps buffer before (12:50 - 13:50)',
      startTime: '2025-07-26T12:50:00.000Z',
      endTime: '2025-07-26T13:50:00.000Z',
      expectedAvailable: false,
    },
    {
      name: '❌ Rejected - exact overlap with original (14:00 - 15:00)',
      startTime: '2025-07-26T14:00:00.000Z',
      endTime: '2025-07-26T15:00:00.000Z',
      expectedAvailable: false,
    },
    {
      name: '✅ Allowed - starts after buffer ends (15:15 - 16:00)',
      startTime: '2025-07-26T15:15:00.000Z',
      endTime: '2025-07-26T16:00:00.000Z',
      expectedAvailable: true,
    },
    {
      name: '✅ Allowed - ends before buffer starts (11:00 - 12:45)',
      startTime: '2025-07-26T11:00:00.000Z',
      endTime: '2025-07-26T12:45:00.000Z',
      expectedAvailable: true,
    },
  ];

  scenarios.forEach(({ name, startTime, endTime, expectedAvailable }) => {
    test(`${name}`, async () => {
      const res = await request(app)
        .get('/api/v1/bookings/available-slots')
        .query({ resource, startTime, endTime })
        .expect(httpStatus.OK);

      expect(res.body.available).toBe(expectedAvailable);
    });
  });
});
