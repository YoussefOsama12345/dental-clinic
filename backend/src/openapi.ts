import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { appointmentCreateSchema, appointmentParamsSchema, appointmentQuerySchema, appointmentUpdateSchema, availabilityQuerySchema } from './modules/appointments/appointments.schemas'
import { forgotPasswordSchema, loginSchema, registerSchema, resendVerificationSchema, resetPasswordSchema, verifyEmailSchema, verifyResetCodeSchema } from './modules/auth/auth.schemas'
import { dentistCreateSchema, dentistParamsSchema, dentistQuerySchema, dentistUpdateSchema } from './modules/dentists/dentists.schemas'
import { patientCreateSchema, patientParamsSchema, patientQuerySchema, patientUpdateSchema } from './modules/patients/patients.schemas'
import { staffCreateSchema, staffParamsSchema, staffQuerySchema, staffUpdateSchema } from './modules/staff/staff.schemas'

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Supabase/GoTrue JWT access token.',
})

const errorSchema = registry.register('ErrorResponse', z.object({
  code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
  message: z.string().openapi({ example: 'Request validation failed.' }),
  requestId: z.string().optional().openapi({ example: '7a6b0f41-6e7b-4b8d-9f5c-8f3a2fd8f137' }),
  details: z.unknown().optional(),
}))

const successSchema = registry.register('SuccessResponse', z.object({ success: z.boolean().openapi({ example: true }) }))

const authUserSchema = registry.register('AuthUser', z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
}))
const authResponseSchema = registry.register('AuthResponse', z.object({
  user: authUserSchema,
  token: z.string(),
}))
const authFlowResponseSchema = registry.register('AuthFlowResponse', z.object({
  success: z.boolean(),
  email: z.string().email().optional(),
  debugCode: z.string().optional(),
}))

const patientSchema = registry.register('Patient', patientCreateSchema.extend({
  id: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}))
const paginatedPatientsSchema = registry.register('PaginatedPatients', z.object({
  data: z.array(patientSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
}))

const dentistSchema = registry.register('Dentist', dentistCreateSchema.extend({
  id: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  qualifications: z.array(z.string()).default([]),
  workingDays: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}))

const staffSchema = registry.register('Staff', staffCreateSchema.extend({
  id: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}))

const rosterMemberSchema = registry.register('RosterMember', z.object({
  id: z.string().uuid(),
  kind: z.enum(['dentist', 'staff']),
  fullName: z.string(),
  role: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: z.string(),
}))

const appointmentSchema = registry.register('Appointment', appointmentCreateSchema.extend({
  id: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}))
const availabilityResponseSchema = registry.register('AvailabilityResponse', z.object({
  available: z.boolean(),
  conflictId: z.string().uuid().nullable(),
}))

function jsonResponse(description: string, schema: z.ZodTypeAny) {
  return {
    description,
    content: { 'application/json': { schema } },
  }
}

const commonErrors = {
  400: jsonResponse('Bad request / validation error', errorSchema),
  401: jsonResponse('Unauthorized', errorSchema),
  404: jsonResponse('Not found', errorSchema),
  409: jsonResponse('Conflict', errorSchema),
  429: jsonResponse('Rate limited', errorSchema),
  500: jsonResponse('Internal server error', errorSchema),
}

type PathOptions = Omit<Parameters<typeof registry.registerPath>[0], 'method' | 'path' | 'summary' | 'security'>

function authPath(method: 'get' | 'post' | 'patch' | 'delete', path: string, summary: string, options: PathOptions) {
  registry.registerPath({
    method,
    path,
    summary,
    tags: options.tags,
    request: options.request,
    responses: options.responses,
  })
}

function protectedPath(method: 'get' | 'post' | 'patch' | 'delete', path: string, summary: string, options: PathOptions) {
  registry.registerPath({
    method,
    path,
    summary,
    tags: options.tags,
    security: [{ bearerAuth: [] }],
    request: options.request,
    responses: options.responses,
  })
}

// Health
authPath('get', '/api/health', 'Service health check', {
  tags: ['Health'],
  responses: { 200: jsonResponse('Backend status', z.object({ ok: z.boolean(), authMode: z.string() })) },
})

// Auth
authPath('post', '/api/auth/login', 'Sign in with email and password', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: loginSchema } } } }, responses: { 200: jsonResponse('Authenticated user and token', authResponseSchema), ...commonErrors } })
authPath('post', '/api/auth/register', 'Create account and send email verification OTP', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: registerSchema } } } }, responses: { 201: jsonResponse('Registration started', authFlowResponseSchema), ...commonErrors } })
authPath('post', '/api/auth/resend-verification', 'Resend email verification OTP', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: resendVerificationSchema } } } }, responses: { 200: jsonResponse('OTP sent if eligible', authFlowResponseSchema), ...commonErrors } })
authPath('post', '/api/auth/verify-email', 'Verify account email using OTP', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: verifyEmailSchema } } } }, responses: { 200: jsonResponse('Email verified', successSchema), ...commonErrors } })
authPath('post', '/api/auth/forgot-password', 'Request password reset OTP', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: forgotPasswordSchema } } } }, responses: { 200: jsonResponse('Reset OTP sent if account exists', authFlowResponseSchema), ...commonErrors } })
authPath('post', '/api/auth/verify-reset-code', 'Verify password reset OTP before reset', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: verifyResetCodeSchema } } } }, responses: { 200: jsonResponse('Reset OTP valid', successSchema), ...commonErrors } })
authPath('post', '/api/auth/reset-password', 'Reset password using OTP', { tags: ['Auth'], request: { body: { content: { 'application/json': { schema: resetPasswordSchema } } } }, responses: { 200: jsonResponse('Password reset', successSchema), ...commonErrors } })
protectedPath('get', '/api/auth/me', 'Get current authenticated user', { tags: ['Auth'], responses: { 200: jsonResponse('Current user', authUserSchema), ...commonErrors } })

