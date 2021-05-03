import React, { CSSProperties, ReactNode } from 'react'
import { LoadingBox } from '../LoadingBox'

export interface LoadableTextProps<T> {
  loading?: boolean
  loadingWidth?: CSSProperties['width']
  children: () => T
  style?: CSSProperties
}

const H1_STYLES = {
  margin: '0px',
  padding: '0px',
  marginBottom: '1rem',
  fontSize: '2rem',
  lineHeight: '2.4rem',
}

const H2_STYLES = {
  margin: '0px',
  padding: '0px',
  marginBottom: '0.8rem',
  fontSize: '1.5rem',
  lineHeight: '1.8rem',
}

const SPAN_STYLES = {
  margin: '0px',
  padding: '0px',
  marginBottom: '0rem',
  fontSize: '1rem',
  lineHeight: '1.2rem',
}

const P_STYLES = {
  margin: '0px',
  padding: '0px',
  marginBottom: '1rem',
  fontSize: '1rem',
  lineHeight: '1.2rem',
}

export const Title = (props: LoadableTextProps<string | ReactNode>) => {
  const styles = { ...H1_STYLES, ...(props.style || {}) }

  if (props.loading) return <>
    <LoadingBox width={props.loadingWidth || '80%'} height={styles.fontSize} style={{ ...styles }} />
  </>

  return (
    <h1 style={styles}>{props.children()}</h1>
  )
}

export const Subtitle = (props: LoadableTextProps<string | ReactNode>) => {
  const styles = { ...H2_STYLES, ...(props.style || {}) }

  if (props.loading) return <>
    <LoadingBox width={props.loadingWidth || '66%'} height={styles.fontSize} style={{ ...styles, marginBottom: '0.3rem' }} />
    <LoadingBox width={props.loadingWidth || '33%'} height={styles.fontSize} style={{ ...styles }} />
  </>

  return (
    <h2 style={styles}>{props.children()}</h2>
  )
}

export const Sentence = (props: LoadableTextProps<string | ReactNode>) => {
  const styles = { ...SPAN_STYLES, ...(props.style || {}) }

  if (props.loading) return <>
    <LoadingBox width={props.loadingWidth || '66%'} height={styles.fontSize} style={{ ...styles }} />
  </>

  return (
    <span style={styles}>{props.children()}</span>
  )
}

export const Paragraph = (props: LoadableTextProps<string | ReactNode>) => {
  const styles = { ...P_STYLES, ...(props.style || {}) }

  if (props.loading) return <>
    <LoadingBox width={props.loadingWidth || `${90 + Math.random() * 10}%`} height={styles.fontSize} style={{ ...styles, marginBottom: '0.2rem' }} />
    <LoadingBox width={props.loadingWidth || `${90 + Math.random() * 10}%`} height={styles.fontSize} style={{ ...styles, marginBottom: '0.2rem' }} />
    <LoadingBox width={props.loadingWidth || `${90 + Math.random() * 10}%`} height={styles.fontSize} style={{ ...styles, marginBottom: '0.2rem' }} />
    <LoadingBox width={props.loadingWidth || `${90 + Math.random() * 10}%`} height={styles.fontSize} style={{ ...styles, marginBottom: '0.2rem' }} />
    <LoadingBox width={props.loadingWidth || `${90 + Math.random() * 10}%`} height={styles.fontSize} style={{ ...styles }} />
  </>

  return (
    <p style={styles}>{props.children()}</p>
  )
}

export const Paragraphs = (props: LoadableTextProps<string>) => {
  if (props.loading) return <>
    <Paragraph loading={true} children={() => ''} />
    <Paragraph loading={true} children={() => ''} />
    <Paragraph loading={true} children={() => ''} />
  </>

  const text = props.children()
  const paragraphs = text.split('\n')

  return (
    <>
      {paragraphs.map(paragraph =>
        <Paragraph {...props}>{() => (
          paragraph
        )}</Paragraph>
      )}
    </>
  )
}
