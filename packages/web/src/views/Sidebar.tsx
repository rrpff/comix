import { gql, useQuery, useApolloClient, ApolloClient } from '@apollo/client'
import { Directory, LibraryCollection } from '@comix/ui'
import { Sidebar, SidebarHeading, SidebarOption } from '@comix/ui/components/Sidebar'
import { DirectoryTree } from '@comix/ui/components/DirectoryTree'

export const SidebarView = () => {
  const { data, loading } = useQuery<{ collections: LibraryCollection[] }>(COLLECTIONS_QUERY)

  if (loading) return <span>Loading...</span>

  return (
    <Sidebar data-testid="sidebar">
      <div data-testid="collections">
        {data?.collections.map(collection =>
          <div key={collection.path} data-testid={collection.path}>
            <SidebarHeading text={collection.name} />
            <SidebarDirectory collection={collection} />
          </div>
        )}
      </div>
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

const SidebarDirectory = ({ collection }: { collection: LibraryCollection }) => {
  const client = useApolloClient()
  const { data, loading } = useQuery<{ directory: Directory }>(DIRECTORY_QUERY, {
    variables: { input: { path: collection.path } }
  })

  if (loading) return <span>Loading...</span>

  return (
    <div data-testid={`${collection.path}-directory`}>
      <SidebarOption
        data-testid={`${collection.path}-root`}
        text="(root)"
      />

      {data?.directory !== undefined && (
        <DirectoryTree
          directory={data.directory}
          load={path => getDirectory(path, client)}
          showFiles={false}
          renderDirectoryLabel={props => (
            <SidebarOption
              data-testid={props.directory.path}
              text={props.directory.name}
              onClick={() => props.toggle()}
            />
          )}
        />
      )}
    </div>
  )
}
