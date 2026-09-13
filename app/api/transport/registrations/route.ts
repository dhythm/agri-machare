import { handleSubmission } from '@/lib/server/api'
import { validateTransportRegistration } from '@/lib/validation/transport'

export function POST(request: Request) {
  return handleSubmission(
    request,
    'transportRegistration',
    validateTransportRegistration,
  )
}
