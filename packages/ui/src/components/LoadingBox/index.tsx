import React, { CSSProperties, ReactNode } from 'react'
import styled from '@emotion/styled'

export interface LoadingBoxProps {
  width: CSSProperties['width']
  height: CSSProperties['height']
  children?: ReactNode
  style?: CSSProperties
}

export const LoadingBox = ({ width, height, style, children }: LoadingBoxProps) => {
  return (
    <Loading width={width} height={height} style={style}>
      <LoadingContent>
        {children}
      </LoadingContent>
    </Loading>
  )
}

const LoadingContent = styled.div`
  position: absolute;
  z-index: 20;
  display: flex;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: #747d8c;
`

const Loading = styled.div<LoadingBoxProps>`
  @keyframes loading {
    from {
      left: -320px;
    }

    to {
      left: calc(100% + 320px);
    }
  }

  display: flex;
  position: relative;
  width: 100%;
  height: ${props => props.height};
  overflow: hidden;

  &:before,
  &:after {
    content: '';
    position: absolute;
    left: 0px;
    top: 0px;
    height: 100%;
  }

  &:before {
    width: ${props => props.width};
    background: #dfe4ea;
    z-index: 10;
  }

  &:after {
    width: 320px;
    z-index: 30;
    animation: 2s infinite loading;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0) 99%
    );
  }
`
