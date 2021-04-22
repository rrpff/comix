/** @jsxImportSource @emotion/react **/
import { css } from '@emotion/react'
import { useDropzone } from 'react-dropzone'

export interface DropzoneProps {
  onDrop: (files: File[]) => void
}

const containerStyle = ({ isDragActive }: { isDragActive: boolean }) => css`
  background: ${isDragActive ? '#bae8e8' : '#e3f6f5'};
  border-radius: 12px;
  border: 2px dashed ${isDragActive? '#272343' : '#bae8e8'};
  color: #2d334a;
  display: flex;
  flex-direction: column;
  padding: 30px;
  text-align: center;

  a {
    color: #2d334a;
    font-weight: bold;
  }
`

export const Dropzone = (props: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => props.onDrop(files)
  })

  return (
    <section {...getRootProps()} css={containerStyle({ isDragActive })}>
      <input {...getInputProps()} />

      {isDragActive
        ? <p><strong>Drop here.</strong></p>
        : <p>Drag and drop or <a href="#!" onClick={e => e.preventDefault()}>upload a file</a>.</p>
      }
    </section>
  )
}
