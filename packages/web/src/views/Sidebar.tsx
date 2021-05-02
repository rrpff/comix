import { gql, useQuery, useApolloClient, ApolloClient } from '@apollo/client'
import { Directory, LibraryCollection } from '@comix/ui'
import { Sidebar, SidebarHeading, SidebarOption } from '@comix/ui/components/Sidebar'
import { DirectoryTree } from '@comix/ui/components/DirectoryTree'
import { Link, useLocation } from 'react-router-dom'
import { AiFillCaretRight } from 'react-icons/ai'
import styled from '@emotion/styled'

export const SidebarView = () => {
  const { data, loading } = useQuery<{ collections: LibraryCollection[] }>(COLLECTIONS_QUERY)

  return (
    <Sidebar data-testid="sidebar">
      {loading
        ? <SidebarHeading loading />
        : (
          <div data-testid="collections">
            {data?.collections.map(collection =>
              <div key={collection.path} data-testid={collection.path}>
                <SidebarHeading>{collection.name}</SidebarHeading>
                <SidebarDirectory collection={collection} />
              </div>
            )}
          </div>
        )
      }
    </Sidebar>
  )
}

export const COLLECTIONS_QUERY = gql`
  query {
    collections {
      name
      path
    }
  }
`

export const DIRECTORY_QUERY = gql`
  query run($input: DirectoryQuery!) {
    directory(input: $input) {
      name
      path
      directories {
        name
        path
      }
      files {
        name
        path
      }
    }
  }
`

const getDirectory = async (path: string, client: ApolloClient<any>): Promise<Directory> => {
  const result = await client.query<{ directory: Directory }>({ query: DIRECTORY_QUERY,
    variables: { input: { path } }
  })

  return result.data.directory
}

const Caret = styled(AiFillCaretRight, { shouldForwardProp: () => false })<{ visible: boolean, expanded: boolean }>`
  opacity: ${props => props.visible ? 1 : 0};
  color: #A4B0BE;
  font-size: 10px;
  position: absolute;
  margin-left: -12px;
  margin-top: 2px;
  transform: ${props => props.expanded ? 'scaleX(0.8)' : 'scaleY(0.8)'} rotate(${props => props.expanded ? '90deg' : '0deg'});
  transition: transform 0.2s;
`

const SidebarDirectory = ({ collection }: { collection: LibraryCollection }) => {
  const client = useApolloClient()
  const location = useLocation()
  const { data, loading } = useQuery<{ directory: Directory }>(DIRECTORY_QUERY, {
    variables: { input: { path: collection.path } }
  })

  return (
    <div data-testid={`${collection.path}-directory`}>
      <Link to={`/directory${directorySearch(data?.directory, collection)}`}>
        <SidebarOption
          loading={loading}
          data-testid={`${collection.path}-root`}
          selected={location.search === directorySearch(data?.directory, collection)}
        >
          (root)
        </SidebarOption>
      </Link>

      {data?.directory !== undefined && (
        <DirectoryTree
          directory={data.directory}
          load={path => getDirectory(path, client)}
          showFiles={false}
          renderDirectoryLabel={props => (
            <Link to={`/directory${directorySearch(props.directory, collection)}`}>
              <SidebarOption
                data-testid={props.directory.path}
                selected={location.search === directorySearch(props.directory, collection)}
                onClick={() => !props.isExpanded && props.expand()}
              >
                <Caret
                  visible={!props.directories || props.directories.length > 0}
                  expanded={props.isExpanded}
                  onClick={e => {
                    e.preventDefault()
                    props.toggle()
                  }}
                />
                {props.directory.name}
              </SidebarOption>
            </Link>
          )}
        />
      )}
    </div>
  )
}

const directorySearch = (directory?: Directory, collection?: LibraryCollection) =>
  `?directoryPath=${directory?.path}&collectionPath=${collection?.path}`
