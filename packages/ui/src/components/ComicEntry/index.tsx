import styled from '@emotion/styled'
import { useState } from 'react'
import Measure from 'react-measure'
import { ProgressBar } from '../ProgressBar'

export interface ComicEntryProps {
  imageUrl: string
  title: string
  subtitles?: string[]
  readingProgress?: number
  onClick?: () => void
}

export const ComicEntry = ({ title, subtitles, imageUrl, readingProgress, onClick }: ComicEntryProps) => {
  const [imageSize, setImageSize] = useState({ width: -1, height: -1 })

  return (
    <Measure bounds onResize={rect =>
      setImageSize({
        width: rect.bounds?.width || -1,
        height: rect.bounds?.height || -1,
      })
    }>
      {({ measureRef }) =>
        <Container onClick={onClick} style={{ width: imageSize.width }}>
          <img ref={measureRef} src={imageUrl} alt={title} />
          <strong>{title}</strong>
          {subtitles?.map((subtitle, index) =>
            <span key={index}>{subtitle}</span>
          )}

          {readingProgress && (
            <Progress style={{ top: imageSize.height - 8 + 10 }}>
              <ProgressBar
                progress={readingProgress}
                barStyles={{
                  background: '#fff'
                }}
              />
            </Progress>
          )}
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
  position: relative;
  display: inline-flex;
  padding: 20px;
  flex-direction: column;
  word-wrap: break-word;
  text-align: center;

  img {
    align-self: center;
    height: 40vh;
    min-height: 240px;
    margin-bottom: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  }

  strong {
    color: #111;
  }

  span {
    color: #444;
  }
`
