import { ReactNode } from 'react'
import { DependencyProvider, DependencyMap } from 'react-use-dependency'

export interface MockDependencyProviderProps {
  children?: ReactNode
  value?: DependencyMap
}

const defaults: DependencyMap = {
  useCollections: () => {
    return { collections: [], loading: false }
  },
  useCollectionDirectoryTree: () => {
    const tree = { name: null, path: null, directories: [] }
    return { tree, loading: false }
  },
}

export { DependencyMap }
export const MockDependencyProvider = ({ value = {}, ...rest }: MockDependencyProviderProps) => {
  return (
    <DependencyProvider {...rest} value={{ ...defaults, ...value }} />
  )
}
