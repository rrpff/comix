import { Story, Meta } from '@storybook/react'
import { useFixtureFile } from '../../../.storybook/hooks/useFixtureFile'
import { useComic } from '../../hooks/useComic'
import { useComicReader } from '../../hooks/useComicReader'

import { Comic, ComicProps } from './'

export default {
  title: 'Comic',
  component: Comic
} as Meta

const Template: Story<ComicProps & { fixture: string }> = args => {
  const comicFile = useFixtureFile(args.fixture)
  const reader = useComicReader(comicFile || undefined)
  const comicProps = useComic(reader)

  return reader === null
    ? <span>Loading...</span>
    : <Comic {...args} {...comicProps} />
}

export const Wytches = Template.bind({})
Wytches.args = {
  fixture: 'wytches.cbz'
}

export const ComicWithDifferentlySizedPages = Template.bind({})
ComicWithDifferentlySizedPages.args = {
  fixture: 'different-sizes.cbz'
}
