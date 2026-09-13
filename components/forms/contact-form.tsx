'use client'

import { contactTopics, validateContact } from '@/lib/validation/contact'
import { useSubmissionForm } from './use-submission-form'
import { FormAlert, SelectField, TextField, TextareaField } from './fields'
import { ReceiptPanel } from './receipt'
import { SubmitButton } from './submit-button'

export function ContactForm() {
  const form = useSubmissionForm({
    url: '/api/contact',
    validate: validateContact,
    initialValues: { name: '', email: '', topic: '', message: '' },
  })

  if (form.receipt) {
    return (
      <ReceiptPanel
        receipt={form.receipt}
        title="お問い合わせ"
        description="内容を確認のうえ、ご登録のメールアドレスへ返信します。"
        links={[
          { href: '/', label: 'トップへもどる' },
          { href: '/faq', label: 'よくある質問を見る' },
        ]}
      />
    )
  }

  return (
    <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
      <FormAlert error={form.failed ? '送信できませんでした。' : undefined} />
      <TextField
        id="name"
        label="お名前"
        value={form.values.name}
        onChange={(e) => form.setValue('name', e.target.value)}
        error={form.errors.name}
      />
      <TextField
        id="email"
        label="メールアドレス"
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue('email', e.target.value)}
        error={form.errors.email}
      />
      <SelectField
        id="topic"
        label="お問い合わせ種別"
        options={contactTopics}
        value={form.values.topic}
        onChange={(e) => form.setValue('topic', e.target.value)}
        error={form.errors.topic}
      />
      <TextareaField
        id="message"
        label="お問い合わせ内容"
        value={form.values.message}
        onChange={(e) => form.setValue('message', e.target.value)}
        error={form.errors.message}
      />
      <div>
        <SubmitButton label="送信する" isSubmitting={form.isSubmitting} />
      </div>
    </form>
  )
}
