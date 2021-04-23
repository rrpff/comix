/** @jsxImportSource @emotion/react **/
import { css } from '@emotion/react'
import { useState } from 'react'
import { VscLoading } from 'react-icons/vsc'
import { Dropzone } from './components/Dropzone'
import { Comic } from './components/Comic'
import { useComic } from './hooks/useComic'
import { useComicReader } from './hooks/useComicReader'

const containerStyles = () => css`
  display: flex;
  align-content: center;
  justify-content: center;
`

const headerStyles = () => css`
  display: flex;
  max-width: 100%;
  width: 600px;
  padding: 12px;
  margin-top: 30px;
  justify-content: space-evenly;
  flex-direction: column;

  h1 {
    margin-bottom: 0;
  }
`

const loadingStyles = () => css`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(359deg); }
  }

  animation: spin 1.5s infinite linear;
  font-size: 32px;
`

export const App = () => {
  const [file, setFile] = useState(undefined as File | undefined)
  const reader = useComicReader(file)
  const comicProps = useComic(reader)

  const showDropzone = file === undefined
  const showLoading = (file !== undefined && reader === null) || (reader !== null && comicProps.loading)
  const showComic = reader !== null && !showLoading
  const showIntro = showDropzone || showLoading

  const reset = () => setFile(undefined)

  return (
    <main css={containerStyles()}>
      <header css={headerStyles()}>
        {showIntro && (
          <>
            <h1>Comix</h1>
            <p>A little reader for CBR and CBZ files</p>
          </>
        )}

        {showDropzone && (
          <Dropzone onDrop={files => setFile(files[0])} />
        )}

        {showLoading && (
          <VscLoading css={loadingStyles()} />
        )}
      </header>

      {showComic && (
        <Comic {...comicProps} closable onClose={reset} />
      )}
    </main>
  )
}