// Patients
protectedPath('get', '/api/patients', 'List patients for current clinic', { tags: ['Patients'], request: { query: patientQuerySchema }, responses: { 200: jsonResponse('Paginated patients', paginatedPatientsSchema), ...commonErrors } })
protectedPath('post', '/api/patients', 'Create patient', { tags: ['Patients'], request: { body: { content: { 'application/json': { schema: patientCreateSchema } } } }, responses: { 201: jsonResponse('Created patient', patientSchema), ...commonErrors } })
protectedPath('get', '/api/patients/{id}', 'Get patient by id', { tags: ['Patients'], request: { params: patientParamsSchema }, responses: { 200: jsonResponse('Patient', patientSchema), ...commonErrors } })
protectedPath('patch', '/api/patients/{id}', 'Update patient', { tags: ['Patients'], request: { params: patientParamsSchema, body: { content: { 'application/json': { schema: patientUpdateSchema } } } }, responses: { 200: jsonResponse('Updated patient', patientSchema), ...commonErrors } })
protectedPath('delete', '/api/patients/{id}', 'Archive patient', { tags: ['Patients'], request: { params: patientParamsSchema }, responses: { 200: jsonResponse('Archived patient', successSchema), ...commonErrors } })

// Dentists
protectedPath('get', '/api/dentists', 'List dentists for current clinic', { tags: ['Dentists'], request: { query: dentistQuerySchema }, responses: { 200: jsonResponse('Dentists', z.array(dentistSchema)), ...commonErrors } })
protectedPath('post', '/api/dentists', 'Create dentist', { tags: ['Dentists'], request: { body: { content: { 'application/json': { schema: dentistCreateSchema } } } }, responses: { 201: jsonResponse('Created dentist', dentistSchema), ...commonErrors } })
protectedPath('get', '/api/dentists/{id}', 'Get dentist by id', { tags: ['Dentists'], request: { params: dentistParamsSchema }, responses: { 200: jsonResponse('Dentist', dentistSchema), ...commonErrors } })
protectedPath('patch', '/api/dentists/{id}', 'Update dentist', { tags: ['Dentists'], request: { params: dentistParamsSchema, body: { content: { 'application/json': { schema: dentistUpdateSchema } } } }, responses: { 200: jsonResponse('Updated dentist', dentistSchema), ...commonErrors } })
protectedPath('delete', '/api/dentists/{id}', 'Deactivate dentist', { tags: ['Dentists'], request: { params: dentistParamsSchema }, responses: { 200: jsonResponse('Deactivated dentist', successSchema), ...commonErrors } })

