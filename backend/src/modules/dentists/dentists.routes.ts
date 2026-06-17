import { Router } from 'express'
import { createDentistHandler, getDentistByIdHandler, listDentistsHandler, removeDentistHandler, updateDentistHandler } from './dentists.controller'
import { validate } from '../../middleware/validate.middleware'
import { dentistCreateSchema, dentistParamsSchema, dentistQuerySchema, dentistUpdateSchema } from './dentists.schemas'

export const dentistsRouter = Router()

dentistsRouter.get('/', validate({ query: dentistQuerySchema }), listDentistsHandler)
dentistsRouter.post('/', validate({ body: dentistCreateSchema }), createDentistHandler)
dentistsRouter.get('/:id', validate({ params: dentistParamsSchema }), getDentistByIdHandler)
dentistsRouter.patch('/:id', validate({ params: dentistParamsSchema, body: dentistUpdateSchema }), updateDentistHandler)
dentistsRouter.delete('/:id', validate({ params: dentistParamsSchema }), removeDentistHandler)
