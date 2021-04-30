import { Story, Meta } from '@storybook/react'
import { ComicEntry, ComicEntryProps } from './'

export default {
  title: 'ComicEntry',
  component: ComicEntry
} as Meta

const Template: Story<ComicEntryProps> = args => <ComicEntry {...args} />

export const WithASubtitle = Template.bind({})
WithASubtitle.args = {
  title: 'Multiversity',
  subtitles: ['Grant Morrison'],
  imageUrl: '/multiversity.jpg',
}

export const WithoutASubtitle = Template.bind({})
WithoutASubtitle.args = {
  title: 'Sandman',
  imageUrl: '/sandman.jpg',
}

export const WithReadingProgress = Template.bind({})
WithReadingProgress.args = {
  title: 'Multiversity',
  subtitles: ['Grant Morrison'],
  imageUrl: '/multiversity.jpg',
  readingProgress: 0.6,
}

export const WhenLoading = Template.bind({})
WhenLoading.args = {
  loading: true
}
