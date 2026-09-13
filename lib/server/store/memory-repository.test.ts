import { describe, expect, it } from 'vitest'
import { createMemoryRepository } from './memory-repository'

type Item = { id: string; name: string; tags: string[] }

const seed: Item[] = [
  { id: 'a', name: 'A', tags: ['x'] },
  { id: 'b', name: 'B', tags: [] },
]

describe('createMemoryRepository', () => {
  it('lists the seed in order and finds by id', async () => {
    const repository = createMemoryRepository(seed)
    expect((await repository.list()).map((item) => item.id)).toEqual(['a', 'b'])
    expect((await repository.get('b'))?.name).toBe('B')
    expect(await repository.get('missing')).toBeUndefined()
  })

  it('creates at the front, rejects duplicate ids, and isolates stored copies', async () => {
    const repository = createMemoryRepository(seed)
    const input: Item = { id: 'c', name: 'C', tags: ['new'] }
    const created = await repository.create(input)
    input.tags.push('mutated')
    expect(created.tags).toEqual(['new'])
    expect((await repository.list()).map((item) => item.id)).toEqual([
      'c',
      'a',
      'b',
    ])
    await expect(
      repository.create({ id: 'a', name: 'dup', tags: [] }),
    ).rejects.toThrow(/already exists/)
  })

  it('updates only existing entities and keeps the id', async () => {
    const repository = createMemoryRepository(seed)
    const updated = await repository.update('a', { name: 'A2' })
    expect(updated).toEqual({ id: 'a', name: 'A2', tags: ['x'] })
    expect((await repository.get('a'))?.name).toBe('A2')
    expect(await repository.update('missing', { name: 'x' })).toBeUndefined()
  })

  it('deletes and reports whether something was removed', async () => {
    const repository = createMemoryRepository(seed)
    expect(await repository.delete('a')).toBe(true)
    expect(await repository.delete('a')).toBe(false)
    expect((await repository.list()).map((item) => item.id)).toEqual(['b'])
  })

  it('does not let callers mutate the seed or returned entities in place', async () => {
    const repository = createMemoryRepository(seed)
    const first = (await repository.list())[0]
    first.name = 'hacked'
    expect((await repository.get('a'))?.name).toBe('A')
    expect(seed[0].name).toBe('A')
  })
})
