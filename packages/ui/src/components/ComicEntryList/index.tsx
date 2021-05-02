import styled from '@emotion/styled'
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
    <Container>
      {comics.sort(byTitle).map(comic =>
        <ComicEntry
          {...comic}
          key={comic.imageUrl}
          onClick={() => onClickComic(comic)}
        />
      )}
    </Container>
  )
}

const Container = styled.section`
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;

  &::after {
    content: '';
    flex: auto;
  }
`

const byTitle = (a: ComicEntryProps, b: ComicEntryProps) =>
  a.title === undefined && b.title === undefined ? 0 :
  a.title === undefined ? 1 :
  b.title === undefined ? -1 :
  a.title < b.title ? -1 :
  a.title > b.title ? 1 :
  0
