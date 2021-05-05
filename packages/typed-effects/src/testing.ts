import { AnyEffectGenerator, Effect, EffectGenerator, EffectResponse } from './'

export interface EffectGeneratorTestWrapperProceeder<T extends Effect> {
  andProceedWith: (value?: EffectResponse<T>) => Promise<void>
  andFinish: (value?: EffectResponse<T>) => Promise<void>
  andRunIt: () => Promise<void>
}

export interface EffectGeneratorTestWrapper {
  assertNextEffectIsType: <T extends Effect>(type: any)
    => EffectGeneratorTestWrapperProceeder<T>

  assertNextEffectMatches: <T extends Effect>(callGen: EffectGenerator<T>)
    => EffectGeneratorTestWrapperProceeder<T>

  assertReturnValueIs: (value: any) => Promise<void>
}

export const testEffectGenerator = (gen: AnyEffectGenerator): EffectGeneratorTestWrapper => {
  let done: boolean | undefined = false
  let nextInputValue: any = undefined

  const proceeder = <T extends Effect>(runAssertion: (result: IteratorResult<any>) => void) => {
    return {
      andFinish: async (value?: EffectResponse<T>) => {
        const result = await gen.next(nextInputValue)
        runAssertion(result)

        done = result.done
        nextInputValue = value
      },
      andProceedWith: async (value?: EffectResponse<T>) => {
        const result = await gen.next(nextInputValue)
        runAssertion(result)

        if (result.done) throw new Error('Cannot proceed, there are no more effects') // TODO: improve this message

        done = result.done
        nextInputValue = value
      },
      andRunIt: async () => {
        const result = await gen.next(nextInputValue)
        runAssertion(result)

        done = result.done
        nextInputValue = result.value.payload
      }
    }
  }

  return {
    assertNextEffectIsType: (type: any) => {
      return proceeder((result: IteratorResult<any>) => {
        expect(result.value.type).toEqual(type)
      })
    },
    assertNextEffectMatches: <T extends Effect>(callGen: EffectGenerator<T>) => {
      return proceeder((result: IteratorResult<any>) => {
        expect(result.value).toEqual(callGen.next().value)
      })
    },
    assertReturnValueIs: async (value: any) => {
      return proceeder((result: IteratorResult<any>) => {
        expect(result.value).toEqual(value)
        expect(result.done).toEqual(true)
      }).andFinish()
    }
  }
}
