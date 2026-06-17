import { PAGINATION } from '../constants/app.constants'

export const parsePage = (value: unknown): number => {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : PAGINATION.defaultPage
}

export const parsePageSize = (value: unknown): number => {
  const pageSize = Number(value)
  if (!Number.isFinite(pageSize) || pageSize <= 0) return PAGINATION.defaultPageSize
  return Math.min(Math.floor(pageSize), PAGINATION.maxPageSize)
}
