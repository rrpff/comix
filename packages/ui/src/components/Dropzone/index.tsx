import { useDropzone } from 'react-dropzone'
import styled from '@emotion/styled'
import { Spinner } from '../Spinner'

export interface DropzoneProps {
  onDrop: (files: File[]) => void
  processing?: boolean
}

export const Dropzone = (props: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => props.onDrop(files)
  })

  const isProcessing = !!props.processing

  return (
    <Container {...getRootProps()} dragActive={isDragActive} processing={isProcessing}>
      <input {...getInputProps()} />

      {
        isProcessing ? <ProcessingContent /> :
        isDragActive ? <DragActiveContent /> :
        <DefaultContent />
      }
    </Container>
  )
}

const DefaultContent = () => <p>Drag and drop or <a href="#!" onClick={e => e.preventDefault()}>upload a file</a>.</p>
const DragActiveContent = () => <p><strong>Drop here.</strong></p>
const ProcessingContent = () => <p><Spinner /> <strong>Processing...</strong></p>

const Container = styled.section<{ processing: boolean, dragActive: boolean }>`
  background: ${props => props.processing ? '#e5f6e3' : props.dragActive ? '#bae8e8' : '#e3f6f5'};
  border-radius: 12px;
  border: 2px dashed ${props => props.processing ? '#bee8ba' : props.dragActive? '#272343' : '#bae8e8'};
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
