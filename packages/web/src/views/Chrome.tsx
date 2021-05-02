import styled from '@emotion/styled'
import { Switch, Route, useLocation } from 'react-router'
import { useState } from 'react'
import qs from 'query-string'
import { Comic } from '@comix/ui/components/Comic'
import { Spinner } from '@comix/ui/components/Spinner'
import { useComicReader } from '@comix/ui/hooks/useComicReader'
import { useComic } from '@comix/ui/hooks/useComic'
import { SidebarView } from './Sidebar'
import { DirectoryPageView } from './DirectoryPage'

export const Chrome = () => {
  const [file, setFile] = useState(undefined as File | undefined)
  const reader = useComicReader(file)
  const comic = useComic(reader)

  const isComicLoading = !!(file && comic.loading)
  const isComicLoaded = !!(file && !comic.loading)

  if (isComicLoaded) return <Comic {...comic} closable onClose={() => setFile(undefined)} />

  return (
    <Main>
      {isComicLoading && <ComicLoading />}
      <SidebarContainer>
        <SidebarView />
      </SidebarContainer>

      <ContentContainer>
        <Switch>
          <Route path="/directory" children={<DirectoryRoute onSelectComic={file => setFile(file)} />} />
        </Switch>
      </ContentContainer>
    </Main>
  )
}

const ComicLoading = () => {
  return (
    <Blackout>
      <Spinner size="4rem" />
    </Blackout>
  )
}

const Blackout = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 90;
  background: rgba(255, 255, 255, 0.8);
  color: #2f3542;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
`

const DirectoryRoute = ({ onSelectComic }: { onSelectComic: (file: File) => void }) => {
  const location = useLocation()
  const query = qs.parse(location.search)

  return (
    <DirectoryPageView
      directoryPath={query.directoryPath as string}
      collectionPath={query.collectionPath as string}
      onSelectFile={file => onSelectComic(file)}
    />
  )
}

const Main = styled.main`
  display: flex;
  position: relative;
`

const SidebarContainer = styled.section`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 220px;
  padding: 20px;
  background: #F1F2F6;
  border-right: 1px solid #dfe4ea;
  overflow: auto;
`

const ContentContainer = styled.section`
  position: fixed;
  top: 0px;
  left: 261px;
  height: 100%;
  width: calc(100% - 261px);
  overflow: auto;
`
