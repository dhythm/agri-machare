import {
  asRecord,
  finish,
  invalidInput,
  optionalText,
  readDate,
  requireChoice,
  requireEmail,
  requireText,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export const carrierKinds = ['個人', '法人'] as const
export const vehicleTypes = [
  '軽トラック',
  '2tトラック',
  '4tトラック',
  'トレーラー',
] as const

export type TransportRegistration = {
  name: string
  kind: (typeof carrierKinds)[number]
  prefecture: string
  vehicle: (typeof vehicleTypes)[number]
  email: string
  note?: string
}

export type TransportApplication = {
  name: string
  email: string
  vehicle: (typeof vehicleTypes)[number]
  availableDate: string
  message?: string
}

export function validateTransportRegistration(
  input: unknown,
): ValidationResult<TransportRegistration> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: TransportRegistration = {
    name: requireText(errors, source, 'name', 'お名前・屋号', 60),
    kind: requireChoice(
      errors,
      source,
      'kind',
      '区分',
      carrierKinds,
    ) as TransportRegistration['kind'],
    prefecture: requireText(errors, source, 'prefecture', '拠点の都道府県', 10),
    vehicle: requireChoice(
      errors,
      source,
      'vehicle',
      '車両',
      vehicleTypes,
    ) as TransportRegistration['vehicle'],
    email: requireEmail(errors, source, 'email'),
    note: optionalText(errors, source, 'note', '補足', 1000),
  }
  return finish(errors, value)
}

export function validateTransportApplication(
  input: unknown,
): ValidationResult<TransportApplication> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: TransportApplication = {
    name: requireText(errors, source, 'name', 'お名前・屋号', 60),
    email: requireEmail(errors, source, 'email'),
    vehicle: requireChoice(
      errors,
      source,
      'vehicle',
      '車両',
      vehicleTypes,
    ) as TransportApplication['vehicle'],
    availableDate: readDate(
      errors,
      source,
      'availableDate',
      '対応可能日',
      true,
    ) as string,
    message: optionalText(errors, source, 'message', 'メッセージ', 1000),
  }
  return finish(errors, value)
}
