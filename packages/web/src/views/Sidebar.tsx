import { useState } from 'react'
import { useHook } from 'react-use-dependency'
import { Sidebar, SidebarHeading } from '@comix/ui/components/Sidebar'
import { UseCollectionsHook } from '@comix/ui/hooks/useCollections'
import { SidebarDirectory } from '../containers/SidebarDirectory'
import { SidebarVolumes } from 'src/containers/SidebarVolumes'

export const SidebarView = () => {
  const { collections, loading } = useHook<UseCollectionsHook>('useCollections')
  const [viewMode, setViewMode] = useState('volumes')

  return (
    <Sidebar data-testid="sidebar">
      <select data-testid="view-mode" onChange={e => setViewMode(e.target.value)}>
        <option value="volumes">Volumes</option>
        <option value="directories">Directories</option>
      </select>

      {loading
        ? <SidebarHeading loading />
        : (
          <div data-testid="collections">
            {collections.map(collection =>
              <div key={collection.path} data-testid={collection.path}>
                <SidebarHeading>{collection.name}</SidebarHeading>
                {viewMode === 'volumes'
                  ? <SidebarVolumes collection={collection} />
                  : <SidebarDirectory collection={collection} />
                }
              </div>
            )}
          </div>
        )
      }
    </Sidebar>
  )
}
