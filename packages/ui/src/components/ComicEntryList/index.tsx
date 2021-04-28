import { ComicEntry, ComicEntryProps } from '../ComicEntry'

export interface ComicEntryListProps {
  comics: ComicEntryProps[]
  onClickComic?: (comic: ComicEntryProps) => void
}

export const ComicEntryList = (props: ComicEntryListProps) => {
  return (
    <div>
      {props.comics.map(comic =>
        <ComicEntry
          {...comic}
          key={comic.imageUrl}
          onClick={() => props.onClickComic?.call(props.onClickComic, comic)}
        />
      )}
    </div>
  )
}
