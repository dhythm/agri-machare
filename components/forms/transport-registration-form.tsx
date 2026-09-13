'use client'

import {
  carrierKinds,
  validateTransportRegistration,
  vehicleTypes,
} from '@/lib/validation/transport'
import { useSubmissionForm } from './use-submission-form'
import { FormAlert, SelectField, TextField, TextareaField } from './fields'
import { ReceiptPanel } from './receipt'
import { SubmitButton } from './submit-button'

export function TransportRegistrationForm() {
  const form = useSubmissionForm({
    url: '/api/transport/registrations',
    validate: validateTransportRegistration,
    initialValues: {
      name: '',
      kind: '',
      prefecture: '',
      vehicle: '',
      email: '',
      note: '',
    },
  })

  if (form.receipt) {
    return (
      <ReceiptPanel
        receipt={form.receipt}
        title="運搬者登録"
        description="登録内容を確認のうえ、募集中の案件をメールでご案内します。"
        links={[
          { href: '/transport', label: '運搬案件を見る' },
          { href: '/transport/pricing', label: '料金のめやすを見る' },
        ]}
      />
    )
  }

  return (
    <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
      <FormAlert error={form.failed ? '送信できませんでした。' : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="name"
          label="お名前・屋号"
          value={form.values.name}
          onChange={(e) => form.setValue('name', e.target.value)}
          error={form.errors.name}
        />
        <SelectField
          id="kind"
          label="区分"
          options={carrierKinds}
          value={form.values.kind}
          onChange={(e) => form.setValue('kind', e.target.value)}
          error={form.errors.kind}
        />
        <TextField
          id="prefecture"
          label="拠点の都道府県"
          value={form.values.prefecture}
          onChange={(e) => form.setValue('prefecture', e.target.value)}
          error={form.errors.prefecture}
        />
        <SelectField
          id="vehicle"
          label="車両"
          options={vehicleTypes}
          value={form.values.vehicle}
          onChange={(e) => form.setValue('vehicle', e.target.value)}
          error={form.errors.vehicle}
        />
      </div>
      <TextField
        id="email"
        label="メールアドレス"
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue('email', e.target.value)}
        error={form.errors.email}
      />
      <TextareaField
        id="note"
        label="補足"
        placeholder="対応できる曜日・地域、保有資格など"
        value={form.values.note}
        onChange={(e) => form.setValue('note', e.target.value)}
        error={form.errors.note}
      />
      <div>
        <SubmitButton label="登録する" isSubmitting={form.isSubmitting} />
      </div>
    </form>
  )
}
