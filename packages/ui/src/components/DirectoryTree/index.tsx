import React, { Fragment, ReactNode, useState } from 'react'

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
  <div data-testid={props.directory.path} onClick={() => props.toggle()}>
    <strong>{props.directory.name}</strong>
  </div>

const defaultRenderFileLabel = (props: RenderFileLabelProps) =>
  <div data-testid={props.file.path}>
    {props.file.name}
  </div>

export const DirectoryTree = ({
  directory,
  showDirectories = true,
  showFiles = true,
  level = 0,
  renderDirectoryLabel = defaultRenderDirectoryLabel,
  renderFileLabel = defaultRenderFileLabel,
}: DirectoryTreeProps) => {
  const [expanded, setExpanded] = useState([] as string[])

  const expand = async (path: string) => {
    setExpanded(current => [...current, path])
  }

  const collapse = async (path: string) => {
    setExpanded(current => current.filter(p => p !== path))
  }

  const toggle = async (path: string) => {
    return expanded.includes(path)
      ? collapse(path)
      : expand(path)
  }

  const renderSubDirectory = (subdir: Directory) => {
    const isExpanded = expanded.includes(subdir.path)
    const label = renderDirectoryLabel({
      directory: subdir,
      isExpanded: isExpanded,
      level: level,
      toggle: () => toggle(subdir.path),
      expand: () => expand(subdir.path),
      collapse: () => collapse(subdir.path),
    })

    return (
      <Fragment key={subdir.path}>
        {label}
        {isExpanded && (
          <DirectoryTree
            directory={subdir}
            showDirectories={showDirectories}
            showFiles={showFiles}
            level={level + 1}
            renderDirectoryLabel={renderDirectoryLabel}
            renderFileLabel={renderFileLabel}
          />
        )}
      </Fragment>
    )
  }

  const renderFile = (file: File) => {
    const label = renderFileLabel({ file, level })

    return (
      <Fragment key={file.path}>
        {label}
      </Fragment>
    )
  }

  return (
    <div style={{ marginLeft: level * 10 }}>
      {showDirectories && directory.directories?.map(renderSubDirectory)}
      {showFiles && directory.files?.map(renderFile)}
    </div>
  )
}
