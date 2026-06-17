import type { AppointmentModel } from './appointments.model'

export const toAppointment = (row: AppointmentModel) => ({
  id: row.id,
  patientId: row.patientId,
  dentistId: row.dentistId,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  status: row.status,
  type: row.type,
  room: row.room,
  reason: row.reason,
  notes: row.notes,
  cancellationReason: row.cancellationReason,
  outcome: row.outcome,
  fee: row.fee,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
