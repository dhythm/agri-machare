'use client'

import {
  listingCategories,
  listingConditions,
  sellerKinds,
  validateListingSubmission,
} from '@/lib/validation/listing-submission'
import { useSubmissionForm } from './use-submission-form'
import {
  CheckboxField,
  FormAlert,
  SelectField,
  TextField,
  TextareaField,
} from './fields'
import { ReceiptPanel } from './receipt'
import { SubmitButton } from './submit-button'

type Deal = 'sale' | 'rent'

export function ListingForm() {
  const form = useSubmissionForm({
    url: '/api/listings',
    validate: validateListingSubmission,
    initialValues: {
      name: '',
      category: '',
      maker: '',
      year: '',
      hours: '',
      condition: '',
      prefecture: '',
      city: '',
      deals: ['sale', 'rent'] as Deal[],
      salePrice: '',
      rentPerDay: '',
      rentToOwn: false,
      summary: '',
      sellerName: '',
      sellerKind: '',
      contactEmail: '',
    },
  })
  const canSell = form.values.deals.includes('sale')
  const canRent = form.values.deals.includes('rent')

  const toggleDeal = (deal: Deal) => {
    const deals = canDeal(deal)
      ? form.values.deals.filter((value) => value !== deal)
      : [...form.values.deals, deal]
    form.setValue('deals', deals)
    if (!(deals.includes('sale') && deals.includes('rent')))
      form.setValue('rentToOwn', false)
  }
  const canDeal = (deal: Deal) => form.values.deals.includes(deal)

  if (form.receipt) {
    return (
      <ReceiptPanel
        receipt={form.receipt}
        title="出品の申し込み"
        description="一覧に掲載しました。内容の確認結果はメールでお知らせします。"
        links={[
          {
            href: `/listings/${form.receipt.id}`,
            label: '出品した農機具を見る',
          },
          { href: '/listings', label: '出品中の農機具を見る' },
        ]}
      />
    )
  }

  return (
    <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
      <FormAlert error={form.failed ? '送信できませんでした。' : undefined} />

      <TextField
        id="name"
        label="農機具名"
        placeholder="例: クボタ トラクター 45馬力 GLシリーズ"
        value={form.values.name}
        onChange={(e) => form.setValue('name', e.target.value)}
        error={form.errors.name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="category"
          label="カテゴリ"
          options={listingCategories}
          value={form.values.category}
          onChange={(e) => form.setValue('category', e.target.value)}
          error={form.errors.category}
        />
        <TextField
          id="maker"
          label="メーカー"
          value={form.values.maker}
          onChange={(e) => form.setValue('maker', e.target.value)}
          error={form.errors.maker}
        />
        <TextField
          id="year"
          label="年式"
          inputMode="numeric"
          placeholder="例: 2019"
          value={form.values.year}
          onChange={(e) => form.setValue('year', e.target.value)}
          error={form.errors.year}
        />
        <TextField
          id="hours"
          label="稼働時間"
          inputMode="numeric"
          placeholder="例: 620"
          value={form.values.hours}
          onChange={(e) => form.setValue('hours', e.target.value)}
          error={form.errors.hours}
        />
        <SelectField
          id="condition"
          label="状態"
          options={listingConditions}
          value={form.values.condition}
          onChange={(e) => form.setValue('condition', e.target.value)}
          error={form.errors.condition}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="prefecture"
            label="都道府県"
            value={form.values.prefecture}
            onChange={(e) => form.setValue('prefecture', e.target.value)}
            error={form.errors.prefecture}
          />
          <TextField
            id="city"
            label="市区町村"
            value={form.values.city}
            onChange={(e) => form.setValue('city', e.target.value)}
            error={form.errors.city}
          />
        </div>
      </div>

      <fieldset className="rounded-2xl border border-border p-5">
        <legend className="px-1 text-sm font-medium text-foreground">
          取引方法
        </legend>
        <div className="flex flex-wrap gap-6">
          <CheckboxField
            id="deal-sale"
            label="販売する"
            checked={canSell}
            onChange={() => toggleDeal('sale')}
          />
          <CheckboxField
            id="deal-rent"
            label="レンタルする"
            checked={canRent}
            onChange={() => toggleDeal('rent')}
          />
        </div>
        {form.errors.deals && (
          <p className="mt-2 text-xs text-destructive">{form.errors.deals}</p>
        )}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {canSell && (
            <TextField
              id="salePrice"
              label="販売価格"
              inputMode="numeric"
              placeholder="円"
              value={form.values.salePrice}
              onChange={(e) => form.setValue('salePrice', e.target.value)}
              error={form.errors.salePrice}
            />
          )}
          {canRent && (
            <TextField
              id="rentPerDay"
              label="レンタル料（1日）"
              inputMode="numeric"
              placeholder="円"
              value={form.values.rentPerDay}
              onChange={(e) => form.setValue('rentPerDay', e.target.value)}
              error={form.errors.rentPerDay}
            />
          )}
        </div>
        {canSell && canRent && (
          <CheckboxField
            id="rentToOwn"
            label="レンタル購入を受け付ける"
            className="mt-4"
            checked={form.values.rentToOwn}
            onChange={(e) => form.setValue('rentToOwn', e.target.checked)}
            error={form.errors.rentToOwn}
          />
        )}
      </fieldset>

      <TextareaField
        id="summary"
        label="説明"
        placeholder="装備、整備状況、貸し出し条件など"
        value={form.values.summary}
        onChange={(e) => form.setValue('summary', e.target.value)}
        error={form.errors.summary}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="sellerName"
          label="出品者名"
          placeholder="例: 中村ファーム"
          value={form.values.sellerName}
          onChange={(e) => form.setValue('sellerName', e.target.value)}
          error={form.errors.sellerName}
        />
        <SelectField
          id="sellerKind"
          label="出品者の区分"
          options={sellerKinds}
          value={form.values.sellerKind}
          onChange={(e) => form.setValue('sellerKind', e.target.value)}
          error={form.errors.sellerKind}
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
        <SubmitButton label="出品を申し込む" isSubmitting={form.isSubmitting} />
      </div>
    </form>
  )
}
