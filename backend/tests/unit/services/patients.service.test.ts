import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/modules/patients/patients.repository', () => ({
  listPatients: vi.fn(),
  findPatientById: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
}))

import * as repo from '../../../src/modules/patients/patients.repository'
import {
  archivePatient,
  createPatientService,
  getPatientById,
  listPatientsService,
  updatePatientService,
} from '../../../src/modules/patients/patients.service'

const row = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'John',
  lastName: 'Doe',
  gender: 'male',
  dateOfBirth: null,
  phone: null,
  email: null,
  address: null,
  bloodType: null,
  allergiesJson: '[]',
  chronicConditionsJson: '[]',
  medicationsJson: '[]',
  smoker: false,
  medicalNotes: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  primaryDentistId: null,
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe('listPatientsService', () => {
  it('returns a paginated envelope with mapped rows', async () => {
    vi.mocked(repo.listPatients).mockResolvedValue({ total: 1, rows: [row()] } as never)
    const result = await listPatientsService({ page: 1, pageSize: 20 })
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
    expect(result.data[0].id).toBe('p1')
    expect('branchId' in result.data[0]).toBe(false)
  })
})

describe('getPatientById', () => {
  it('returns the mapped patient when found', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(row() as never)
    expect((await getPatientById('p1')).firstName).toBe('John')
  })

  it('throws 404 when not found', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(null as never)
    await expect(getPatientById('x')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('createPatientService', () => {
  it('serializes array fields to JSON and defaults status to active', async () => {
    vi.mocked(repo.createPatient).mockImplementation((async (data: unknown) => data) as never)
    const result = await createPatientService({
      firstName: 'Jane',
      lastName: 'Roe',
      gender: 'female',
      allergies: ['latex'],
    })
    expect(result.firstName).toBe('Jane')
    expect(result.allergies).toEqual(['latex'])
    expect(result.status).toBe('active')
  })

  it('coerces smoker to a boolean', async () => {
    vi.mocked(repo.createPatient).mockImplementation((async (data: unknown) => data) as never)
    const result = await createPatientService({ firstName: 'A', lastName: 'B', gender: 'male', smoker: true })
    expect(result.smoker).toBe(true)
  })
})

describe('updatePatientService', () => {
  it('throws 404 when the patient does not exist', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(null as never)
    await expect(updatePatientService('x', { firstName: 'New' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('updates and returns the mapped patient', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(row() as never)
    vi.mocked(repo.updatePatient).mockResolvedValue(row({ firstName: 'Updated' }) as never)
    const result = await updatePatientService('p1', { firstName: 'Updated' })
    expect(result.firstName).toBe('Updated')
  })
})

describe('archivePatient', () => {
  it('throws 404 when not found', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(null as never)
    await expect(archivePatient('x')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('sets status to archived and returns success', async () => {
    vi.mocked(repo.findPatientById).mockResolvedValue(row() as never)
    vi.mocked(repo.updatePatient).mockResolvedValue(row({ status: 'archived' }) as never)
    expect(await archivePatient('p1')).toEqual({ success: true })
    expect(repo.updatePatient).toHaveBeenCalledWith('p1', expect.objectContaining({ status: 'archived' }))
  })
})
