import faker from 'faker'
import { generateIssue, generateCvSearchResults, generateCvVolume, generateEntry, pick, generateCvVolumeSearchResult, generateCvIssueSearchResult } from '../../test/generators'
import { testEffectGenerator } from 'typed-effects/dist/testing'
import { createBddHelper } from '../../test/bdd'
import { guessComicVineIssueForEntry } from './guessComicVineIssueForEntry'
import {
  search,
  defer,
  firstIssueForEntry,
  tryParseIssueDetails,
  compareEntryToResults,
  volume,
  issue,
  hasBeenDeferred,
} from '../effects'

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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryProbablyIsntIssueOne,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryIsProbablyIssueOne,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasNotBeenMatchedYet,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasNotBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItCantFindItsIssueNumberInThatVolume,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasAlreadyBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.WhenItTriesToMatchAgainstItsIssueNumberInThatVolume,
  t.AndDoesntGetAStrongMatchingResult,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryHasAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  t.AndItGetsAStrongMatchFromAVolumeResult,
  t.ThenItShouldReturnNewEntryDataFromTheBestSearchResult,
])

bdd(t => [
  t.GivenIssueOneOfTheDirectoryHasStillNotBeenMatched,
  t.AndThisEntryDoesntSeemToHaveAnIssueNumber,
  t.AndItHasBeenDeferredBefore,
  t.WhenItSearchesComicVineForItsParsedIssueName,
  t.AndItGetsAStrongMatchFromAnIssueResult,
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
  const firstIssue = generateIssue({
    volume: {
      source: 'COMIC_VINE',
      sourceId: firstIssueCvVolume.comicVineId.toString(),
      name: 'whatever',
    }
  })

  const foundIssue = generateIssue()
  const foundCvSearchResults = generateCvSearchResults()

  const pickedVolumeIssue = pick(firstIssueCvVolume.issues)
  const entryParsedIssueNumber = pickedVolumeIssue.number
  const entryParsedIssueName = faker.lorem.sentence()

  const bestSearchResultIssue = generateCvIssueSearchResult()
  const bestSearchResultVolume = generateCvVolumeSearchResult()
  const bestIssue = generateIssue()
  const bestVolume = generateCvVolume()
  bestVolume.issues[0].number = 1

  const strongMatchVolumeResults = { strongest: { comparison: bestSearchResultVolume, score: 0.0 }, matches: [] }
  const strongMatchIssueResults = { strongest: { comparison: bestSearchResultIssue, score: 0.0 }, matches: [] }
  const weakMatchResults = { strongest: { comparison: null as any, score: 5.0 }, matches: [] }

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
      .andProceedWith(firstIssue),

    GivenIssueOneOfTheDirectoryHasNowBeenMatched: () => wrapper
      .assertNextEffectMatches(firstIssueForEntry(entry))
      .andProceedWith(firstIssue),

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
        .assertNextEffectMatches(issue(pickedVolumeIssue.comicVineId))
        .andProceedWith(foundIssue)
    },

    AndItGetsAStrongMatchFromAVolumeResult: async () => {
      await wrapper
        .assertNextEffectMatches(compareEntryToResults<any>(entry, foundCvSearchResults))
        .andProceedWith(strongMatchVolumeResults)

      await wrapper
        .assertNextEffectMatches(volume(bestSearchResultVolume.comicVineId))
        .andProceedWith(bestVolume)

      await wrapper
        .assertNextEffectMatches(issue(bestVolume.issues[0].comicVineId))
        .andProceedWith(bestIssue)
    },

    AndItGetsAStrongMatchFromAnIssueResult: async () => {
      await wrapper
        .assertNextEffectMatches(compareEntryToResults<any>(entry, foundCvSearchResults))
        .andProceedWith(strongMatchIssueResults)

      await wrapper
        .assertNextEffectMatches(issue(bestSearchResultIssue.comicVineId))
        .andProceedWith(bestIssue)
    },

    AndItGetsAStrongMatch: () => wrapper
      .assertNextEffectMatches(compareEntryToResults<any>(entry, lastLookup === 'issue' ? [foundIssue] : foundCvSearchResults))
      .andProceedWith(strongMatchIssueResults),

    AndDoesntGetAStrongMatchingResult: () => wrapper
      .assertNextEffectMatches(compareEntryToResults<any>(entry, lastLookup === 'issue' ? [foundIssue] : foundCvSearchResults))
      .andProceedWith(weakMatchResults),

    ThenItShouldReturnNewEntryDataFromTheFoundIssue: () => wrapper
      .assertReturnValueIs(foundIssue),

    ThenItShouldReturnNewEntryDataFromTheBestSearchResult: () => wrapper
      .assertReturnValueIs(bestIssue),

    ThenItShouldReturnNull: () => wrapper
      .assertReturnValueIs(null),

    ThenItShouldDefer: () => wrapper
      .assertNextEffectMatches(defer())
      .andFinish(),
  }
}
