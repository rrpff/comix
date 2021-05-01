import styled from '@emotion/styled'
import { SidebarView } from './Sidebar'

export const Chrome = () => {
  return (
    <Main>
      <SidebarContainer>
        <SidebarView />
      </SidebarContainer>
    </Main>
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
`
