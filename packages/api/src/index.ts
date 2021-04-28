import { homedir } from 'os'
import path from 'path'
import { FileLibraryConfig, Library } from '@comix/library'
import createServer from './server'

const PORT = process.env.PORT || 4000
const CONFIG_PATH = path.join(homedir(), '.comix', 'library.db')
const DEFAULT_IMAGES_DIR = path.join(homedir(), '.comix', 'images')

;(async () => {
  const library = new Library(new FileLibraryConfig(CONFIG_PATH))

  const imagesDirectory = await library.config.getImagesDirectory()
  if (!imagesDirectory) await library.config.setImagesDirectory(DEFAULT_IMAGES_DIR)

  const server = await createServer({ library })

  server.listen(PORT, async () => {
    console.log(`API running at: http://localhost${PORT}`)
    console.log(`Playground running at: http://localhost${PORT}/graphql`)
    console.log(`Serving images from: ${await library.config.getImagesDirectory()}`)
  })
})()
