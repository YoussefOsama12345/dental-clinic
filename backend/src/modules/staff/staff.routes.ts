import { Router } from 'express'
import { validate } from '../../middleware/validate.middleware'
import { createStaffHandler, getStaffByIdHandler, listRosterHandler, listStaffHandler, removeStaffHandler, updateStaffHandler } from './staff.controller'
import { staffCreateSchema, staffParamsSchema, staffQuerySchema, staffUpdateSchema } from './staff.schemas'

export const staffRouter = Router()

staffRouter.get('/', validate({ query: staffQuerySchema }), listStaffHandler)
staffRouter.get('/roster', validate({ query: staffQuerySchema }), listRosterHandler)
staffRouter.post('/', validate({ body: staffCreateSchema }), createStaffHandler)
staffRouter.get('/:id', validate({ params: staffParamsSchema }), getStaffByIdHandler)
staffRouter.patch('/:id', validate({ params: staffParamsSchema, body: staffUpdateSchema }), updateStaffHandler)
staffRouter.delete('/:id', validate({ params: staffParamsSchema }), removeStaffHandler)
