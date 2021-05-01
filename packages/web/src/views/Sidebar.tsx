import { gql, useQuery } from '@apollo/client'
import { Directory, LibraryCollection } from '@comix/ui'
import { Sidebar, SidebarHeading, SidebarOption } from '@comix/ui/components/Sidebar'

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

const SidebarDirectory = ({ collection }: { collection: LibraryCollection }) => {
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

      {data?.directory.directories?.map(directory =>
        <SidebarOption
          key={directory.path}
          data-testid={directory.path}
          text={directory.name}
        />
      )}
    </div>
  )
}
