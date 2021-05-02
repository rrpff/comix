import styled from '@emotion/styled'
import { useState } from 'react'
import Measure from 'react-measure'
import { ProgressBar } from '../ProgressBar'
import { Sentence } from '../LoadableText'
import { LoadingBox } from '../LoadingBox'

export interface ComicEntryProps {
  imageUrl?: string
  title?: string
  subtitles?: string[]
  readingProgress?: number
  loading?: boolean
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
            : <img ref={measureRef} src={imageUrl} alt={title} />
          }

          <strong>
            <Sentence loading={loading}>{() => title}</Sentence>
          </strong>

          {subtitles?.map((subtitle, index) =>
            <span>
              <Sentence key={index} loading={loading}>{() => subtitle}</Sentence>
            </span>
          )}

          {readingProgress ? (
            <Progress style={{ top: imageSize.height - 8 + 10 }}>
              <ProgressBar
                progress={readingProgress}
                barStyles={{
                  background: '#fff'
                }}
              />
            </Progress>
          ) : null}
        </Container>
      }
    </Measure>
  )
}

const Progress = styled.div`
  position: absolute;
  width: calc(100% - 60px);
  left: 30px;
  height: 8px;
  border-radius: 8px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75), 0px 0px 5px rgba(0, 0, 0, 0.75);
  background: rgba(0, 0, 0, 0.8);
  overflow: hidden;
`

const Container = styled.section`
  cursor: pointer;
  position: relative;
  display: inline-flex;
  padding: 20px;
  flex-direction: column;
  word-wrap: break-word;
  text-align: center;

  img {
    align-self: center;
    height: 240px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  }

  strong {
    margin-top: 12px;
    color: #111;
  }

  span {
    color: #444;
  }
`
