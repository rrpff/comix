import { ReactNode } from 'react'
import styled from '@emotion/styled'
import { Title, Sentence } from '../LoadableText'

export interface PageContentProps {
  loading?: boolean
  title?: string
  category?: string
  children?: ReactNode
  'data-testid'?: any
}

export const PageContent = ({
  loading = false,
  title = '',
  category = '',
  children = null,
  ...rest
}: PageContentProps) => {
  return (
    <Container {...rest}>
      <Header>
        <Sentence
          loading={loading}
          loadingWidth="60px"
          children={() => category || ''}
          style={{ color: '#A4B0BE', textTransform: 'uppercase', fontWeight: 'bold' }}
        />
        <Title
          loading={loading}
          loadingWidth="280px"
          children={() => title || ''}
          style={{ fontWeight: 900, marginTop: 6 }}
        />
      </Header>

      <article>
        {children}
      </article>
    </Container>
  )
}

const Container = styled.main`
  padding: 36px;
`

const Header = styled.header`
  padding: 0px 20px;
`
