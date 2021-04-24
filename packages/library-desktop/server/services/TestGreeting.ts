export type TestGreetingService = (name: string) => Promise<{ success: string }>

export const TestGreeting: TestGreetingService = async (name: string) => {
  return { success: `Hello ${name}!` }
}
