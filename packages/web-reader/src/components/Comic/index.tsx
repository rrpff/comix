/** @jsxImportSource @emotion/react **/
import styled from '@emotion/styled'
import { Comic as ComixComic } from '@comix/parser'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { ProgressBar } from '../ProgressBar'
import { ComicPageWithUrl } from '../../hooks/useComic'

export interface ComicProps {
  currentPages: ComicPageWithUrl[]
  preloadedPages?: ComicPageWithUrl[]
  next?: () => void
  previous?: () => void
  goto?: (page: number) => void
  loading: boolean
  name?: string
  comic?: ComixComic
}

export const Comic = ({ name, comic, loading, previous, next, currentPages, preloadedPages }: ComicProps) => {
  if (loading) return <span>Loading...</span>

  const currentPageIndex = currentPages[0].index
  const numPages = comic!.images.length
  const progress = currentPageIndex / numPages

  return (
    <article>
      <ProgressContainerStyle>
        <ProgressBar progress={progress} barStyles={{ background: '#fff', boxShadow: '0px 2px 5px rgba(255, 255, 255, 0.4)' }} />
      </ProgressContainerStyle>

      <ComicNavigation>
        <strong>{name}</strong>
      </ComicNavigation>

      <PagesContainer>
        <PageSideButton href="#!" side="left" onClick={e => { e.preventDefault(); previous?.call(null) }}>
          <AiFillCaretLeft />
        </PageSideButton>

        <PageSideButton href="#!" side="right" onClick={e => { e.preventDefault(); next?.call(null) }}>
          <AiFillCaretRight />
        </PageSideButton>

        {currentPages.map((page, index) => {
          const isNotCover = page.index !== 0
          const isDoublePage = page.type === 'double'

          return (
            <Page
              key={page.index}
              src={page.url}
              alt=""
              visible={true}
              left={index === 0 && (isNotCover || isDoublePage)}
              size={page.type as 'single' | 'double'}
            />
          )
        })}

        {preloadedPages?.map(page => {
          return (
            <Page
              key={page.index}
              src={page.url}
              alt=""
              visible={false}
              left={true}
              size={page.type as 'single' | 'double'}
            />
          )
        })}
      </PagesContainer>
    </article>
  )
}

const ProgressContainerStyle = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 5px;
  z-index: 50;
`

const ComicNavigation = styled.nav`
  position: fixed;
  top: 0px;
  left: 0px;
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.0) 100%);
  color: #fff;
  display: flex;
  padding: 20px;
  width: calc(100% - 40px);
  z-index: 40;
`

const PagesContainer = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 0;
  background: #000;
`

const Page = styled.img<{ visible: boolean, left: boolean, size: 'single' | 'double' }>`
  position: absolute;
  top: 0;
  left: ${props => props.left ? '0%' : '50%'};
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  width: ${props => props.size === 'single' ? '50' : '100'}%;
  z-index: ${props => props.visible ? 20 : 0};
`

const PageSideButton = styled.a<{ side: 'left' | 'right' }>`
  position: fixed;
  display: flex;
  top: 0px;
  ${props => props.side}: 0px;
  justify-content: ${props => props.side};
  align-items: center;
  padding: 0px 20px;
  height: 100%;
  width: 15%;
  z-index: 30;
  color: #fff;
  font-size: 48px;
  transition: padding 0.15s ease-in-out;

  svg {
    filter: drop-shadow( 0px 1px 1px rgba(0, 0, 0, .75)) drop-shadow(0px 1px 3px rgba(0, 0, 0, .5));
  }

  &:hover {
    padding: ${props => props.side === 'left' ? '0px 25px 0px 15px' : '0px 15px 0px 25px'};
  }
`
