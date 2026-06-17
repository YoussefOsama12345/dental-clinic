import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/modules/dentists/dentists.repository', () => ({
  listDentists: vi.fn(),
  findDentistById: vi.fn(),
  createDentist: vi.fn(),
  updateDentist: vi.fn(),
}))

import * as repo from '../../../src/modules/dentists/dentists.repository'
import {
  createDentistService,
  deactivateDentist,
  getDentistById,
  listDentistsService,
  updateDentistService,
} from '../../../src/modules/dentists/dentists.service'

const row = (over: Record<string, unknown> = {}) => ({
  id: 'd1',
  fullName: 'Dr. Sarah',
  specialty: null,
  licenseNumber: null,
  phone: null,
  email: null,
  color: '#04CF9E',
  yearsExperience: null,
  qualificationsJson: '[]',
  bio: null,
  workingDaysJson: '[]',
  workStart: '09:00',
  workEnd: '17:00',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe('listDentistsService', () => {
  it('maps rows through the DTO', async () => {
    vi.mocked(repo.listDentists).mockResolvedValue([row()] as never)
    const result = await listDentistsService({})
    expect(result[0].fullName).toBe('Dr. Sarah')
    expect('branchId' in result[0]).toBe(false)
  })
})

describe('getDentistById', () => {
  it('returns the dentist when found', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(row() as never)
    expect((await getDentistById('d1')).id).toBe('d1')
  })

  it('throws 404 when not found', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(null as never)
    await expect(getDentistById('x')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('createDentistService', () => {
  it('applies defaults (color, workStart/End, isActive) and serializes arrays', async () => {
    vi.mocked(repo.createDentist).mockImplementation((async (data: unknown) => data) as never)
    const result = await createDentistService({ fullName: 'Dr. New', qualifications: ['BDS'] })
    expect(result.fullName).toBe('Dr. New')
    expect(result.color).toBe('#04CF9E')
    expect(result.workStart).toBe('09:00')
    expect(result.workEnd).toBe('17:00')
    expect(result.isActive).toBe(true)
    expect(result.qualifications).toEqual(['BDS'])
  })
})

describe('updateDentistService', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(null as never)
    await expect(updateDentistService('x', { fullName: 'Z' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('updates and returns the mapped dentist', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(row() as never)
    vi.mocked(repo.updateDentist).mockResolvedValue(row({ fullName: 'Dr. Updated' }) as never)
    expect((await updateDentistService('d1', { fullName: 'Dr. Updated' })).fullName).toBe('Dr. Updated')
  })
})

describe('deactivateDentist', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(null as never)
    await expect(deactivateDentist('x')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('sets isActive false and returns success', async () => {
    vi.mocked(repo.findDentistById).mockResolvedValue(row() as never)
    vi.mocked(repo.updateDentist).mockResolvedValue(row({ isActive: false }) as never)
    expect(await deactivateDentist('d1')).toEqual({ success: true })
    expect(repo.updateDentist).toHaveBeenCalledWith('d1', expect.objectContaining({ isActive: false }))
  })
})
