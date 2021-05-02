import { ReactNode } from 'react'
import styled from '@emotion/styled'
import { Sentence } from '../LoadableText'

export interface SidebarProps {
  children: ReactNode
}

export interface SidebarHeadingProps {
  loading?: boolean
  text?: string
}

export interface SidebarOptionProps {
  loading?: boolean
  text?: string
  selected?: boolean
  onClick?: () => void
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <Container role="navigation" {...props}>
      {props.children}
    </Container>
  )
}

export const SidebarHeading = (props: SidebarHeadingProps) => {
  return (
    <SidebarHeadingContainer {...props}>
      <Sentence loading={props.loading}>{() => props.text || ''}</Sentence>
    </SidebarHeadingContainer>
  )
}

export const SidebarOption = (props: SidebarOptionProps) => {
  return (
    <SidebarOptionContainer {...props}>
      <Sentence loading={props.loading}>{() => props.text || ''}</Sentence>
    </SidebarOptionContainer>
  )
}

const Container = styled.aside`
  display: flex;
  flex-direction: column;

  height: 100%;
  width: 100%;

  background: #F1F2F6;

  div {
    display: flex;
    flex-direction: column;
  }
`

const SidebarHeadingContainer = styled.span`
  padding: 16px 16px 8px;

  cursor: default;
  color: #A4B0BE;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: bold;
`

const SidebarOptionContainer = styled.span<SidebarOptionProps>`
  padding: 6px 16px 6px;

  cursor: ${props => props.loading ? 'default' : 'pointer'};
  color: ${props => props.selected ? '#3742FA' : '#57606F'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  font-size: 1rem;

  &:hover {
    color: ${props => props.selected ? '#3742FA' : '#2F3542'};
  }
`