import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { cancelAppointment, checkAppointmentAvailability, createAppointmentService, getAppointmentById, listAppointmentsService, updateAppointmentService } from './appointments.service'

export const listAppointmentsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listAppointmentsService(req.auth!.sub, {
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    dentistId: req.query.dentistId ? String(req.query.dentistId) : undefined,
    patientId: req.query.patientId ? String(req.query.patientId) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
  }))
})

export const checkAvailabilityHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await checkAppointmentAvailability(
    req.auth!.sub,
    String(req.query.dentistId),
    String(req.query.from),
    String(req.query.to),
    req.query.excludeAppointmentId ? String(req.query.excludeAppointmentId) : undefined,
  ))
})

export const getAppointmentByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getAppointmentById(req.auth!.sub, String(req.params.id)))
})

export const createAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createAppointmentService(req.auth!.sub, req.body))
})

export const updateAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateAppointmentService(req.auth!.sub, String(req.params.id), req.body))
})

export const removeAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await cancelAppointment(req.auth!.sub, String(req.params.id)))
})
