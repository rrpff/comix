import { Story, Meta } from '@storybook/react'
import { ComicEntryList, ComicEntryListProps } from './'

export default {
  title: 'ComicEntryList',
  component: ComicEntryList
} as Meta

const Template: Story<ComicEntryListProps> = args => <ComicEntryList {...args} />

const COMICS = [
  {
    title: 'Black Hole',
    subtitles: ['Charles Burns'],
    imageUrl: '/black-hole.jpg',
  },
  {
    title: 'Comic Book Tattoo',
    subtitles: ['Comic Book Tattoo is an eisner award and Harvey Award-winning anthology graphic novel made up of fifty-one stories, each based on or inspired by a song by American singer-songwriter Tori Amos, published by Image Comics in 2008.'],
    imageUrl: '/comic-book-tattoo.jpg',
  },
  {
    title: 'Detective Comics #27',
    subtitles: ['Bill Finger'],
    imageUrl: '/detective27.jpg',
  },
  {
    title: 'Multiversity: Pax Americana',
    subtitles: ['Grant Morrison', 'Frank Quitely'],
    imageUrl: '/multiversity.jpg',
  },
  {
    title: 'The Nao of Brown',
    subtitles: ['Glyn Diloln'],
    imageUrl: '/nao.jpg',
  },
  {
    title: 'Rachel Rising #3',
    imageUrl: '/rachel-rising.jpg',
  },
  {
    title: 'Sandman #1',
    subtitles: ['Charles Burns'],
    imageUrl: '/sandman.jpg',
  },
]

export const WithManyComics = Template.bind({})
WithManyComics.args = {
  comics: [...COMICS].sort(() => Math.random() > 0.5 ? 1 : -1)
}

export const WithRandomReadingProgresses = Template.bind({})
WithRandomReadingProgresses.args = {
  comics: [...COMICS]
    .sort(() => Math.random() > 0.5 ? 1 : -1)
    .map(comic => ({ ...comic, readingProgress: Math.random() }))
}

export const WithOneComic = Template.bind({})
WithOneComic.args = {
  comics: [{
    title: 'Detective Comics #27',
    imageUrl: '/detective27.jpg',
  }]
}

export const WithNoComics = Template.bind({})
WithNoComics.args = {
  comics: []
}
