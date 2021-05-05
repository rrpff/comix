import { parseComicTitles, ParsedIssue } from './parseComicTitles'

type Example = [string[], Partial<ParsedIssue>[]]

const example = (message: string, examples: Example[], method = it) => {
  method.each(examples)(message, (fpaths, expected) => {
    expect(subject(fpaths)).toMatchObject(expected)
  })
}

example.focus = (message: string, examples: Example[]) => example(message, examples, fit)

example('includes the original file path', [
  [['abc.cbr'], [{ path: 'abc.cbr' }]],
  [['xyz.cbz'], [{ path: 'xyz.cbz' }]],
  [['def.pdf'], [{ path: 'def.pdf' }]],
])

example('removes the extension from its name', [
  [['abc.cbr'], [{ name: 'abc' }]],
  [['xyz.cbz'], [{ name: 'xyz' }]],
  [['def.pdf'], [{ name: 'def' }]],
])

example('strips words in parentheses from its name', [
  [['hello(test).cbr'], [{ name: 'hello' }]],
  [['hello(test) (3).cbr'], [{ name: 'hello' }]],
  [['hello[test].cbr'], [{ name: 'hello' }]],
  [['hello[test] [2].cbr'], [{ name: 'hello' }]],
  [['whatever(.cbr'], [{ name: 'whatever(' }]],
  [['cool).cbr'], [{ name: 'cool)' }]],
])

example('trims whitespace in its name', [
  [['thing .cbr'], [{ name: 'thing' }]],
  [[' example.cbr'], [{ name: 'example' }]],
  [['issue (2020).cbr'], [{ name: 'issue' }]],
  [['double  space.cbr'], [{ name: 'double space' }]],
  [['triple   space.cbr'], [{ name: 'triple space' }]],
])

example('replaces special characters in its name', [
  [['thing_123.cbr'], [{ name: 'thing 123' }]],
  [['thing-123.cbr'], [{ name: 'thing 123' }]],
  [['_cool_msn_username_.cbr'], [{ name: 'cool msn username' }]],
  [['-cool-msn-username-.cbr'], [{ name: 'cool msn username' }]],
  [['issue #1.cbr'], [{ name: 'issue 1', volume: 'issue' }]],
  [['issue ##1.cbr'], [{ name: 'issue 1', volume: 'issue' }]],
])

example('returns no issue number when there is only one name, and it has no numbers', [
  [['example'], [{ name: 'example', number: undefined }]],
  [['another'], [{ name: 'another', number: undefined }]],
])

example('returns an issue number of any found number when there is only one name', [
  [['Comic 200.cbr'], [{ number: 200 }]],
  [['comix #30.cbr'], [{ number: 30 }]],
  [['stuff 0001.cbr'], [{ number: 1 }]],
  [['stuff 0030 2020.cbr'], [{ number: 30 }]],
  [['stuff 2020 0005.cbr'], [{ number: 5 }]],
])

example('returns no issue number when there is only one name, and the number looks like a date', [
  [['Comic 2020.cbr'], [{ number: undefined }]],
  [['1900 comix.cbr'], [{ number: undefined }]],
  [['1939.cbr'], [{ number: undefined }]],
])

example('returns no issue number when the number is probably too long to be an issue number', [
  [['Comic 999.cbr'], [{ number: 999 }]],
  [['Comic 1000.cbr'], [{ number: undefined }]],
  [['Comic 13342424'], [{ number: undefined }]],
  [['Comic 0000001'], [{ number: 1 }]],
])

example('returns a volume name without its issue number if found', [
  [['thing1.cbr'], [{ name: 'thing1', volume: 'thing' }]],
  [['Cool 1.cbr', 'Cool 2.cbr'], [{ name: 'Cool 1', volume: 'Cool' }, { name: 'Cool 2', volume: 'Cool' }]],
  [['Comic 0001.cbr'], [{ name: 'Comic 0001', volume: 'Comic' }]],
])

example('returns an issue number when it is the only difference between it and its siblings', [
  [
    ['Comic 1.cbr', 'Comic 2.cbr'],
    [{ number: 1 }, { number: 2 }]
  ],
  [
    ['Issue 22 ykno.cbr', 'Issue 33 ykno.cbr', 'Issue 44 ykno.cbr'],
    [{ number: 22 }, { number: 33 }, { number: 44 }]
  ],
  [
    ['Issue 123 - 2020.cbr', 'Issue 456 - 2020.cbr', 'Issue 789 - 2020.cbr'],
    [{ number: 123 }, { number: 456 }, { number: 789 }]
  ],
])

