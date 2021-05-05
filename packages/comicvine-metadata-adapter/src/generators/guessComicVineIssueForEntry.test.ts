import faker from 'faker'
import { generateCvIssue, generateCvSearchResults, generateCvVolume, generateEntry, pick } from '../../test/generators'
import { testEffectGenerator } from 'typed-effects/dist/testing'
import { createBddHelper } from '../../test/bdd'
import {
  guessComicVineIssueForEntry,
  search,
  defer,
  firstIssueForEntry,
  tryParseIssueDetails,
  compareEntryToResults,
  volume,
  issue,
  hasBeenDeferred,
} from './guessComicVineIssueForEntry'

const bdd = createBddHelper(harness)

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryProbablyIsntIssueOne,
  t.AndItHasNotBeenDeferredBefore,
  t.ThenItShouldDefer,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryProbablyIsntIssueOne,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryProbablyIsntIssueOne,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryIsProbablyIssueOne,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryIsProbablyIssueOne,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItCantFindItsIssueNumberInThatVolume,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItCantFindItsIssueNumberInThatVolume,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItTriesToMatchAgainstItsIssueNumberInThatVolume,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheFoundIssue,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItTriesToMatchAgainstItsIssueNumberInThatVolume,
  t.AndDoesntGetAStrongMatchingResult,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItTriesToMatchAgainstItsIssueNumberInThatVolume,
  t.AndDoesntGetAStrongMatchingResult,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNewEntryDataFromTheFoundIssue,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNowBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItTriesToMatchAgainstItsIssueNumberInThatVolume,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheFoundIssue,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatch,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndDoesntGetAStrongMatchingResult,
  t.ThenItShouldReturnNull,
])

function harness() {
  const entry = generateEntry()
  const gen = guessComicVineIssueForEntry(entry)
  const wrapper = testEffectGenerator(gen)

  const firstIssueCvVolume = generateCvVolume()
  const firstIssueEntry = generateEntry({ comicVineVolumeId: firstIssueCvVolume.comicVineId })

  const foundCvIssue = { type: "FOUND ISSUE", ...generateCvIssue() }
  const foundCvSearchResults = generateCvSearchResults()

  const entryParsedIssueNumber = pick(firstIssueCvVolume.issues).number
  const entryParsedIssueName = faker.lorem.sentence()

  const bestSearchResultIssue = { type: "SEARCH RESULT ISSUE", ...generateCvIssue() }
  const strongMatchResults = { strongest: { issue: bestSearchResultIssue, score: 0.0 }, matches: [] }
  const weakMatchResults = { strongest: { issue: generateCvIssue(), score: 5.0 }, matches: [] }

  let lastLookup = null as string | null

  return {
    GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet: () => wrapper
      .assertNextEffectMatches(firstIssueForEntry(entry))
      .andProceedWith(null),

    GivenIssueOneOfTheDirectoryHasStillNotBeenMatched: () => wrapper
      .assertNextEffectMatches(firstIssueForEntry(entry))
      .andProceedWith(null),

    GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched: () => wrapper
      .assertNextEffectMatches(firstIssueForEntry(entry))
      .andProceedWith(firstIssueEntry),

    GivenIssueOneOfTheDirectoryHasNowBeenMatched: () => wrapper
      .assertNextEffectMatches(firstIssueForEntry(entry))
      .andProceedWith(firstIssueEntry),

    AndItHasBeenDeferredBefore: () => wrapper
      .assertNextEffectMatches(hasBeenDeferred())
      .andProceedWith(true),

    AndItHasNotBeenDeferredBefore: () => wrapper
      .assertNextEffectMatches(hasBeenDeferred())
      .andProceedWith(false),

    AndThisEntryProbablyIsntIssueOne: () => wrapper
      .assertNextEffectMatches(tryParseIssueDetails(entry))
      .andProceedWith({
          path: entry.filePath,
          name: entryParsedIssueName,
          volume: 'Whatever',
          number: entryParsedIssueNumber
        }),

    AndThisEntryIsProbablyIssueOne: () => wrapper
      .assertNextEffectMatches(tryParseIssueDetails(entry))
      .andProceedWith({
        path: entry.filePath,
        name: entryParsedIssueName,
        volume: 'Whatever',
        number: 1
      }),

    AndThisEntryDoesntSeemToHaveAnIssueNumber: () => wrapper
      .assertNextEffectMatches(tryParseIssueDetails(entry))
      .andProceedWith({
        path: entry.filePath,
        name: entryParsedIssueName,
        volume: 'Whatever',
        number: undefined
      }),

    AndThisEntryHasAnIssueNumber: () => wrapper
      .assertNextEffectMatches(tryParseIssueDetails(entry))
      .andProceedWith({
        path: entry.filePath,
        name: entryParsedIssueName,
        volume: 'Whatever',
        number: entryParsedIssueNumber
      }),

    WhenItSearchesComicVineForItsParsedIssueName: async () => {
      lastLookup = 'search'

      await wrapper
        .assertNextEffectMatches(search(entryParsedIssueName))
        .andProceedWith(foundCvSearchResults)
    },

    WhenItCantFindItsIssueNumberInThatVolume: async () => {
      firstIssueCvVolume.issues = []

      await wrapper
        .assertNextEffectMatches(volume(firstIssueCvVolume.comicVineId))
        .andProceedWith(firstIssueCvVolume)
    },

    WhenItTriesToMatchAgainstItsIssueNumberInThatVolume: async () => {
      lastLookup = 'issue'

      await wrapper
        .assertNextEffectMatches(volume(firstIssueCvVolume.comicVineId))
        .andProceedWith(firstIssueCvVolume)

      await wrapper
        .assertNextEffectMatches(issue(entryParsedIssueNumber))
        .andProceedWith(foundCvIssue)
    },

    AndItGetsAStrongMatch: () => wrapper
      .assertNextEffectMatches(compareEntryToResults(entry, lastLookup === 'issue' ? [foundCvIssue] : foundCvSearchResults))
      .andProceedWith(strongMatchResults),

    AndDoesntGetAStrongMatchingResult: () => wrapper
      .assertNextEffectMatches(compareEntryToResults(entry, lastLookup === 'issue' ? [foundCvIssue] : foundCvSearchResults))
      .andProceedWith(weakMatchResults),

    ThenItShouldReturnNewEntryDataFromTheFoundIssue: () => wrapper
      .assertReturnValueIs(foundCvIssue),

    ThenItShouldReturnNewEntryDataFromTheBestSearchResult: () => wrapper
      .assertReturnValueIs(bestSearchResultIssue),

    ThenItShouldReturnNull: () => wrapper
      .assertReturnValueIs(null),

    ThenItShouldDefer: () => wrapper
      .assertNextEffectMatches(defer())
      .andFinish(),
  }
}
