import styled from '@emotion/styled'
import { Switch, Route, useLocation } from 'react-router'
import qs from 'query-string'
import { SidebarView } from './Sidebar'
import { DirectoryPageView } from './DirectoryPage'

export const Chrome = () => {
  return (
    <Main>
      <SidebarContainer>
        <SidebarView />
      </SidebarContainer>

      <ContentContainer>
        <Switch>
          <Route path="/directory" children={<DirectoryRoute />} />
        </Switch>
      </ContentContainer>
    </Main>
  )
}

const DirectoryRoute = () => {
  const location = useLocation()
  const query = qs.parse(location.search)

  return (
    <DirectoryPageView
      directoryPath={query.directoryPath as string}
      collectionPath={query.collectionPath as string}
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
  overflow: auto;
`

const ContentContainer = styled.section`
  position: fixed;
  top: 0px;
  left: 220px;
  height: 100%;
  width: calc(100% - 220px);
  overflow: auto;
`
