import { LibraryCollection } from '@comix/ui'
import { SidebarOption } from '@comix/ui/components/Sidebar'
import { UseVolumesHook } from '@comix/ui/hooks/useVolumes'
import { useHook } from 'react-use-dependency'
import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { byKey } from '../helpers/util'

export const SidebarVolumes = ({ collection }: { collection: LibraryCollection }) => {
  const params = useParams<{ source: string, sourceId: string }>()
  const { volumes: loadedVolumes, loading } = useHook<UseVolumesHook>('useVolumes', collection.path)
  const volumes = useMemo(() => [...loadedVolumes || []].sort(byKey('name')), [loadedVolumes])

  return (
    <div data-testid={`${collection.path}-volumes`}>
      {loading && <SidebarOption loading={loading} />}

      {volumes.map(volume => (
        <Link key={volume.sourceId} to={`/volume/${volume.source}/${volume.sourceId}`}>
          <SidebarOption
            data-testid={volume.sourceId}
            selected={params.source === volume.source && params.sourceId === volume.sourceId}
          >
            {volume.name}
          </SidebarOption>
        </Link>
      ))}
    </div>
  )
}
