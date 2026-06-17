import { Router } from 'express'
import { validate } from '../../middleware/validate.middleware'
import { checkAvailabilityHandler, createAppointmentHandler, getAppointmentByIdHandler, listAppointmentsHandler, removeAppointmentHandler, updateAppointmentHandler } from './appointments.controller'
import { appointmentCreateSchema, appointmentParamsSchema, appointmentQuerySchema, appointmentUpdateSchema, availabilityQuerySchema } from './appointments.schemas'

export const appointmentsRouter = Router()

appointmentsRouter.get('/', validate({ query: appointmentQuerySchema }), listAppointmentsHandler)
appointmentsRouter.get('/availability', validate({ query: availabilityQuerySchema }), checkAvailabilityHandler)
appointmentsRouter.post('/', validate({ body: appointmentCreateSchema }), createAppointmentHandler)
appointmentsRouter.get('/:id', validate({ params: appointmentParamsSchema }), getAppointmentByIdHandler)
appointmentsRouter.patch('/:id', validate({ params: appointmentParamsSchema, body: appointmentUpdateSchema }), updateAppointmentHandler)
appointmentsRouter.delete('/:id', validate({ params: appointmentParamsSchema }), removeAppointmentHandler)
