import styled from '@emotion/styled'
import { LibraryCollection, UseCollectionDirectoryTreeHook } from '@comix/ui'
import { SidebarOption } from '@comix/ui/components/Sidebar'
import { DirectoryTree } from '@comix/ui/components/DirectoryTree'
import { AiFillCaretRight } from 'react-icons/ai'
import { Link, useLocation } from 'react-router-dom'
import { useHook } from 'react-use-dependency'

export const SidebarDirectory = ({ collection }: { collection: LibraryCollection }) => {
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
