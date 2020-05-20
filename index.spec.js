const dwalk = require('./index.js')
const FIXTURE = './fixture'

const canonPath = (p) => p.replace(/\\/g, '/')

it('should calculate relative path', () => {
  const files = [...dwalk(FIXTURE)]
  const clean = files.map((d) => `${d.depth} ${canonPath(d.relative)}`)
  expect(clean).toMatchSnapshot()
})

it('should have name property', () => {
  const all = [...dwalk(FIXTURE)]
  const clean = all.map((d) => `${d.depth} ${d.name}`)
  expect(clean).toMatchSnapshot()
})

it('should calculate absolute path', () => {
  const all = [...dwalk(FIXTURE)]
  const clean = all.map((d) => `${d.depth} ${canonPath(d.absolute)}`)
  expect(clean).toMatchSnapshot()
})

it('should handle skip command', () => {
  const gen = dwalk(FIXTURE)
  expect(gen.next().value).toMatchObject({ relative: '.gitkeep' })

  expect(gen.next().value).toMatchObject({ relative: 'level-1-a' })
  // signal it to skip contents of level-1-a
  expect(gen.next('skip').value).toMatchObject({ relative: 'level-1-b' })

  expect(gen.next().value).toMatchObject({ relative: 'level-1-c' })

  // without skipping it would be level-1-a/.gitkeep
  expect(gen.next().value).toMatchObject({ relative: 'level-1-b\\.gitkeep' })
})

it('should handle stop command', () => {
  const gen = dwalk(FIXTURE)
  expect(gen.next().value).toMatchObject({ relative: '.gitkeep' })

  expect(gen.next('stop').value).toBe(undefined)
  expect(gen.next().value).toBe(undefined)
})

it('should handle false as stop command', () => {
  const gen = dwalk(FIXTURE)
  expect(gen.next().value).toMatchObject({ relative: '.gitkeep' })

  expect(gen.next(false).value).toBe(undefined)
  expect(gen.next().value).toBe(undefined)
})

describe('.cb', () => {
  it('should invoke callback with same files as normal', () => {
    const files = []
    dwalk.cb(FIXTURE, (ev) => files.push(ev))
    expect(files).toEqual([...dwalk(FIXTURE)])
  })

  it('should handle skip command', () => {
    const files = []
    dwalk.cb(FIXTURE, (file) => {
      if (file.relative === 'level-1-a') return 'skip'
      files.push(file)
    })

    expect(files.length).toBe(53)
    const anyLevel1A = files.filter((ev) => ev.relative.includes('level-1-a'))
    expect(anyLevel1A).toEqual([])
  })

  it('should handle stop command', () => {
    const files = []
    dwalk.cb(FIXTURE, (file) => {
      if (file.relative === 'level-1-a') return 'stop'
      files.push(file)
    })
    expect(files.length).toBe(1)
  })

  it('should handle false as stop command', () => {
    const files = []
    dwalk.cb(FIXTURE, (file) => {
      if (file.relative === 'level-1-a') return false
      files.push(file)
    })
    expect(files.length).toBe(1)
  })

  it('should handle skip_dir command', () => {
    let found = false
    const pre = []
    const post = []

    dwalk.cb(FIXTURE, (file) => {
      if (found) return post.push(file)

      pre.push(file)

      if ((found = file.relative.endsWith('level-2-b'))) {
        return 'skip_dir'
      }
    })

    expect(pre.map((f) => canonPath(f.relative))).toMatchSnapshot()
    expect(post.map((f) => canonPath(f.relative))).toMatchSnapshot()
  })
})

it('should not emit anything when passed path is file', () => {
  const all = [...dwalk('package.json')]
  expect(all).toEqual([])
})
