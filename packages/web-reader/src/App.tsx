/** @jsxImportSource @emotion/react **/
import { css } from '@emotion/react'
import { useState } from 'react'
import { Dropzone } from '@comix/ui/components/Dropzone'
import { Comic } from '@comix/ui/components/Comic'
import { useComic } from '@comix/ui/hooks/useComic'
import { useComicReader } from '@comix/ui/hooks/useComicReader'

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
            <h1>Comic Reader</h1>
            <p>
              A little reader for CBR and CBZ files<br />
              See code: <a href="https://github.com/rrpff/comix">rrpff/comix</a>
            </p>
          </>
        )}

        {!showComic && (
          <Dropzone
            onDrop={files => setFile(files[0])}
            processing={showLoading}
          />
        )}
      </header>

      {showComic && (
        <Comic {...comicProps} closable onClose={reset} />
      )}
    </main>
  )
}
