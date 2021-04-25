import { InMemoryLibraryConfig } from './InMemoryLibraryConfig'
import { runLibraryConfigTests } from './runLibraryConfigTests'

runLibraryConfigTests(() => new InMemoryLibraryConfig())
