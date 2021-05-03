import { Directory, LibraryCollection } from '@comix/ui'

export const mapCollectionDirectoriesToDirectory = (collection: LibraryCollection, subdirs: { directory: string[] }[]) => {
  const base = {
    name: collection.name,
    path: collection.path,
    directories: []
  }

  return subdirs.reduce((dir: Directory, subdir) => {
    return applyDirectory(dir, subdir.directory)
  }, base)
}

const applyDirectory = (dir: Directory, paths: string[]): Directory => {
  const [root, ...remaining] = paths

  if (root === '') return dir

  // TODO: stop using / here. should be using path.sep from node somehow.
  const others = dir.directories?.filter(d => d.name !== root) || []
  const directory = dir.directories?.find(d => d.name === root)
    || { name: root, path: `${dir.path}/${root}`, directories: [] as Directory[] }

  const updatedDirectory = remaining.length > 0
    ? applyDirectory(directory, remaining)
    : directory

  return {
    name: dir.name,
    path: dir.path,
    directories: [
      ...others,
      updatedDirectory
    ].sort(byName)
  }
}

const byName = (a: Directory, b: Directory) =>
  a.name < b.name ? -1 :
  a.name > b.name ? 1 :
  0
