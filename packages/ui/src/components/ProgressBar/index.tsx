import React, { CSSProperties } from 'react'
import styled from '@emotion/styled'

export interface ProgressBarProps {
  progress: number
  barStyles?: CSSProperties
}

export const ProgressBar = ({ progress, barStyles }: ProgressBarProps) => {
  const width =
    progress < 0 ? 0 :
    progress > 1 ? 100 :
    progress * 100

  return (
    <Container>
      <Bar data-testid="progress" width={width} style={barStyles || {}} />
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const Bar = styled.div<{ width: number }>`
  position: absolute;
  background: #272343;
  top: 0;
  left: 0;
  width: ${props => props.width}%;
  height: 100%;
`
