import { ReactNode, useState } from 'react'

interface File {
  name: string
  path: string
}

interface Directory {
  name: string
  path: string
  directories?: Directory[] | null
  files?: File[] | null
}

export interface DirectoryTreeProps {
  directory: Directory
  load: (dirpath: string) => Promise<Directory | null>
  showDirectories?: boolean
  showFiles?: boolean
  level?: number
  renderDirectoryLabel?: (props: RenderDirectoryLabelProps) => ReactNode
  renderFileLabel?: (props: RenderFileLabelProps) => ReactNode
}

export interface RenderDirectoryLabelProps {
  directory: Directory
  isExpanded: boolean
  level: number
  toggle: () => Promise<void>
  expand: () => Promise<void>
  collapse: () => Promise<void>
}

export interface RenderFileLabelProps {
  file: File
  level: number
}

const defaultRenderDirectoryLabel = (props: RenderDirectoryLabelProps) =>
  <span data-testid={props.directory.path} onClick={() => props.toggle()}>
    <strong>{props.directory.name}</strong>
  </span>

const defaultRenderFileLabel = (props: RenderFileLabelProps) =>
  <span data-testid={props.file.path}>
    {props.file.name}
  </span>

export const DirectoryTree = ({
  directory,
  load,
  showDirectories = true,
  showFiles = true,
  level = 0,
  renderDirectoryLabel = defaultRenderDirectoryLabel,
  renderFileLabel = defaultRenderFileLabel,
}: DirectoryTreeProps) => {
  const [contents, setContents] = useState({} as { [key: string]: Directory | null })

  const expand = async (path: string) => {
    const newContents = await load(path)
    setContents(existing => ({
      ...existing,
      [path]: newContents
    }))
  }

  const collapse = async (path: string) => {
    setContents(existing => ({
      ...existing,
      [path]: null
    }))
  }

  const toggle = async (path: string) => {
    return !!contents[path]
      ? collapse(path)
      : expand(path)
  }

  const renderSubDirectory = (subdir: Directory) => {
    const isExpanded = !!contents[subdir.path]
    const label = renderDirectoryLabel({
      directory: subdir,
      isExpanded: isExpanded,
      level: level,
      toggle: () => toggle(subdir.path),
      expand: () => expand(subdir.path),
      collapse: () => collapse(subdir.path),
    })

    return (
      <section key={subdir.path}>
        {label}
        {isExpanded && (
          <DirectoryTree
            directory={contents[subdir.path]!}
            load={load}
            showDirectories={showDirectories}
            showFiles={showFiles}
            level={level + 1}
            renderDirectoryLabel={renderDirectoryLabel}
            renderFileLabel={renderFileLabel}
          />
        )}
      </section>
    )
  }

  const renderFile = (file: File) => {
    const label = renderFileLabel({ file, level })

    return (
      <section key={file.path}>
        {label}
      </section>
    )
  }

  return (
    <section style={{ marginLeft: level * 10 }}>
      {showDirectories && directory.directories?.map(renderSubDirectory)}
      {showFiles && directory.files?.map(renderFile)}
    </section>
  )
}
