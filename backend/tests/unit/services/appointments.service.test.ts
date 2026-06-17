import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the repository layer so the service is tested in isolation.
vi.mock('../../../src/modules/appointments/appointments.repository', () => ({
  listAppointments: vi.fn(),
  findAppointmentById: vi.fn(),
  findAppointmentConflict: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
}))

import * as repo from '../../../src/modules/appointments/appointments.repository'
import {
  cancelAppointment,
  checkAppointmentAvailability,
  createAppointmentService,
  getAppointmentById,
  listAppointmentsService,
  updateAppointmentService,
} from '../../../src/modules/appointments/appointments.service'
import { AppError } from '../../../src/utils/app-error'

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  id: 'a1',
  patientId: 'p1',
  dentistId: 'd1',
  startsAt: '2025-01-01T09:00:00.000Z',
  endsAt: '2025-01-01T10:00:00.000Z',
  status: 'scheduled',
  reason: null,
  notes: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...over,
})

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe('listAppointmentsService', () => {
  it('maps repository rows through the DTO', async () => {
    vi.mocked(repo.listAppointments).mockResolvedValue([row()] as never)
    const result = await listAppointmentsService({})
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a1')
    expect('branchId' in result[0]).toBe(false)
  })
})

describe('getAppointmentById', () => {
  it('returns the mapped appointment when found', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    expect((await getAppointmentById('a1')).id).toBe('a1')
  })

  it('throws 404 when not found', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(null as never)
    await expect(getAppointmentById('missing')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('checkAppointmentAvailability', () => {
  it('reports available when there is no conflict', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    expect(await checkAppointmentAvailability('d1', 'a', 'b')).toEqual({ available: true, conflictId: null })
  })

  it('reports unavailable and returns the conflicting id', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(row({ id: 'conflict-1' }) as never)
    expect(await checkAppointmentAvailability('d1', 'a', 'b')).toEqual({ available: false, conflictId: 'conflict-1' })
  })

  it('forwards the excludeAppointmentId to the repository', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    await checkAppointmentAvailability('d1', 'a', 'b', 'exclude-me')
    expect(repo.findAppointmentConflict).toHaveBeenCalledWith('d1', 'a', 'b', expect.any(Array), 'exclude-me')
  })
})

describe('createAppointmentService', () => {
  const payload = {
    patientId: 'p1',
    dentistId: 'd1',
    startsAt: '2025-01-01T09:00:00.000Z',
    endsAt: '2025-01-01T10:00:00.000Z',
  }

  it('rejects when end time is not after start time', async () => {
    await expect(
      createAppointmentService({ ...payload, endsAt: payload.startsAt }),
    ).rejects.toMatchObject({ statusCode: 400 })

    await expect(
      createAppointmentService({ ...payload, startsAt: '2025-01-01T10:00:00.000Z', endsAt: '2025-01-01T09:00:00.000Z' }),
    ).rejects.toBeInstanceOf(AppError)

    expect(repo.createAppointment).not.toHaveBeenCalled()
  })

  it('rejects with 409 when the dentist already has an appointment in range', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(row({ id: 'busy' }) as never)
    await expect(createAppointmentService(payload)).rejects.toMatchObject({
      statusCode: 409,
      details: { conflictId: 'busy' },
    })
    expect(repo.createAppointment).not.toHaveBeenCalled()
  })

  it('creates the appointment when valid and conflict-free', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    vi.mocked(repo.createAppointment).mockImplementation((async (data: unknown) => data) as never)
    const result = await createAppointmentService({ ...payload, reason: 'checkup' })
    expect(repo.createAppointment).toHaveBeenCalledOnce()
    expect(result.patientId).toBe('p1')
    expect(result.reason).toBe('checkup')
    expect(result.status).toBe('scheduled')
  })

  it('defaults status to scheduled and nullifies missing reason/notes', async () => {
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    vi.mocked(repo.createAppointment).mockImplementation((async (data: unknown) => data) as never)
    const result = await createAppointmentService(payload)
    expect(result.status).toBe('scheduled')
    expect(result.reason).toBeNull()
    expect(result.notes).toBeNull()
  })
})

describe('updateAppointmentService', () => {
  it('throws 404 when the appointment does not exist', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(null as never)
    await expect(updateAppointmentService('x', {})).rejects.toMatchObject({ statusCode: 404 })
  })

  it('rejects when the resulting end time is not after the start time', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    await expect(
      updateAppointmentService('a1', { endsAt: '2025-01-01T08:00:00.000Z' }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('checks conflicts only for blocking statuses', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    vi.mocked(repo.updateAppointment).mockResolvedValue(row({ status: 'cancelled' }) as never)
    await updateAppointmentService('a1', { status: 'cancelled' })
    // 'cancelled' is non-blocking, so no conflict lookup should happen.
    expect(repo.findAppointmentConflict).not.toHaveBeenCalled()
  })

  it('rejects with 409 on a conflict for a blocking status', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(row({ id: 'busy' }) as never)
    await expect(updateAppointmentService('a1', { status: 'confirmed' })).rejects.toMatchObject({ statusCode: 409 })
  })

  it('excludes the current appointment id from its own conflict check', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    vi.mocked(repo.updateAppointment).mockResolvedValue(row() as never)
    await updateAppointmentService('a1', { status: 'confirmed' })
    expect(repo.findAppointmentConflict).toHaveBeenCalledWith('d1', expect.any(String), expect.any(String), expect.any(Array), 'a1')
  })

  it('updates successfully and returns the mapped row', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    vi.mocked(repo.findAppointmentConflict).mockResolvedValue(null as never)
    vi.mocked(repo.updateAppointment).mockResolvedValue(row({ reason: 'updated' }) as never)
    const result = await updateAppointmentService('a1', { reason: 'updated' })
    expect(result.reason).toBe('updated')
  })
})

describe('cancelAppointment', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(null as never)
    await expect(cancelAppointment('x')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('sets status to cancelled and returns success', async () => {
    vi.mocked(repo.findAppointmentById).mockResolvedValue(row() as never)
    vi.mocked(repo.updateAppointment).mockResolvedValue(row({ status: 'cancelled' }) as never)
    expect(await cancelAppointment('a1')).toEqual({ success: true })
    expect(repo.updateAppointment).toHaveBeenCalledWith('a1', expect.objectContaining({ status: 'cancelled' }))
  })
})
