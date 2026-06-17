import { Router } from 'express'
import { validate } from '../../middleware/validate.middleware'
import { createPatientHandler, getPatientByIdHandler, listPatientsHandler, removePatientHandler, updatePatientHandler } from './patients.controller'
import { patientCreateSchema, patientParamsSchema, patientQuerySchema, patientUpdateSchema } from './patients.schemas'

export const patientsRouter = Router()

patientsRouter.get('/', validate({ query: patientQuerySchema }), listPatientsHandler)
patientsRouter.post('/', validate({ body: patientCreateSchema }), createPatientHandler)
patientsRouter.get('/:id', validate({ params: patientParamsSchema }), getPatientByIdHandler)
patientsRouter.patch('/:id', validate({ params: patientParamsSchema, body: patientUpdateSchema }), updatePatientHandler)
patientsRouter.delete('/:id', validate({ params: patientParamsSchema }), removePatientHandler)
