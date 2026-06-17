import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { createDentistService, deactivateDentist, getDentistById, listDentistsService, updateDentistService } from './dentists.service'

export const listDentistsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listDentistsService(req.auth!.sub, {
    search: req.query.search ? String(req.query.search) : undefined,
    specialty: req.query.specialty ? String(req.query.specialty) : undefined,
    active: req.query.active ? String(req.query.active) : undefined,
  }))
})

export const getDentistByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getDentistById(req.auth!.sub, String(req.params.id)))
})

export const createDentistHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createDentistService(req.auth!.sub, req.body))
})

export const updateDentistHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateDentistService(req.auth!.sub, String(req.params.id), req.body))
})

export const removeDentistHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await deactivateDentist(req.auth!.sub, String(req.params.id)))
})
