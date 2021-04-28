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

export const Example1 = Template.bind({})
Example1.args = {
  fixture: 'Example1.cbr'
}

export const Example2 = Template.bind({})
Example2.args = {
  fixture: 'Example2.cbz'
}

export const Example3 = Template.bind({})
Example3.args = {
  fixture: 'Example3.cbr'
}

export const Example4 = Template.bind({})
Example4.args = {
  fixture: 'Example4.cbr'
}

export const Example5 = Template.bind({})
Example5.args = {
  fixture: 'Example5.cbr'
}

export const Example6 = Template.bind({})
Example6.args = {
  fixture: 'Example6.cbr'
}
