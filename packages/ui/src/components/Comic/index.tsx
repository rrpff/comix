/** @jsxImportSource @emotion/react **/
import styled from '@emotion/styled'
import { useRef } from 'react'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { RiFullscreenLine, RiFullscreenExitLine } from 'react-icons/ri'
import { IoIosClose } from 'react-icons/io'
import { ProgressBar } from '../ProgressBar'
import { useComic } from '../../hooks/useComic'
import { useMouseIsActive } from '../../hooks/useMouseIsActive'
import { useFullscreen } from '../../hooks/useFullscreen'
import { useKeymap } from '../../hooks/useKeymap'
import { useHover } from '../../hooks/useHover'

export type ComicProps = ReturnType<typeof useComic> & {
  closable?: boolean
  onClose?: () => void
}

export const Comic = ({
  comic,
  currentPages,
  loading,
  name,
  next,
  preloadedPages,
  previous,
  closable = false,
  onClose = () => {},
}: ComicProps) => {
  const scrollTop = (animate = true) => {
    document.scrollingElement?.scrollTo({
      top: 0,
      left: 0,
      behavior: animate ? 'smooth' : 'auto'
    })
  }

  const scrollBottom = (animate = true) => {
    document.scrollingElement?.scrollTo({
      top: document.scrollingElement.scrollHeight,
      left: 0,
      behavior: animate ? 'smooth' : 'auto'
    })
  }

  const goPrevious = () => {
    scrollTop(false)
    previous?.call(null)
  }

  const goNext = () => {
    scrollTop(false)
    next?.call(null)
  }

  const navigationRef = useRef(null)
  const mouseIsOverNavigation = useHover(navigationRef.current)
  const mouseActive = useMouseIsActive(window, 1000)
  const [fullscreen, setFullscreen] = useFullscreen(document.scrollingElement)

  useKeymap(window, {
    keydown: {
      ArrowLeft: goPrevious,
      ArrowRight: goNext,
      ArrowUp: (e) => {
        e.preventDefault()
        scrollTop()
      },
      ArrowDown: (e) => {
        e.preventDefault()
        scrollBottom()
      },
      f: () => setFullscreen(!fullscreen),
      Escape: () => closable && onClose(),
    }
  })

  if (loading) return <span>Loading...</span>

  const currentPageIndex = currentPages[0].index
  const numPages = comic!.images.length
  const progress = currentPageIndex / numPages
  const chromeVisible = mouseActive || mouseIsOverNavigation

  return (
    <article>
      <ProgressContainerStyle visible={chromeVisible}>
        <ProgressBar progress={progress} barStyles={{ background: '#fff', boxShadow: '0px 2px 5px rgba(255, 255, 255, 0.4)' }} />
      </ProgressContainerStyle>

      <ComicNavigation ref={navigationRef} visible={chromeVisible}>
        <ComicNavigationHeading>{name}</ComicNavigationHeading>
        <ComicNavigationOption onClick={() => setFullscreen(!fullscreen)}>
          {fullscreen ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
        </ComicNavigationOption>
        {closable && <ComicNavigationOption onClick={onClose}><IoIosClose /></ComicNavigationOption>}
      </ComicNavigation>

      <PagesContainer>
        <PageSideButton
          visible={chromeVisible}
          side="left"
          href="#!"
          onClick={e => { e.preventDefault(); goPrevious() }}
        >
          <AiFillCaretLeft />
        </PageSideButton>

        <PageSideButton
          visible={chromeVisible}
          side="right"
          href="#!"
          onClick={e => { e.preventDefault(); goNext() }}
        >
          <AiFillCaretRight />
        </PageSideButton>

        {currentPages.map((page, index) => {
          const isNotCover = page.index !== 0
          const isDoublePage = page.type === 'double'

          return (
            <Page
              key={`${name}-${page.index}`}
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
              key={`${name}-${page.index}`}
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

const ProgressContainerStyle = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 5px;
  z-index: 50;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.4s ease-in-out;
`

const ComicNavigation = styled.nav<{ visible: boolean }>`
  position: fixed;
  top: 0px;
  left: 0px;
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.0) 100%);
  color: #fff;
  display: flex;
  width: 100%;
  z-index: 40;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.4s ease-in-out;
  justify-content: space-between;
`

const ComicNavigationHeading = styled.div`
  font-weight: bold;
  padding: 20px;
  flex-grow: 1;
`

const ComicNavigationOption = styled.div`
  cursor: pointer;
  padding: 14px;
  flex-grow: 0;
  font-size: 32px;
`

const PagesContainer = styled.section`
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  z-index: 0;

  &:before {
    content: '';
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: 10;
    background: black;
  }
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

const PageSideButton = styled.a<{ visible: boolean, side: 'left' | 'right' }>`
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
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.4s ease-in-out, padding 0.15s ease-in-out;

  svg {
    filter: drop-shadow( 0px 1px 1px rgba(0, 0, 0, .75)) drop-shadow(0px 1px 3px rgba(0, 0, 0, .5));
  }

  &:hover {
    padding: ${props => props.side === 'left' ? '0px 25px 0px 15px' : '0px 15px 0px 25px'};
  }
`
