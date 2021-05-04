import path from 'path'
import { diffChars, Change } from 'diff'
import { closest } from 'fastest-levenshtein'

export const parseComicTitles = (fpaths: string[]) => {
  return fpaths.map(fpath => parse(fpath, fpaths))
}

const parse = (fpath: string, allFpaths: string[]) => {
  const name = clean(fpath)

  return {
    path: fpath,
    name: name,
    number: guessIssueNumber(name, allFpaths.map(clean)),
  }
}

const clean = (str: string) =>
  trimWhitespace(
    replaceUnderscores(
      stripParenthesisedWords(
        stripExtension(str))))

const trimWhitespace = (fpath: string) =>
  fpath.trim().replace(/\s{2,}/, ' ')

const replaceUnderscores = (fpath: string) =>
  fpath.replace(/_/g, ' ')

const stripExtension = (fpath: string) =>
  path.basename(fpath, path.extname(fpath))

const stripParenthesisedWords = (fpath: string) => fpath
  .replace(/\([^\)]+\)/, '')
  .replace(/\[[^\)]+\]/, '')

const guessIssueNumber = (fpath: string, allFpaths: string[]) => {
  if (allFpaths.length === 1) return findNonDateNumber(fpath)

  const cursor = suspectedNumberCursorInString(fpath, allFpaths)
  return numberAtCursor(fpath, cursor)
}

const findNonDateNumber = (fpath: string) => {
  const nums = fpath.match(NUMBER_MATCH_REGEXP)
  if (nums === null) return undefined

  const isDate = (num: number) => num >= 1900 && num <= NEXT_YEAR

  return nums.map(Number).find(num => !isDate(num))
}

/*
  Attempts to guess where in the file path string the issue number is
  by reviewing where numbers differ between all of the given file
  paths, calculating where the average change cursor is, and finding
  the change cursor in the file path closest to that.

  For example, given the strings:
    - "Issue 1 2020"
    - "Issue 2 2020"
    - "Issue 3 2021"
             ^
  It'll return here, aka the cursor would be 6.
*/
const suspectedNumberCursorInString = (fpath: string, allFpaths: string[]) => {
  const average = averageNumberChangeCursorPosition(allFpaths)
  const otherFpaths = allFpaths.filter(f => f !== fpath)

  // Compares against the sibling path which is most similar to the given
  // file path, to prevent comparing against outlier files when different
  // volumes of comics are stored in the same directory.
  const diff = diffChars(closest(fpath, otherFpaths), fpath)
  const suspectedChangeIndex = closestChangeToAveragePositionIndex(average, diff)

  return cursorForChangeIndex(diff, suspectedChangeIndex)
}

const closestChangeToAveragePositionIndex = (average: number, diff: Change[]) => {
  const distancesToAverageChangePosition = diff.map((change, index) => {
    if (!change.added || !NUMBER_REGEXP.test(change.value)) return Infinity

    const cursor = cursorForChangeIndex(diff, index)
    return Math.abs(cursor - average)
  })

  const closestNumberChangeToAveragePosition = Math.min(...distancesToAverageChangePosition)
  return distancesToAverageChangePosition
    .findIndex(distance => distance === closestNumberChangeToAveragePosition)
}

/*
  Compares every file path against every other file path
  to determine the average cursor position of number changes
  within all file paths.
*/
const averageNumberChangeCursorPosition = (fpaths: string[]) => {
  const averages = fpaths.map(fpath => {
    const others = fpaths.filter(f => f !== fpath)
    return averageCursorPositionFromPath(fpath, others)
  })

  return sum(averages) / averages.length
}

const averageCursorPositionFromPath = (fpath: string, otherFpaths: string[]) => {
  const averages = otherFpaths.map(other => {
    const diff = diffChars(other, fpath)
    const changes = diff.filter(change => change.added && NUMBER_REGEXP.test(change.value))
    const cursors = changes.map(change => {
      const index = diff.findIndex(c => c === change)
      return cursorForChangeIndex(diff, index)
    })

    return sum(cursors) / cursors.length
  })

  return sum(averages) / averages.length
}

const cursorForChangeIndex = (diff: Change[], index: number) => {
  const previous = diff.slice(0, index)
  return sum(previous.map(p => p.count || 0)) - 1
}

/*
  Returns the number at a given position within a string
  ie for the following string and the cursor 9:
    "Example 123"
              ^
  The cursor would be here, and the result would be 123.
*/
const numberAtCursor = (str: string, cursor: number) => {
  let chars = ''
  let remaining = str
  let position = 0

  while (position < str.length) {
    const char = remaining.charAt(position)

    if (isNumber(char)) chars += char
    else if (position < cursor) chars = ''
    else break

    position += 1
  }

  return Number(chars)
}

const NUMBER_REGEXP = new RegExp('[0-9]')
const NUMBER_MATCH_REGEXP = new RegExp('([0-9]+)', 'g')
const NEXT_YEAR = new Date().getFullYear() + 1
const isNumber = (char: string) => NUMBER_REGEXP.test(char)
const sum = (arr: number[]) => arr.reduce((total, num) => total + num, 0)
