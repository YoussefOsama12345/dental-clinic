import { lazy, Suspense } from 'react'
import { createHashRouter } from 'react-router'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { OnboardingLayout } from '@/features/onboarding/components/OnboardingLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { NotFoundPage } from '@/components/common/NotFoundPage'
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary'
import { PageTransition } from '@/transitions'

// Onboarding pages
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const WelcomePage = lazy(() => import('@/features/onboarding/pages/WelcomePage').then(m => ({ default: m.WelcomePage })))
const IdentityStep = lazy(() => import('@/features/onboarding/components/steps/IdentityStep').then(m => ({ default: m.IdentityStep })))
const SetupStep = lazy(() => import('@/features/onboarding/components/steps/SetupStep').then(m => ({ default: m.SetupStep })))
const SpecialtyStep = lazy(() => import('@/features/onboarding/components/steps/SpecialtyStep').then(m => ({ default: m.SpecialtyStep })))
const WorkingHoursStep = lazy(() => import('@/features/onboarding/components/steps/WorkingHoursStep').then(m => ({ default: m.WorkingHoursStep })))
const PlansStep = lazy(() => import('@/features/onboarding/components/steps/PlansStep').then(m => ({ default: m.PlansStep })))

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const VerifyOtpPage = lazy(() => import('@/features/auth/pages/VerifyOtpPage').then(m => ({ default: m.VerifyOtpPage })))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const ResetSuccessPage = lazy(() => import('@/features/auth/pages/ResetSuccessPage').then(m => ({ default: m.ResetSuccessPage })))

// Dashboard pages — MVP
const PatientsPage = lazy(() => import('@/features/patients/pages/PatientsPage').then(m => ({ default: m.PatientsPage })))
const PatientFormPage = lazy(() => import('@/features/patients/pages/PatientFormPage').then(m => ({ default: m.PatientFormPage })))
const PatientProfilePage = lazy(() => import('@/features/patients/pages/PatientProfilePage').then(m => ({ default: m.PatientProfilePage })))
const AppointmentsPage = lazy(() => import('@/features/appointments/pages/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const AppointmentFormPage = lazy(() => import('@/features/appointments/pages/AppointmentFormPage').then(m => ({ default: m.AppointmentFormPage })))
const AppointmentProfilePage = lazy(() => import('@/features/appointments/pages/AppointmentProfilePage').then(m => ({ default: m.AppointmentProfilePage })))
const DentistsPage = lazy(() => import('@/features/dentists/pages/DentistsPage').then(m => ({ default: m.DentistsPage })))
const DentistFormPage = lazy(() => import('@/features/dentists/pages/DentistFormPage').then(m => ({ default: m.DentistFormPage })))
const DentistProfilePage = lazy(() => import('@/features/dentists/pages/DentistProfilePage').then(m => ({ default: m.DentistProfilePage })))
const StaffPage = lazy(() => import('@/features/staff/pages/StaffPage').then(m => ({ default: m.StaffPage })))
const StaffFormPage = lazy(() => import('@/features/staff/pages/StaffFormPage').then(m => ({ default: m.StaffFormPage })))
const StaffProfilePage = lazy(() => import('@/features/staff/pages/StaffProfilePage').then(m => ({ default: m.StaffProfilePage })))

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#04CF9E]/20 border-t-[#04CF9E] animate-spin" />
      </div>
    }>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  )
}

export const router = createHashRouter([
  // Onboarding welcome (standalone, no sidebar)
  { path: '/onboarding/welcome', errorElement: <RouteErrorBoundary />, element: <PageSuspense><WelcomePage /></PageSuspense> },

  // Onboarding flow (with sidebar layout)
  {
    element: <OnboardingLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/onboarding', element: <PageSuspense><OnboardingPage /></PageSuspense> },
      { path: '/onboarding/identity', element: <PageSuspense><IdentityStep /></PageSuspense> },
      { path: '/onboarding/setup', element: <PageSuspense><SetupStep /></PageSuspense> },
      { path: '/onboarding/specialty', element: <PageSuspense><SpecialtyStep /></PageSuspense> },
      { path: '/onboarding/working-hours', element: <PageSuspense><WorkingHoursStep /></PageSuspense> },
      { path: '/onboarding/plans', element: <PageSuspense><PlansStep /></PageSuspense> },
    ],
  },

  // Auth (public)
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/login', element: <PageSuspense><LoginPage /></PageSuspense> },
      { path: '/register', element: <PageSuspense><RegisterPage /></PageSuspense> },
      { path: '/forgot-password', element: <PageSuspense><ForgotPasswordPage /></PageSuspense> },
      { path: '/verify-otp', element: <PageSuspense><VerifyOtpPage /></PageSuspense> },
      { path: '/reset-password', element: <PageSuspense><ResetPasswordPage /></PageSuspense> },
      { path: '/reset-success', element: <PageSuspense><ResetSuccessPage /></PageSuspense> },
    ],
  },

  // Dashboard (protected) — MVP surface only
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <PageSuspense><PatientsPage /></PageSuspense> },
          { path: '/patients', element: <PageSuspense><PatientsPage /></PageSuspense> },
          { path: '/patients/new', element: <PageSuspense><PatientFormPage /></PageSuspense> },
          { path: '/patients/:id', element: <PageSuspense><PatientProfilePage /></PageSuspense> },
          { path: '/patients/:id/edit', element: <PageSuspense><PatientFormPage /></PageSuspense> },
          { path: '/appointments', element: <PageSuspense><AppointmentsPage /></PageSuspense> },
          { path: '/appointments/new', element: <PageSuspense><AppointmentFormPage /></PageSuspense> },
          { path: '/appointments/:id', element: <PageSuspense><AppointmentProfilePage /></PageSuspense> },
          { path: '/appointments/:id/edit', element: <PageSuspense><AppointmentFormPage /></PageSuspense> },
          { path: '/dentists', element: <PageSuspense><DentistsPage /></PageSuspense> },
          { path: '/dentists/new', element: <PageSuspense><DentistFormPage /></PageSuspense> },
          { path: '/dentists/:id', element: <PageSuspense><DentistProfilePage /></PageSuspense> },
          { path: '/dentists/:id/edit', element: <PageSuspense><DentistFormPage /></PageSuspense> },
          { path: '/staff', element: <PageSuspense><StaffPage /></PageSuspense> },
          { path: '/staff/new', element: <PageSuspense><StaffFormPage /></PageSuspense> },
          { path: '/staff/:id', element: <PageSuspense><StaffProfilePage /></PageSuspense> },
          { path: '/staff/:id/edit', element: <PageSuspense><StaffFormPage /></PageSuspense> },
        ],
      },
    ],
  },

  // Catch-all → 404
  { path: '*', errorElement: <RouteErrorBoundary />, element: <PageSuspense><NotFoundPage /></PageSuspense> },
])
