export const PROMISE_EFFECT_TYPE = Symbol('PROMISE_EFFECT_TYPE')

export interface Effect<E = any, P = any, R = any> {
  resolves: R
  payload: {
    type: E
    payload: P
  }
}

export type EffectResponse<T extends Effect> = T extends Effect<any, any, infer R> ? R : never
export type EffectCall<T extends Effect> = T extends Effect<infer E, infer P, any>
  ? { type: E, payload: P }
  : never

export type EffectGenerator<T extends Effect> = Generator<EffectCall<T>, EffectResponse<T>, EffectResponse<T>>
export type EffectHandler<T extends Effect> = (call: EffectCall<T>) => Promise<EffectResponse<T>>

export type AnyEffectGenerator<TReturn> = Generator<EffectCall<Effect>, TReturn, EffectResponse<Effect>> | AsyncGenerator<EffectCall<Effect>, TReturn, EffectResponse<Effect>>

export type PromiseEffect<T> = Effect<typeof PROMISE_EFFECT_TYPE, Promise<T>, T>
async function handlePromise<T extends Effect>(effect: EffectCall<T>): Promise<EffectResponse<T>> {
  return await effect.payload
}

export function* effect<T>(func: () => Promise<T>): EffectGenerator<PromiseEffect<T>> {
  return yield ({ type: PROMISE_EFFECT_TYPE, payload: func() })
}

export const runEffectGenerator = async <T>(gen: AnyEffectGenerator<T>, handler: EffectHandler<any>): Promise<T> => {
  return new Promise(async resolve => {
    const stepValue = async (call: EffectCall<Effect>) => {
      if (call.type === PROMISE_EFFECT_TYPE) return await handlePromise(call)
      return await handler(call)
    }

    const step = async (done: boolean | undefined, call?: EffectCall<Effect> | T) => {
      if (done) return resolve(call as T)

      const value = await stepValue(call as EffectCall<Effect>)
      const state = await gen.next(value)

      step(state.done, state.value || undefined)
    }

    const state = await gen.next()
    step(state.done, state.value || undefined)
  })
}
