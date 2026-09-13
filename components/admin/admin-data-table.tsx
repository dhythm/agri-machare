'use client'

import { useId, useState, type ReactNode } from 'react'
import { Search, SearchX } from 'lucide-react'

export function AdminDataTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: { key: string; searchText: string; cells: ReactNode[] }[]
}) {
  const [query, setQuery] = useState('')
  const headingId = useId()
  const normalizedQuery = query.trim().toLocaleLowerCase('ja-JP')
  const filteredRows = rows.filter((row) =>
    row.searchText.toLocaleLowerCase('ja-JP').includes(normalizedQuery),
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <h2
            id={headingId}
            className="font-display text-lg font-bold text-foreground"
          >
            {title}
          </h2>
          <span
            aria-live="polite"
            className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground"
          >
            {filteredRows.length}件
          </span>
        </div>
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-border bg-background px-3 text-muted-foreground focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:w-72">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{title}を検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${title}を検索`}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-muted-foreground">
          <SearchX className="size-7" aria-hidden="true" />
          <p className="text-sm">該当なし</p>
        </div>
      ) : (
        <div
          role="region"
          aria-labelledby={headingId}
          tabIndex={0}
          className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <table aria-label={title} className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="whitespace-nowrap px-5 py-3.5 font-medium first:pl-6 last:pr-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.key}
                  className="border-t border-border transition-colors hover:bg-muted/30"
                >
                  {row.cells.map((cell, index) => (
                    <td
                      key={index}
                      className="max-w-sm px-5 py-5 align-middle leading-relaxed whitespace-nowrap first:min-w-40 first:pl-6 first:whitespace-normal last:pr-6 last:whitespace-normal [&_code]:break-all [&_code]:text-muted-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
