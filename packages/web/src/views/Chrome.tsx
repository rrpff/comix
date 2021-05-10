import styled from '@emotion/styled'
import { Switch, Route, useLocation, useParams } from 'react-router'
import { useState } from 'react'
import qs from 'query-string'
import { SidebarView } from './Sidebar'
import { DirectoryPageView } from './DirectoryPage'
import { StatusView } from './Status'
import { VolumePageView } from './VolumePage'
import { CreditType, LibraryEntry } from '@comix/ui'
import { CreditPageView } from './CreditPage'
import { ComicContainer } from 'src/containers/ComicContainer'

export const Chrome = () => {
  const [currentEntry, setCurrentEntry] = useState(null as LibraryEntry | null)

  return (
    <Main>
      <ComicContainer entry={currentEntry} />
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
          <Route path="/directory" children={<DirectoryRoute onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/volume/:source/:sourceId" children={<VolumeRoute onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/character/:source/:sourceId" children={<CreditRoute type="character" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/concept/:source/:sourceId" children={<CreditRoute type="concept" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/location/:source/:sourceId" children={<CreditRoute type="location" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/object/:source/:sourceId" children={<CreditRoute type="object" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/person/:source/:sourceId" children={<CreditRoute type="person" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/storyArc/:source/:sourceId" children={<CreditRoute type="storyArc" onSelectComic={entry => setCurrentEntry(entry)} />} />
          <Route path="/team/:source/:sourceId" children={<CreditRoute type="team" onSelectComic={entry => setCurrentEntry(entry)} />} />
        </Switch>
      </ContentContainer>
    </Main>
  )
}

const DirectoryRoute = ({ onSelectComic }: { onSelectComic: (entry: LibraryEntry) => void }) => {
  const location = useLocation()
  const query = qs.parse(location.search)

  return (
    <DirectoryPageView
      directoryPath={query.directoryPath as string}
      collectionPath={query.collectionPath as string}
      onSelectEntry={entry => onSelectComic(entry)}
    />
  )
}

const VolumeRoute = ({ onSelectComic }: { onSelectComic: (entry: LibraryEntry) => void }) => {
  const params = useParams<{ source: string, sourceId: string }>()

  return (
    <VolumePageView
      volumeIdentifier={{ source: params.source, sourceId: params.sourceId }}
      onSelectEntry={entry => onSelectComic(entry)}
    />
  )
}

const CreditRoute = ({ type, onSelectComic }: { type: CreditType, onSelectComic: (entry: LibraryEntry) => void }) => {
  const params = useParams<{ source: string, sourceId: string }>()

  return (
    <CreditPageView
      type={type}
      creditIdentifier={{ source: params.source, sourceId: params.sourceId }}
      onSelectEntry={entry => onSelectComic(entry)}
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
