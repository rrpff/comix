import { CreditType, LibraryIdentifier, LibraryIssue, LibraryCredit, UseCreditHook, LibraryEntry } from '@comix/ui'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { ComicEntryProps } from '@comix/ui/components/ComicEntry'
import { useHook } from 'react-use-dependency'
import { useMemo } from 'react'
import { byKey } from '../helpers/util'

const NAMES = {
  character: 'Character',
  concept: 'Concept',
  location: 'Location',
  object: 'Object',
  person: 'Person',
  storyArc: 'Story Arc',
  team: 'Team',
}

export interface CreditPageViewProps {
  creditIdentifier: LibraryIdentifier
  type: CreditType
  onSelectFile?: (file: File) => void
}

export const CreditPageView = ({
  creditIdentifier,
  type,
  onSelectFile = () => {},
}: CreditPageViewProps) => {
  const { credit, loading } = useHook<UseCreditHook>('useCredit', creditIdentifier, type)
  const comics = useMemo(() => {
    return credit?.issues !== undefined
      ? [...credit.issues!].sort(byKey('coverDate')).map(issue => toComicEntry(credit, issue))
      : []
  }, [credit])

  return (
    <PageContent loading={loading} title={credit?.name || ''} category={NAMES[type]} data-testid="container">
      <section data-testid="contents">
        <ComicEntryList
          comics={comics}
          loading={loading}
          onClickComic={async comic => {
            const issue = comic.reference as LibraryIssue
            const entry = issue!.entries![0]

            const res = await fetch(`${FILES_HOST}?filePath=${entry.entry.filePath}`)
            const blob = await res.blob()
            ;(blob as any).name = entry.entry.fileName
            ;(blob as any).lastModified = 0

            onSelectFile(blob as File)
          }}
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images/small'
const FILES_HOST = 'http://localhost:4000/collection-files'

// TODO: use entry for current collection
const toComicEntry = (credit: LibraryCredit, issue: LibraryIssue): ComicEntryProps => ({
  imageUrl: `${IMAGE_HOST}/${issue.entries![0].entry.coverFileName}`,
  title: `${issue.volume!.name} #${issue.issueNumber}`,
  id: `${issue.source}_${issue.sourceId}`,
  reference: issue,
  readingProgress: progressFor(issue.entries![0].entry),
  subtitles: present([
    issue.name,
  ]),
})

const progressFor = (entry: LibraryEntry) => {
  if (!entry.progress) return 0.0
  if (entry.progress.finished) return 1.0

  return entry.progress.currentPage / entry.progress.pageCount
}

function present<T>(arr: (T | undefined | null)[]): T[] {
  return arr.filter(elem => elem !== undefined && elem !== null) as T[]
}
