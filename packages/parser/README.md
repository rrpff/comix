# @comix/parser

Reads CBZ and CBR comic files in the browser.

## Examples

### reading a comic file from a form submission

```js
import { Parser } from '@comix/parser'

form.addEventListener('submit', async e => {
  e.preventDefault()

  const input = form.children[0]
  const file = input.files[0]

  const parser = new Parser()
  const comic = parser.parse(file)

  console.log(comic)
  // {
  //   name: 'Sandman_Vol1.cbr',
  //   pages: [
  //     {
  //       index: 0,
  //       name: '0001.jpg',
  //       read: () => // Uint8Array of image data
  //     },
  //     ...
  //   ]
  // }
})
```

## Todo

- [x] Read CBZ files
- [x] Read CBR files
- [ ] Automatically determine page size
- [ ] Support parsing in nodejs
- [ ] Support PDF and epub files
- [ ] Support loading WASM via HTTP rather than including in bundle
