/** @jsxImportSource @emotion/react **/
import { css } from '@emotion/react'
import { ComicPageWithUrl } from '../../hooks/useComic'

export interface ComicProps {
  currentPages: ComicPageWithUrl[]
  preloadedPages?: ComicPageWithUrl[]
  next?: () => void
  previous?: () => void
  goto?: (page: number) => void
  loading: boolean
}

const navStyle = () => css`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 20px;
  width: calc(100% - 40px);
  z-index: 40;
`

const pagesContainerStyle = () => css`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 0;
`

const pageStyle = ({ visible, left, size }: { visible: boolean, left: boolean, size: string }) => css`
  position: absolute;
  top: 0;
  left: ${left ? '0%' : '50%'};
  opacity: ${visible ? 1 : 0};
  pointer-events: ${visible ? 'auto' : 'none'};
  width: ${size === 'single' ? '50' : '100'}%;
  z-index: ${visible ? 20 : 0};
`

export const Comic = ({ loading, previous, next, currentPages, preloadedPages }: ComicProps) => {
  if (loading) return <span>Loading...</span>

  return (
    <article>
      <nav css={navStyle()}>
        <button onClick={previous}>previous</button>
        <button onClick={next}>next</button>
      </nav>

      <section css={pagesContainerStyle()}>
        {currentPages.map((page, index) => {
          const isNotCover = page.index !== 0
          const isDoublePage = page.type === 'double'

          return (
            <img
              css={pageStyle({
                visible: true,
                left: index === 0 && (isNotCover || isDoublePage),
                size: page.type,
              })}
              key={page.index}
              src={page.url}
              alt=""
            />
          )
        })}

        {preloadedPages?.map(page => {
          return (
            <img
              css={pageStyle({ visible: false, left: true, size: page.type })}
              key={page.index}
              src={page.url}
              alt=""
            />
          )
        })}
      </section>
    </article>
  )
}
