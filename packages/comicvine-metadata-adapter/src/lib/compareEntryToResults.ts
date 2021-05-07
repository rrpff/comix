import axios from 'axios'
import Jimp from 'jimp'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { Comic } from '@comix/parser'
import { EffectResponse } from 'typed-effects'
import { CompareEntryToResultsEffect } from '../effects'
import { ComicVineMatchable } from '../types'

const NORMALISED_WIDTH = Math.floor(650)
const NORMALISED_HEIGHT = Math.floor(1000)
const DIFF_THRESHOLD = 0.4

type Response<T> = EffectResponse<CompareEntryToResultsEffect<T>>

export const compareEntryToResults = async <T extends ComicVineMatchable>(comic: Comic, results: T[]): Promise<Response<T>> => {
  const cover = comic!.images[0]
  const coverImage = await format(await cover.read())

  const matches = await Promise.all(results
    .filter(result => result.imageUrl !== undefined && result.imageUrl !== null)
    .map(async result => {
      const resultCoverData = (await axios.get(result.imageUrl!, { responseType: 'arraybuffer' })).data
      const resultImage = await format(resultCoverData)

      const { difference } = await diffImages(coverImage, resultImage, {
        threshold: DIFF_THRESHOLD
      })

      return { comparison: result, score: difference }
    })
  )

  const strongestScore = Math.min(...matches.map(match => match.score))
  const strongest = matches.find(match => match.score === strongestScore)

  return {
    strongest,
    matches,
  }
}

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
