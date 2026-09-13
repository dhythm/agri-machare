'use client'

import { validateTransportJob } from '@/lib/validation/transport'
import { useSubmissionForm } from './use-submission-form'
import { FormAlert, TextField } from './fields'
import { ReceiptPanel } from './receipt'
import type { FormContact } from './contact'
import { SubmitButton } from './submit-button'

export function TransportJobForm({ contact }: { contact?: FormContact }) {
  const form = useSubmissionForm({
    url: '/api/transport/jobs',
    validate: validateTransportJob,
    initialValues: {
      item: '',
      from: '',
      to: '',
      distanceKm: '',
      weight: '',
      desiredDate: '',
      reward: '',
      contactEmail: contact?.email ?? '',
    },
  })

  if (form.receipt) {
    return (
      <ReceiptPanel
        receipt={form.receipt}
        title="運搬の依頼"
        description="審査後に案件ボードへ掲載します。"
        links={[{ href: '/transport', label: '案件ボードにもどる' }]}
      />
    )
  }

  return (
    <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
      <FormAlert error={form.failed ? '送信できませんでした。' : undefined} />
      <TextField
        id="item"
        label="運ぶもの"
        placeholder="例: トラクター 45馬力"
        value={form.values.item}
        onChange={(e) => form.setValue('item', e.target.value)}
        error={form.errors.item}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="from"
          label="出発地"
          placeholder="例: 新潟県 長岡市"
          value={form.values.from}
          onChange={(e) => form.setValue('from', e.target.value)}
          error={form.errors.from}
        />
        <TextField
          id="to"
          label="届け先"
          placeholder="例: 新潟県 上越市"
          value={form.values.to}
          onChange={(e) => form.setValue('to', e.target.value)}
          error={form.errors.to}
        />
        <TextField
          id="distanceKm"
          label="距離（km）"
          inputMode="numeric"
          value={form.values.distanceKm}
          onChange={(e) => form.setValue('distanceKm', e.target.value)}
          error={form.errors.distanceKm}
        />
        <TextField
          id="weight"
          label="重量"
          placeholder="例: 約1.8t"
          value={form.values.weight}
          onChange={(e) => form.setValue('weight', e.target.value)}
          error={form.errors.weight}
        />
        <TextField
          id="desiredDate"
          label="希望日"
          placeholder="例: 10/3 終日、相談"
          value={form.values.desiredDate}
          onChange={(e) => form.setValue('desiredDate', e.target.value)}
          error={form.errors.desiredDate}
        />
        <TextField
          id="reward"
          label="報酬（円）"
          inputMode="numeric"
          value={form.values.reward}
          onChange={(e) => form.setValue('reward', e.target.value)}
          error={form.errors.reward}
        />
      </div>
      <TextField
        id="contactEmail"
        label="メールアドレス"
        type="email"
        value={form.values.contactEmail}
        onChange={(e) => form.setValue('contactEmail', e.target.value)}
        error={form.errors.contactEmail}
      />
      <div>
        <SubmitButton label="運搬を依頼する" isSubmitting={form.isSubmitting} />
      </div>
    </form>
  )
}
