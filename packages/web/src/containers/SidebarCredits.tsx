import { CreditType, LibraryCollection, UseCreditsHook } from '@comix/ui'
import { SidebarOption } from '@comix/ui/components/Sidebar'
import { useHook } from 'react-use-dependency'
import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { byKey } from '../helpers/util'

export const SidebarCredits = ({ type, collection }: { type: CreditType, collection: LibraryCollection }) => {
  const params = useParams<{ source: string, sourceId: string }>()
  const { credits: loadedCredits, loading } = useHook<UseCreditsHook>('useCredits', collection.path, type)
  const credits = useMemo(() => [...loadedCredits || []].sort(byKey('name')), [loadedCredits])

  return (
    <div data-testid={`${collection.path}-credits-${type}`}>
      {loading && <SidebarOption loading={loading} />}

      {credits.map(credit => (
        <Link key={credit.sourceId} to={`/${type}/${credit.source}/${credit.sourceId}`}>
          <SidebarOption
            data-testid={credit.sourceId}
            selected={params.source === credit.source && params.sourceId === credit.sourceId}
          >
            {credit.name}
          </SidebarOption>
        </Link>
      ))}
    </div>
  )
}
