import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Gauge, Repeat2 } from 'lucide-react'
import { Badge } from '@/components/badge'
import { type Listing, formatYen } from '@/lib/data'

export function ListingCard({ listing }: { listing: Listing }) {
  const canBuy = listing.deals.includes('sale')
  const canRent = listing.deals.includes('rent')

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={listing.image || '/placeholder.svg'}
          alt={listing.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {canBuy && <Badge className="bg-primary text-primary-foreground shadow-sm">販売</Badge>}
          {canRent && <Badge className="bg-accent text-accent-foreground shadow-sm">レンタル</Badge>}
        </div>
        {listing.rentToOwn && (
          <Badge className="absolute bottom-3 left-3 bg-card/95 text-primary shadow-sm">
            <Repeat2 className="size-3.5" />
            レンタル購入可
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{listing.maker}</span>
          <span>·</span>
          <span>{listing.year}年式</span>
          <span className="inline-flex items-center gap-0.5">
            <Gauge className="size-3" />
            {listing.hours}h
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-medium leading-snug text-foreground">
          {listing.name}
        </h3>

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.prefecture} {listing.city}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            {listing.rentPerDay && (
              <p className="font-display text-lg font-bold leading-none text-foreground">
                {formatYen(listing.rentPerDay)}
                <span className="ml-1 text-xs font-medium text-muted-foreground">/日</span>
              </p>
            )}
            {listing.salePrice && (
              <p className="mt-1 text-xs text-muted-foreground">
                販売 {formatYen(listing.salePrice)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" />
            <span className="font-medium text-foreground">{listing.seller.rating}</span>
            <span>({listing.seller.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
