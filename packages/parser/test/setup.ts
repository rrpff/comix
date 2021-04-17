import { TextEncoder, TextDecoder } from 'util'

// Required by `unzipit`
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
