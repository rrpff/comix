import { LibraryIdentifier, LibraryIssue, LibraryVolume } from '@comix/ui'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { UseVolumeHook } from '@comix/ui/hooks/useVolume'
import { ComicEntryProps } from '@comix/ui/components/ComicEntry'
import { useHook } from 'react-use-dependency'
import { useMemo } from 'react'
import { byKey } from '../helpers/util'

export interface VolumePageViewProps {
  volumeIdentifier: LibraryIdentifier
  onSelectFile?: (file: File) => void
}

export const VolumePageView = ({
  volumeIdentifier,
  onSelectFile = () => {},
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
const toComicEntry = (volume: LibraryVolume, issue: LibraryIssue): ComicEntryProps => ({
  imageUrl: `${IMAGE_HOST}/${issue.entries![0].entry.coverFileName}`,
  title: `${volume.name} #${issue.issueNumber}`,
  id: `${issue.source}_${issue.sourceId}`,
  reference: issue,
  subtitles: present([
    issue.name,
  ]),
})

function present<T>(arr: (T | undefined | null)[]): T[] {
  return arr.filter(elem => elem !== undefined && elem !== null) as T[]
}
