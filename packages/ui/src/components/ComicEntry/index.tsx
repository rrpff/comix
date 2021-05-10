import styled from '@emotion/styled'
import React, { ForwardedRef, useState } from 'react'
import Measure from 'react-measure'
import { FaCheck } from 'react-icons/fa'
import { ProgressBar } from '../ProgressBar'
import { Sentence } from '../LoadableText'
import { LoadingBox } from '../LoadingBox'

export interface ComicEntryProps {
  imageUrl?: string
  title?: string
  subtitles?: string[]
  readingProgress?: number
  loading?: boolean
  reference?: any
  id?: string
  onClick?: () => void
}

export const ComicEntry = ({
  title = '',
  subtitles = [],
  imageUrl = '',
  readingProgress = 0,
  loading = false,
  onClick = () => {},
}: ComicEntryProps) => {
  const [imageSize, setImageSize] = useState({ width: 160, height: -1 })

  return (
    <Measure bounds onResize={rect =>
      setImageSize({
        width: rect.bounds?.width || -1,
        height: rect.bounds?.height || -1,
      })
    }>
      {({ measureRef }) =>
        <Container onClick={onClick} style={{ width: imageSize.width }} data-testid={title}>
          {loading
            ? <LoadingBox width="100%" height="240px" />
            : <CoverImage finished={readingProgress === 1.0} ref={measureRef} src={imageUrl} alt={title} />
          }

          <Progress style={{ top: imageSize.height - 8 + 10 }}>
            <ProgressBar
              progress={readingProgress}
              barStyles={{
                background: '#3742FA'
              }}
            />
          </Progress>

          <strong>
            <Sentence loading={loading}>{() => title}</Sentence>
          </strong>

          {subtitles?.map((subtitle, index) =>
            <span key={index}>
              <Sentence loading={loading}>{() => subtitle}</Sentence>
            </span>
          )}
        </Container>
      }
    </Measure>
  )
}

const CoverImage = React.forwardRef((props: { src: string, alt: string, finished: boolean }, ref: ForwardedRef<HTMLImageElement>) => {
  return (
    <div style={{ position: 'relative' }}>
      <img src={props.src} alt={props.alt} ref={ref} className="cover-image" />
      <Overlay visible={props.finished} className="cover-overlay">
        <FaCheck />
        Finished
      </Overlay>
    </div>
  )
})

const Overlay = styled.div<{ visible: boolean }>`
  position: absolute;
  left: 0px;
  top: 0px;
  height: 240px;
  width: 100%;
  background: #000;
  opacity: ${props => props.visible ? 0.7 : 0};
  z-index: 30;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.4rem;

  svg {
    font-size: 2.4rem;
    margin-bottom: 10px;
  }
`

const Progress = styled.div`
  height: 4px;
  border-radius: 3px;
  margin-top: 6px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
`

const Container = styled.section`
  cursor: pointer;
  position: relative;
  display: inline-flex;
  padding: 15px;
  margin: 5px;
  flex-direction: column;
  word-wrap: break-word;
  text-align: center;

  &:hover {
    .cover-image,
    .cover-overlay {
      transform: perspective(500px) rotateX(7deg) translateY(-10px) scale(1.05);
      box-shadow: 0px 12px 20px rgba(0, 0, 0, 0.3), 0px 8px 12px rgba(0, 0, 0, 0.2);
    }

    .cover-overlay {
      opacity: 0;
    }
  }

  .cover-image {
    position: relative;
    align-self: center;
    height: 240px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 20;
  }

  .cover-image,
  .cover-overlay {
    transition: opacity 0.2s, transform 0.4s, box-shadow 0.4s;
  }

  strong {
    margin-top: 12px;
    color: #111;
  }

  span {
    color: #444;
  }
`
