import { handleSubmission } from '@/lib/server/api'
import { validateContact } from '@/lib/validation/contact'

export function POST(request: Request) {
  return handleSubmission(request, 'contact', validateContact)
}
