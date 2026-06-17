import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { createStaffService, deactivateStaff, getStaffById, listRoster, listStaffService, updateStaffService } from './staff.service'

export const listStaffHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listStaffService(req.auth!.sub, {
    search: req.query.search ? String(req.query.search) : undefined,
    role: req.query.role ? String(req.query.role) : undefined,
    active: req.query.active ? String(req.query.active) : undefined,
  }))
})

export const listRosterHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listRoster(req.auth!.sub, {
    search: req.query.search ? String(req.query.search) : undefined,
    role: req.query.role ? String(req.query.role) : undefined,
  }))
})

export const getStaffByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getStaffById(req.auth!.sub, String(req.params.id)))
})

export const createStaffHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createStaffService(req.auth!.sub, req.body))
})

export const updateStaffHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateStaffService(req.auth!.sub, String(req.params.id), req.body))
})

export const removeStaffHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await deactivateStaff(req.auth!.sub, String(req.params.id)))
})
