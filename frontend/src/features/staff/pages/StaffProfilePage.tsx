import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ArrowLeft, Activity, CalendarDays, FileText, KeyRound, Mail, Pencil, Phone, ShieldCheck, UserCog, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill } from '@/components/ui/pill'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { InfoRow } from '@/components/ui/info-row'
import { initialsOf } from '@/components/ui/person-cell'
import { ProfileStats } from '@/components/ui/profile-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStaffMember } from '../hooks/staff.hook'

const ROLE_PERMISSION_KEYS: Record<string, string[]> = {
  reception: ['manageAppointments', 'registerPatients', 'viewPatientContact', 'exportSchedules'],
  nurse: ['viewAppointments', 'prepareClinicalNotes', 'updateVisitStatus'],
  assistant: ['assistDentistWorkflow', 'viewDailySchedule', 'prepareTreatmentRoom'],
  manager: ['manageStaff', 'viewOperationalReports', 'manageClinicSettings'],
  accountant: ['manageInvoices', 'recordPayments', 'exportFinancialReports'],
  other: ['viewAssignedWorkQueue'],
}

export function StaffProfilePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? ar : undefined
  const { data: member, isLoading } = useStaffMember(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!member) {
    return (
      <EmptyState
        icon={Users}
        title={t('staff.notFound')}
        description={t('staff.notFoundDesc')}
        className="py-24"
        action={<Link to="/staff" className="text-sm font-semibold text-[#04CF9E]">{t('staff.backToList')}</Link>}
      />
    )
  }

  const roleLabel = t(`staff.roleOption.${member.role}`, String(member.role))
  const statusLabel = t(`staff.empStatus.${member.status}`, String(member.status))
  const permissions = ROLE_PERMISSION_KEYS[member.role] ?? ROLE_PERMISSION_KEYS.other
  const facts = [roleLabel, member.phone].filter(Boolean).join('  ·  ')

  return (
    <div className="space-y-6">
      <Link to="/staff" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('staff.backToList')}
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold" style={{ backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' }}>
              {initialsOf(member.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{member.fullName}</h1>
                <Pill tone="teal" dot={false}>{roleLabel}</Pill>
                <Pill tone={member.status === 'active' ? 'teal' : 'muted'}>{statusLabel}</Pill>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{facts}</p>
            </div>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-[12px] bg-[#04CF9E] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#03b589] hover:shadow-md">
            <Link to={`/staff/${member.id}/edit`}>
              <Pencil className="me-2 h-4 w-4" />
              {t('common.edit')}
            </Link>
          </Button>
        </div>
        <ProfileStats
          items={[
            { label: t('staff.role'), value: roleLabel },
            { label: t('staff.status'), value: statusLabel },
            { label: t('staff.permissions'), value: permissions.length },
          ]}
        />
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('staff.tab.schedule')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('staff.tab.permissions')}</TabsTrigger>
          <TabsTrigger value="documents">{t('staff.tab.documents')}</TabsTrigger>
          <TabsTrigger value="activity">{t('common.activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCog className="h-4 w-4 text-[#04CF9E]" />{t('staff.workInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={UserCog} label={t('staff.role')} value={roleLabel} />
              <InfoRow icon={Activity} label={t('staff.status')} value={statusLabel} />
              <InfoRow icon={ShieldCheck} label={t('staff.accessLevel')} value={member.status === 'active' ? t('staff.accessEnabled') : t('staff.accessLimited')} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#04CF9E]" />{t('staff.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Phone} label={t('staff.phone')} value={member.phone} />
              <InfoRow icon={Mail} label={t('staff.email')} value={member.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>{t('staff.workingDays')}</CardTitle></CardHeader><CardContent className="pt-0 text-sm text-muted-foreground">{member.workingDays?.length ? member.workingDays.join(', ') : t('staff.defaultWorkingDays')}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t('staff.shift')}</CardTitle></CardHeader><CardContent className="pt-0 text-sm text-muted-foreground">{member.workStart && member.workEnd ? `${member.workStart} – ${member.workEnd}` : '—'}</CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#04CF9E]" />{t('staff.availability')}</CardTitle></CardHeader><CardContent className="pt-0"><Pill tone={member.status === 'active' ? 'teal' : 'muted'}>{statusLabel}</Pill></CardContent></Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#04CF9E]" />{t('staff.permissions')}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 pt-0 md:grid-cols-2">
              {permissions.map((permission) => (
                <div key={permission} className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground">
                  {t(`staff.permission.${permission}`)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#04CF9E]" />{t('staff.documents')}</CardTitle></CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{t('staff.documentsPlaceholder')}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('staff.compliance')}</CardTitle></CardHeader>
            <CardContent className="pt-0"><Pill tone="teal">{t('staff.profileComplete')}</Pill></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>{t('common.activity')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
              <p>{t('common.created')}: {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true, locale })}</p>
              <p>{t('common.updated')}: {formatDistanceToNow(new Date(member.updatedAt), { addSuffix: true, locale })}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
