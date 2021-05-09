import styled from '@emotion/styled'
import { LibraryCollection } from '@comix/ui'
import { Sidebar, SidebarHeading, SidebarOption } from '@comix/ui/components/Sidebar'
import { DirectoryTree } from '@comix/ui/components/DirectoryTree'
import { UseCollectionsHook } from '@comix/ui/hooks/useCollections'
import { UseCollectionDirectoryTreeHook } from '@comix/ui/hooks/useCollectionDirectoryTree'
import { Link, useLocation } from 'react-router-dom'
import { AiFillCaretRight } from 'react-icons/ai'
import { useHook } from 'react-use-dependency'

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

const Caret = styled(AiFillCaretRight, { shouldForwardProp: () => false })<{ visible: boolean, expanded: boolean }>`
  opacity: ${props => props.visible ? 1 : 0};
  color: #A4B0BE;
  display: block;
  font-size: 10px;
  position: absolute;
  margin-left: -18px;
  margin-top: -4px;
  padding: 6px;
  transform: ${props => props.expanded ? 'scaleX(0.8)' : 'scaleY(0.8)'} rotate(${props => props.expanded ? '90deg' : '0deg'});
  transition: transform 0.2s;
`

const directorySearch = (directoryPath: string, collectionPath: string) =>
  `?directoryPath=${directoryPath}&collectionPath=${collectionPath}`

const SidebarDirectory = ({ collection }: { collection: LibraryCollection }) => {
  const location = useLocation()
  const { tree, loading } = useHook<UseCollectionDirectoryTreeHook>('useCollectionDirectoryTree', collection)

  return (
    <div data-testid={`${collection.path}-directory`}>
      <Link to={`/directory${directorySearch(collection.path, collection.path)}`}>
        <SidebarOption
          loading={loading}
          data-testid={`${collection.path}-root`}
          selected={location.search === directorySearch(collection.path, collection.path)}
        >
          (root)
        </SidebarOption>
      </Link>

      {tree !== undefined && (
        <DirectoryTree
          directory={tree}
          showFiles={false}
          renderDirectoryLabel={props => (
            <Link to={`/directory${directorySearch(props.directory.path, collection.path)}`}>
              <SidebarOption
                data-testid={props.directory.path}
                selected={location.search === directorySearch(props.directory.path, collection.path)}
                onClick={() => !props.isExpanded && props.expand()}
              >
                <Caret
                  visible={!!(props.directory.directories && props.directory.directories.length > 0)}
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
