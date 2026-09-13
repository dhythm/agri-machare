import 'server-only'

import { isApproved, type TransportJob } from '@/lib/data'
import { prefectureOf } from '@/lib/transport-fee'
import type { CarrierProfileInput } from '@/lib/validation/carrier'
import type { AuthenticatedUser } from './auth/accounts'
import { getStore, type CarrierProfile } from './store'

/** Rough payload each vehicle type can carry, in tons. */
const vehicleCapacityTons: Record<string, number> = {
  軽トラック: 0.35,
  '2tトラック': 2,
  '4tトラック': 4,
  トレーラー: 20,
}

/** "約2.4t" → 2.4, "1,800kg" → 1.8; undefined when the text has no number. */
export function parseTons(weight: string): number | undefined {
  const match = weight.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(t|kg)/i)
  if (!match) return undefined
  const amount = Number(match[1])
  return match[2].toLowerCase() === 'kg' ? amount / 1000 : amount
}

export async function upsertCarrierProfile(
  user: AuthenticatedUser,
  input: CarrierProfileInput,
): Promise<CarrierProfile> {
  const store = getStore()
  const now = new Date().toISOString()
  const existing = await store.carrierProfiles.get(user.id)
  if (existing) {
    return (await store.carrierProfiles.update(user.id, {
      ...input,
      updatedAt: now,
    })) as CarrierProfile
  }
  return store.carrierProfiles.create({
    id: user.id,
    ...input,
    createdAt: now,
    updatedAt: now,
  })
}

export function getCarrierProfile(
  userId: string,
): Promise<CarrierProfile | undefined> {
  return getStore().carrierProfiles.get(userId)
}

export function listCarrierProfiles(): Promise<CarrierProfile[]> {
  return getStore().carrierProfiles.list()
}

export type CarrierMatch = { profile: CarrierProfile; score: number }

function jobPrefectures(job: TransportJob): string[] {
  return [prefectureOf(job.from), prefectureOf(job.to)].filter(
    (name): name is string => name !== undefined,
  )
}

function canCarry(profile: CarrierProfile, tons: number | undefined): boolean {
  if (tons === undefined) return true
  return profile.vehicles.some(
    (vehicle) => (vehicleCapacityTons[vehicle] ?? 0) >= tons,
  )
}

/** Carriers serving either end of the job, both ends first; heavy loads need a big enough vehicle. */
export async function matchCarriersForJob(
  job: TransportJob,
): Promise<CarrierMatch[]> {
  const areas = jobPrefectures(job)
  if (areas.length === 0) return []
  const tons = parseTons(job.weight)
  const profiles = await listCarrierProfiles()
  return profiles
    .map((profile) => ({
      profile,
      score: areas.filter((area) => profile.serviceAreas.includes(area)).length,
    }))
    .filter((match) => match.score > 0 && canCarry(match.profile, tons))
    .sort((a, b) => b.score - a.score)
}

/** Open, approved jobs that start or end inside the carrier's areas. */
export async function matchJobsForCarrier(
  profile: CarrierProfile,
): Promise<TransportJob[]> {
  const jobs = await getStore().transportJobs.list()
  return jobs.filter(
    (job) =>
      isApproved(job) &&
      job.status === '募集中' &&
      jobPrefectures(job).some((area) => profile.serviceAreas.includes(area)),
  )
}
