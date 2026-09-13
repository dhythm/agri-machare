import 'server-only'

import type { TransportJob } from '@/lib/data'
import { transportJobs } from './data'

export function getTransportJobs(): TransportJob[] {
  return transportJobs
}

export function getTransportJob(id: string): TransportJob | undefined {
  return transportJobs.find((job) => job.id === id)
}

export function getTransportJobIds(): string[] {
  return transportJobs.map((job) => job.id)
}
