import { homedir } from 'os'
import path from 'path'
import { FileLibraryConfig, Library } from '@comix/library'
import createServer from './server'

const PORT = process.env.PORT || 4000

const configPath = path.join(homedir(), '.comix', 'library.db')
const library = new Library(new FileLibraryConfig(configPath))
const server = createServer({ library })

server.listen(PORT, () => {
  console.log(`API running at http://localhost${PORT}`)
  console.log(`Playground running at http://localhost${PORT}/graphql`)
})
