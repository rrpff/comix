import { useState } from 'react'
import { useHook } from 'react-use-dependency'
import { LibraryCollection, UseCollectionsHook } from '@comix/ui'
import { Sidebar, SidebarHeading } from '@comix/ui/components/Sidebar'
import { SidebarDirectory } from '../containers/SidebarDirectory'
import { SidebarVolumes } from '../containers/SidebarVolumes'
import { SidebarCredits } from '../containers/SidebarCredits'

export const SidebarView = () => {
  const { collections, loading } = useHook<UseCollectionsHook>('useCollections')
  const [viewMode, setViewMode] = useState('volumes')

  return (
    <Sidebar data-testid="sidebar">
      <select data-testid="view-mode" onChange={e => setViewMode(e.target.value)}>
        <option value="volumes">Volumes</option>
        <option value="directories">Directories</option>
        <option value="characters">Characters</option>
        <option value="concepts">Concepts</option>
        <option value="locations">Locations</option>
        <option value="objects">Objects</option>
        <option value="people">People</option>
        <option value="storyArcs">Story Arcs</option>
        <option value="teams">Teams</option>
      </select>

      {loading
        ? <SidebarHeading loading />
        : (
          <div data-testid="collections">
            {collections.map(collection =>
              <div key={collection.path} data-testid={collection.path}>
                <SidebarHeading>{collection.name}</SidebarHeading>
                <SidebarViewModeContents viewMode={viewMode} collection={collection} />
              </div>
            )}
          </div>
        )
      }
    </Sidebar>
  )
}

const SidebarViewModeContents = (props: { collection: LibraryCollection, viewMode: string }) => {
  switch (props.viewMode) {
    case 'volumes': return <SidebarVolumes collection={props.collection} />
    case 'directories': return <SidebarDirectory collection={props.collection} />
    case 'characters': return <SidebarCredits type="character" collection={props.collection} />
    case 'concepts': return <SidebarCredits type="concept" collection={props.collection} />
    case 'locations': return <SidebarCredits type="location" collection={props.collection} />
    case 'objects': return <SidebarCredits type="object" collection={props.collection} />
    case 'people': return <SidebarCredits type="person" collection={props.collection} />
    case 'storyArcs': return <SidebarCredits type="storyArc" collection={props.collection} />
    case 'teams': return <SidebarCredits type="team" collection={props.collection} />
    default: return null
  }
}
