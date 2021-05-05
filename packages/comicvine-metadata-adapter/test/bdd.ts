interface BddHarness {
  [key: string]: () => Promise<void>
}

export function createBddHelper<T extends BddHarness>(createHarness: () => T) {
  type Harness = ReturnType<typeof createHarness>

  return (getFns: (t: Harness) => (() => Promise<any>)[], method = test) => {
    const t = createHarness()
    const fns = getFns(t)
    const names = fns.map(fn => {
      const name = Object.keys(t).find(key => t[key as keyof Harness] === fn)
      return humanise(name as string)
    })

    const testName = names.join('\n    ')
    method(testName, async () => {
      await sequence(fns, async fn => await fn())
    })
  }
}

function humanise (str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, (_, l: string, u: string) => `${l} ${u}`)
    .replace(/([A-Z]{2})/g, (_, l: string, u: string) => `${l[0]} ${l[1]}`)
}

async function sequence<T, U>(items: U[], handle: (item: U) => Promise<T>) {
  let remaining = items

  while (remaining.length > 0) {
    await handle(remaining.shift()!)
  }
}
