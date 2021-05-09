import { useHook } from 'react-use-dependency'
import { Sidebar, SidebarHeading } from '@comix/ui/components/Sidebar'
import { UseCollectionsHook } from '@comix/ui/hooks/useCollections'
import { SidebarDirectory } from '../containers/SidebarDirectory'

export const SidebarView = () => {
  const { collections, loading } = useHook<UseCollectionsHook>('useCollections')

  return (
    <Sidebar data-testid="sidebar">
      {loading
        ? <SidebarHeading loading />
        : (
          <div data-testid="collections">
            {collections.map(collection =>
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
