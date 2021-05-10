import styled from '@emotion/styled'
import { Switch, Route, useLocation, useParams } from 'react-router'
import { useState } from 'react'
import qs from 'query-string'
import { Comic } from '@comix/ui/components/Comic'
import { Spinner } from '@comix/ui/components/Spinner'
import { useComicReader } from '@comix/ui/hooks/useComicReader'
import { useComic } from '@comix/ui/hooks/useComic'
import { SidebarView } from './Sidebar'
import { DirectoryPageView } from './DirectoryPage'
import { StatusView } from './Status'
import { VolumePageView } from './VolumePage'
import { CreditType } from '@comix/ui'
import { CreditPageView } from './CreditPage'

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
      <SideContainer>
        <SidebarContainer>
          <SidebarView />
        </SidebarContainer>
        <StatusContainer>
          <StatusView />
        </StatusContainer>
      </SideContainer>

      <ContentContainer>
        <Switch>
          <Route path="/directory" children={<DirectoryRoute onSelectComic={file => setFile(file)} />} />
          <Route path="/volume/:source/:sourceId" children={<VolumeRoute onSelectComic={file => setFile(file)} />} />
          <Route path="/character/:source/:sourceId" children={<CreditRoute type="character" onSelectComic={file => setFile(file)} />} />
          <Route path="/concept/:source/:sourceId" children={<CreditRoute type="concept" onSelectComic={file => setFile(file)} />} />
          <Route path="/location/:source/:sourceId" children={<CreditRoute type="location" onSelectComic={file => setFile(file)} />} />
          <Route path="/object/:source/:sourceId" children={<CreditRoute type="object" onSelectComic={file => setFile(file)} />} />
          <Route path="/person/:source/:sourceId" children={<CreditRoute type="person" onSelectComic={file => setFile(file)} />} />
          <Route path="/storyArc/:source/:sourceId" children={<CreditRoute type="storyArc" onSelectComic={file => setFile(file)} />} />
          <Route path="/team/:source/:sourceId" children={<CreditRoute type="team" onSelectComic={file => setFile(file)} />} />
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

const VolumeRoute = ({ onSelectComic }: { onSelectComic: (file: File) => void }) => {
  const params = useParams<{ source: string, sourceId: string }>()

  return (
    <VolumePageView
      volumeIdentifier={{ source: params.source, sourceId: params.sourceId }}
      onSelectFile={file => onSelectComic(file)}
    />
  )
}

const CreditRoute = ({ type, onSelectComic }: { type: CreditType, onSelectComic: (file: File) => void }) => {
  const params = useParams<{ source: string, sourceId: string }>()

  return (
    <CreditPageView
      type={type}
      creditIdentifier={{ source: params.source, sourceId: params.sourceId }}
      onSelectFile={file => onSelectComic(file)}
    />
  )
}

const Main = styled.main`
  display: flex;
  position: relative;
`

const SideContainer = styled.section`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 260px;

  background: #F1F2F6;
  border-right: 1px solid #dfe4ea;

  display: flex;
  flex-direction: column;
  overflow: auto;
`

const SidebarContainer = styled.section`
  flex: auto;
  padding: 20px;
  padding-bottom: 120px;
  z-index: 30;
`

const StatusContainer = styled.section`
  position: fixed;
  bottom: 0px;
  left: 0px;
  z-index: 40;

  background: #F1F2F6;
  border-top: 1px solid #dfe4ea;
  padding: 20px;
  height: 60px;
  width: 220px;
`

const ContentContainer = styled.section`
  position: fixed;
  top: 0px;
  left: 261px;
  height: 100%;
  width: calc(100% - 261px);
  overflow: auto;
`
