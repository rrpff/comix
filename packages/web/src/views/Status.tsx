import { useApolloClient, gql } from '@apollo/client'
import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Spinner } from '@comix/ui/components/Spinner'

export const CREATE_SUBSCRIPTION = gql`subscription { entryCreated { name } }`
export const UPDATE_SUBSCRIPTION = gql`subscription { entryUpdated { name } }`
export const DELETE_SUBSCRIPTION = gql`subscription { entryDeleted { path } }`
export const FINISH_SUBSCRIPTION = gql`subscription { libraryUpdateFinished { success } }`

export const UPDATE_LIBRARY_ENDPOINT = 'http://localhost:4000/update-library'

const refreshLibrary = () => fetch(UPDATE_LIBRARY_ENDPOINT, { method: 'POST' })

export const StatusView = () => {
  const client = useApolloClient()
  const [latestUpdate, setLatestUpdate] = useState({
    done: true,
    statusText: 'Up to date',
    statusSubtext: undefined as string | undefined
  })

  useEffect(() => {
    const createSubscriber = client
      .subscribe<{ entryCreated: { name: string } }>({ query: CREATE_SUBSCRIPTION })
      .subscribe(
        ({ data }) => setLatestUpdate({ done: false, statusText: 'Creating...', statusSubtext: data?.entryCreated.name }),
        (err) => { console.error(err) },
      )

    const updateSubscriber = client
      .subscribe<{ entryUpdated: { name: string } }>({ query: UPDATE_SUBSCRIPTION })
      .subscribe(
        ({ data }) => setLatestUpdate({ done: false, statusText: 'Updating...', statusSubtext: data?.entryUpdated.name }),
        (err) => { console.error(err) },
      )

    const deleteSubscriber = client
      .subscribe<{ entryDeleted: {} }>({ query: DELETE_SUBSCRIPTION })
      .subscribe(
        () => setLatestUpdate({ done: false, statusText: 'Cleaning up...', statusSubtext: undefined }),
        (err) => { console.error(err) },
      )

    const finishSubscriber = client
      .subscribe<{ libraryUpdateFinished: { success: boolean } }>({ query: FINISH_SUBSCRIPTION })
      .subscribe(
        () => setLatestUpdate({ done: true, statusText: 'Up to date', statusSubtext: undefined }),
        (err) => { console.error(err) },
      )

    return () => {
      createSubscriber.unsubscribe()
      updateSubscriber.unsubscribe()
      deleteSubscriber.unsubscribe()
      finishSubscriber.unsubscribe()
    }
  }, [client])

  return (
    <Container done={latestUpdate.done}>
      <Spinner />
      <strong data-testid="status-text">{latestUpdate.statusText}</strong>
      {latestUpdate.done
        ? <a onClick={() => refreshLibrary()} data-testid="status-refresh" href="#!">Refresh library</a>
        : <span data-testid="status-subtext">{latestUpdate.statusSubtext}</span>
      }
    </Container>
  )
}

const Container = styled.section<{ done: boolean }>`
  padding: 8px 16px;

  svg {
    position: absolute;
    font-size: 1rem;
    margin-left: -20px;
    margin-top: 24px;
    opacity: ${props => props.done ? 0 : 1};
    transition: opacity 0.3s;
  }

  strong {
    color: ${props => props.done ? '#A4B0BE' : '#2F3542'};
    display: block;
    margin-bottom: 8px;
  }

  span {
    display: block;
    color: #57606F;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    text-decoration: none;
    color: #57606F;

    &:hover {
      color: #3742FA;
    }
  }
`
