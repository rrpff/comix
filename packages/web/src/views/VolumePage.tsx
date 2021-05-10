import { LibraryEntry, LibraryIdentifier, LibraryIssue, LibraryVolume, UseVolumeHook } from '@comix/ui'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { ComicEntryProps } from '@comix/ui/components/ComicEntry'
import { useHook } from 'react-use-dependency'
import { useMemo } from 'react'
import { byKey } from '../helpers/util'

export interface VolumePageViewProps {
  volumeIdentifier: LibraryIdentifier
  onSelectEntry?: (entry: LibraryEntry) => void
}

export const VolumePageView = ({
  volumeIdentifier,
  onSelectEntry = () => {},
}: VolumePageViewProps) => {
  const { volume, loading } = useHook<UseVolumeHook>('useVolume', volumeIdentifier)
  const comics = useMemo(() => {
    return volume?.issues !== undefined
      ? [...volume.issues!].sort(byKey('issueNumber')).map(issue => toComicEntry(volume, issue))
      : []
  }, [volume])

  return (
    <PageContent loading={loading} title={volume?.name} category="Volume" data-testid="container">
      <section data-testid="contents">
        <ComicEntryList
          comics={comics}
          loading={loading}
          onClickComic={async comic => {
            const issue = comic.reference as LibraryIssue
            const entry = issue!.entries![0]

            onSelectEntry(entry.entry)
          }}
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images/small'

// TODO: use entry for current collection
const toComicEntry = (volume: LibraryVolume, issue: LibraryIssue): ComicEntryProps => ({
  imageUrl: `${IMAGE_HOST}/${issue.entries![0].entry.coverFileName}`,
  title: `${volume.name} #${issue.issueNumber}`,
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
