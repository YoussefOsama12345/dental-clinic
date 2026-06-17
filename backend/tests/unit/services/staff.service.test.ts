import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/modules/staff/staff.repository', () => ({
  listStaff: vi.fn(),
  listRosterDentists: vi.fn(),
  findStaffById: vi.fn(),
  createStaff: vi.fn(),
  updateStaff: vi.fn(),
}))

import * as repo from '../../../src/modules/staff/staff.repository'
import {
  createStaffService,
  deactivateStaff,
  getStaffById,
  listRoster,
  listStaffService,
  updateStaffService,
} from '../../../src/modules/staff/staff.service'

const staffRow = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  fullName: 'Jane Roe',
  role: 'reception',
  phone: null,
  email: null,
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...over,
})

const dentistRow = (over: Record<string, unknown> = {}) => ({
  id: 'd1',
  fullName: 'Dr. Sarah',
  phone: null,
  email: null,
  isActive: true,
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe('listStaffService', () => {
  it('maps rows through the DTO', async () => {
    vi.mocked(repo.listStaff).mockResolvedValue([staffRow()] as never)
    const result = await listStaffService({})
    expect(result[0].fullName).toBe('Jane Roe')
    expect('branchId' in result[0]).toBe(false)
  })
})

describe('listRoster', () => {
  it('combines dentists (tagged Doctor) and staff with friendly role labels', async () => {
    vi.mocked(repo.listRosterDentists).mockResolvedValue([dentistRow()] as never)
    vi.mocked(repo.listStaff).mockResolvedValue([staffRow({ role: 'nurse' })] as never)
    const roster = await listRoster({})
    const doctor = roster.find((r) => r.kind === 'dentist')
    const nurse = roster.find((r) => r.kind === 'staff')
    expect(doctor?.role).toBe('Doctor')
    expect(nurse?.role).toBe('Nurse')
  })

  it('marks an inactive dentist status correctly', async () => {
    vi.mocked(repo.listRosterDentists).mockResolvedValue([dentistRow({ isActive: false })] as never)
    vi.mocked(repo.listStaff).mockResolvedValue([] as never)
    const roster = await listRoster({})
    expect(roster[0].status).toBe('inactive')
  })

  it('filters by role (case-insensitive)', async () => {
    vi.mocked(repo.listRosterDentists).mockResolvedValue([dentistRow()] as never)
    vi.mocked(repo.listStaff).mockResolvedValue([staffRow({ role: 'nurse' })] as never)
    const roster = await listRoster({ role: 'doctor' })
    expect(roster).toHaveLength(1)
    expect(roster[0].role).toBe('Doctor')
  })

  it('filters by a name search', async () => {
    vi.mocked(repo.listRosterDentists).mockResolvedValue([dentistRow({ fullName: 'Dr. Sarah' })] as never)
    vi.mocked(repo.listStaff).mockResolvedValue([staffRow({ fullName: 'Jane Roe' })] as never)
    const roster = await listRoster({ search: 'jane' })
    expect(roster).toHaveLength(1)
    expect(roster[0].fullName).toBe('Jane Roe')
  })
})

describe('getStaffById', () => {
  it('returns the member when found', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(staffRow() as never)
    expect((await getStaffById('s1')).id).toBe('s1')
  })

  it('throws 404 when not found', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(null as never)
    await expect(getStaffById('x')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('createStaffService', () => {
  it('defaults role to reception and status to active', async () => {
    vi.mocked(repo.createStaff).mockImplementation((async (data: unknown) => data) as never)
    const result = await createStaffService({ fullName: 'New Person' })
    expect(result.role).toBe('reception')
    expect(result.status).toBe('active')
  })
})

describe('updateStaffService', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(null as never)
    await expect(updateStaffService('x', { fullName: 'Z' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('updates and returns the mapped member', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(staffRow() as never)
    vi.mocked(repo.updateStaff).mockResolvedValue(staffRow({ fullName: 'Updated' }) as never)
    expect((await updateStaffService('s1', { fullName: 'Updated' })).fullName).toBe('Updated')
  })
})

describe('deactivateStaff', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(null as never)
    await expect(deactivateStaff('x')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('sets status to inactive and returns success', async () => {
    vi.mocked(repo.findStaffById).mockResolvedValue(staffRow() as never)
    vi.mocked(repo.updateStaff).mockResolvedValue(staffRow({ status: 'inactive' }) as never)
    expect(await deactivateStaff('s1')).toEqual({ success: true })
    expect(repo.updateStaff).toHaveBeenCalledWith('s1', expect.objectContaining({ status: 'inactive' }))
  })
})