// Staff
protectedPath('get', '/api/staff', 'List staff for current clinic', { tags: ['Staff'], request: { query: staffQuerySchema }, responses: { 200: jsonResponse('Staff', z.array(staffSchema)), ...commonErrors } })
protectedPath('get', '/api/staff/roster', 'List roster combining dentists and staff', { tags: ['Staff'], request: { query: staffQuerySchema }, responses: { 200: jsonResponse('Roster', z.array(rosterMemberSchema)), ...commonErrors } })
protectedPath('post', '/api/staff', 'Create staff member', { tags: ['Staff'], request: { body: { content: { 'application/json': { schema: staffCreateSchema } } } }, responses: { 201: jsonResponse('Created staff member', staffSchema), ...commonErrors } })
protectedPath('get', '/api/staff/{id}', 'Get staff member by id', { tags: ['Staff'], request: { params: staffParamsSchema }, responses: { 200: jsonResponse('Staff member', staffSchema), ...commonErrors } })
protectedPath('patch', '/api/staff/{id}', 'Update staff member', { tags: ['Staff'], request: { params: staffParamsSchema, body: { content: { 'application/json': { schema: staffUpdateSchema } } } }, responses: { 200: jsonResponse('Updated staff member', staffSchema), ...commonErrors } })
protectedPath('delete', '/api/staff/{id}', 'Deactivate staff member', { tags: ['Staff'], request: { params: staffParamsSchema }, responses: { 200: jsonResponse('Deactivated staff member', successSchema), ...commonErrors } })

// Appointments
protectedPath('get', '/api/appointments', 'List appointments for current clinic', { tags: ['Appointments'], request: { query: appointmentQuerySchema }, responses: { 200: jsonResponse('Appointments', z.array(appointmentSchema)), ...commonErrors } })
protectedPath('get', '/api/appointments/availability', 'Check dentist availability for a time range', { tags: ['Appointments'], request: { query: availabilityQuerySchema }, responses: { 200: jsonResponse('Availability', availabilityResponseSchema), ...commonErrors } })
protectedPath('post', '/api/appointments', 'Create appointment', { tags: ['Appointments'], request: { body: { content: { 'application/json': { schema: appointmentCreateSchema } } } }, responses: { 201: jsonResponse('Created appointment', appointmentSchema), ...commonErrors } })
protectedPath('get', '/api/appointments/{id}', 'Get appointment by id', { tags: ['Appointments'], request: { params: appointmentParamsSchema }, responses: { 200: jsonResponse('Appointment', appointmentSchema), ...commonErrors } })
protectedPath('patch', '/api/appointments/{id}', 'Update appointment', { tags: ['Appointments'], request: { params: appointmentParamsSchema, body: { content: { 'application/json': { schema: appointmentUpdateSchema } } } }, responses: { 200: jsonResponse('Updated appointment', appointmentSchema), ...commonErrors } })
protectedPath('delete', '/api/appointments/{id}', 'Cancel appointment', { tags: ['Appointments'], request: { params: appointmentParamsSchema }, responses: { 200: jsonResponse('Cancelled appointment', successSchema), ...commonErrors } })

export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'dentAI Clinic Management API',
      version: '1.0.0',
      description: 'Tenant-scoped clinic management REST API for patients, dentists, staff, appointments, and authentication.',
    },
    servers: [{ url: 'http://localhost:4001', description: 'Local development' }],
    tags: [
      { name: 'Health', description: 'Service health endpoints' },
      { name: 'Auth', description: 'Authentication and account verification' },
      { name: 'Patients', description: 'Patient records' },
      { name: 'Dentists', description: 'Dentist profiles' },
      { name: 'Staff', description: 'Staff members and roster' },
      { name: 'Appointments', description: 'Appointment scheduling' },
    ],
  })
}
