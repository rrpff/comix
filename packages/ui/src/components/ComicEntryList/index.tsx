import { ComicEntry, ComicEntryProps } from '../ComicEntry'

export interface ComicEntryListProps {
  comics: ComicEntryProps[]
  loading?: boolean
  onClickComic?: (comic: ComicEntryProps) => void
}

export const ComicEntryList = ({
  comics,
  loading = false,
  onClickComic = () => {},
}: ComicEntryListProps) => {
  if (loading) {
    return (
      <div>
        <ComicEntry loading />
        <ComicEntry loading />
        <ComicEntry loading />
        <ComicEntry loading />
        <ComicEntry loading />
      </div>
    )
  }

  return (
    <div>
      {comics.map(comic =>
        <ComicEntry
          {...comic}
          key={comic.imageUrl}
          onClick={() => onClickComic(comic)}
        />
      )}
    </div>
  )
}