example('can handle sequential issue numbers', [
  [
    ['Issue 123 - 2020.cbr', 'Issue 124 - 2020.cbr', 'Issue 125 - 2020.cbr'],
    [{ number: 123 }, { number: 124 }, { number: 125 }]
  ],
  [
    ['Issue 456 456 - 2020.cbr', 'Issue 456 457 - 2020.cbr', 'Issue 456 458 - 2020.cbr'],
    [{ number: 456 }, { number: 457 }, { number: 458 }]
  ],
  [
    ['Issue 44 456 - 2020.cbr', 'Issue 45 456 - 2020.cbr', 'Issue 46 456 - 2020.cbr'],
    [{ number: 44 }, { number: 45 }, { number: 46 }]
  ],
])

example('can handle sequential issue numbers with misses', [
  [
    ['Issue 44 - 2020.cbr', 'Issue 45 - 2020.cbr', 'Issue 47 - 2020.cbr'],
    [{ number: 44 }, { number: 45 }, { number: 47 }]
  ],
])

example('ignores non-number changes in diffs', [
  [
    ['Issue 44 - Bad Times Ahead.cbr', 'Issue 45 - Bad Times.cbr', 'Issue 47 - Over It.cbr'],
    [{ number: 44 }, { number: 45 }, { number: 47 }]
  ],
  [
    ['Issuex 44.cbr', 'Issuey 45.cbr', 'Issuez 47.cbr'],
    [{ number: 44 }, { number: 45 }, { number: 47 }]
  ],
  [
    ['Issue 44x.cbr', 'Issue 45y.cbr', 'Issue 47z.cbr'],
    [{ number: 44 }, { number: 45 }, { number: 47 }]
  ],
])

example('ignores irrelevant number changes in diffs', [
  [
    ['Issue 13 - 2020.cbr', 'Issue 14 - 2020.cbr', 'Issue 15 - 2021.cbr'],
    [{ number: 13 }, { number: 14 }, { number: 15 }]
  ],
  [
    ['Issue from 2020 - 13.cbr', 'Issue from 2020 - 14.cbr', 'Issue from 2021 - 15.cbr'],
    [{ number: 13 }, { number: 14 }, { number: 15 }]
  ],
])

example('can handle the presence of outlier files', [
  [
    ['Issue 13.cbr', 'naaaah 789.cbr', 'Issue 14.cbr'],
    [{ number: 13 }, { number: 789 }, { number: 14 }]
  ],
  [
    ['Issue 44 - Bad Times Ahead.cbr', 'why am i here 123.cbr', 'Issue 47 - Over It.cbr'],
    [{ number: 44 }, { number: 123 }, { number: 47 }]
  ],
])

example('can handle multiple groups of files in the same list', [
  [
    ['Issue 44 - Bad Times Ahead.cbr', '2020 why am i here 123.cbr', 'Issue 47 - Over It.cbr', '2020 why am i here 124.cbr'],
    [{ number: 44 }, { number: 123 }, { number: 47 }, { number: 124 }]
  ],
  [
    ['ABC 13.cbr', 'XYZ 16.cbr', 'ABC 14.cbr', 'ABC 15.cbr', 'XYZ 17.cbr'],
    [{ number: 13 }, { number: 16 }, { number: 14 }, { number: 15 }, { number: 17 }]
  ],
  [
    ['Issue 44 - Bad Times Ahead.cbr', 'Happy 123.cbr', 'Issue 47 - Over It.cbr', 'Happy 125.cbr'],
    [{ number: 44 }, { number: 123 }, { number: 47 }, { number: 125 }]
  ],
  [
    ['Angel Vol 1.cbr', 'Buffy Vol 2.cbr'],
    [{ number: 1 }, { number: 2 }]
  ],
])

example('guesses numbers close to other guesses when there is a lot of variation', [
  [
    ['Comic 006 (2013) (2).cbr', 'Comic-001--2012---two.cbz', 'Comic 007 (2013) (2).cbr', 'Comic_002__2012___2.cbr'],
    [{ number: 6 }, { number: 1 }, { number: 7 }, { number: 2 }]
  ],
])

example('resorts back to treating the path like a solitary file if the averaging is unintelligible', [
  [
    ['Comic Vol. 1.cbz', 'Comic 028.cbr'],
    [{ number: 1 }, { number: 28 }],
  ]
])

const subject = (fpaths: string[]) => {
  return parseComicTitles(fpaths)
}
