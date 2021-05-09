import React from 'react'
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
      {comics.map(comic =>
        <ComicEntry
          {...comic}
          key={comic.id}
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
