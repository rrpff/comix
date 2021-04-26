import { Comic } from '@comix/parser'
import { LibraryEntry, MetadataAdapter } from '@comix/library'
import axios from 'axios'
import Jimp from 'jimp'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

export interface ComicVineMetadataAdapterConfig {
  apiKey: string
  diffThreshold?: number
}

interface ComicVineSearchResponse {
  results: {
    name: string
    start_year: number
    publisher?: { name: string }
    site_detail_url: string
    image: { medium_url: string }
  }[]
}

const search = async (query: string, apiKey: string, type = 'volume') => {
  const url = 'https://comicvine.gamespot.com/api/search'
  const res = await axios.get<ComicVineSearchResponse>(url, {
    params: {
      query: query,
      api_key: apiKey,
      format: 'json',
      resources: type,
      limit: 12
    }
  })

  return res.data.results.map(result => ({
    title: result.name,
    year: result.start_year,
    publisher: result.publisher?.name,
    link: result.site_detail_url,
    image: result.image.medium_url,
  }))
}

const NORMALISED_WIDTH = Math.floor(650)
const NORMALISED_HEIGHT = Math.floor(1000)

const format = (data: ArrayBuffer): Promise<PNG> => {
  return new Promise(async (resolve, reject) => {
    const image = await Jimp.read(Buffer.from(data))
    const buffer = await image
      .resize(NORMALISED_WIDTH, NORMALISED_HEIGHT)
      .quality(100)
      .getBufferAsync(Jimp.MIME_PNG)

    new PNG().parse(buffer, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const diffImages = async (imageA: PNG, imageB: PNG, options: { threshold: number }) => {
  const totalPixels = NORMALISED_WIDTH * NORMALISED_HEIGHT
  const diffPixels = pixelmatch(imageA.data, imageB.data, null, NORMALISED_WIDTH, NORMALISED_HEIGHT, {
    threshold: options.threshold
  })

  return {
    difference: diffPixels / totalPixels,
    pixelsDifference: diffPixels,
  }
}

export class ComicVineMetadataAdapter implements MetadataAdapter {
  constructor(private config: ComicVineMetadataAdapterConfig) {}

  async process(entry: LibraryEntry, comic: Comic | null): Promise<Partial<LibraryEntry>> {
    if (entry.corrupt || comic === null) return {}
    if (entry.volumeName || entry.volumeYear) return {}

    const cover = comic.images[0]
    const coverImage = await format(await cover.read())
    const results = await search(comic.name, this.config.apiKey)
    const scoredResults = await Promise.all(results.map(async result => {
      const resultCoverData = (await axios.get(result.image, { responseType: 'arraybuffer' })).data
      const resultImage = await format(resultCoverData)

      const { difference } = await diffImages(coverImage, resultImage, {
        threshold: this.config.diffThreshold || 0.4
      })

      return { result, score: difference }
    }))

    const winner = scoredResults.sort((a, b) => {
      if (a.score < b.score) return -1
      if (a.score > b.score) return 1
      return 0
    })[0]

    if (winner === undefined) return {}
    if (winner.score > 0.2) return {}

    return { volumeName: winner.result.title, volumeYear: winner.result.year }
  }
}
