import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { parsePage, parsePageSize } from '../../utils/pagination'
import { archivePatient, createPatientService, getPatientById, listPatientsService, updatePatientService } from './patients.service'

export const listPatientsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listPatientsService(req.auth!.sub, {
    page: parsePage(req.query.page),
    pageSize: parsePageSize(req.query.pageSize),
    search: req.query.search ? String(req.query.search) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    dentistId: req.query.dentistId ? String(req.query.dentistId) : undefined,
  }))
})

export const getPatientByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getPatientById(req.auth!.sub, String(req.params.id)))
})

export const createPatientHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createPatientService(req.auth!.sub, req.body))
})

export const updatePatientHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await updatePatientService(req.auth!.sub, String(req.params.id), req.body))
})

export const removePatientHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await archivePatient(req.auth!.sub, String(req.params.id)))
})
