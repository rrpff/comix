import { TextEncoder, TextDecoder } from 'util'

// Required by `@comix/parser`
;(global.TextEncoder as any) = TextEncoder
;(global.TextDecoder as any) = TextDecoder
