import { NextRequest } from 'next/server'
import { POST } from '../app/api/users/route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
    },
  },
}));

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にユーザーを作成できること', async () => {
    const mockUser = {
      id: '17441a88-60f1-709b-b7e3-3e3173aca5d62',
      email: 'test@example.com',
      cognitoId: '17441a88-60f1-709b-b7e3-3e3173aca5d62',
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date('2025-01-24T10:59:54.239Z'),
      createdAt: new Date('2025-01-24T10:59:54.239Z'),
      updatedAt: new Date('2025-01-24T10:59:54.239Z'),
    }

    ;(prisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser)

    const request = new NextRequest(new Request('http://localhost/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        sub: '17441a88-60f1-709b-b7e3-3e3173aca5d62',
      })
    }))

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      success: true,
      user: expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        cognitoId: mockUser.cognitoId,
        status: mockUser.status,
        emailVerified: mockUser.emailVerified,
      }),
    })
  })
}) 