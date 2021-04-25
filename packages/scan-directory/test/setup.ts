import { TextEncoder, TextDecoder } from 'util'

// Required by `unzipit`
;(global.TextEncoder as any) = TextEncoder
;(global.TextDecoder as any) = TextDecoder
