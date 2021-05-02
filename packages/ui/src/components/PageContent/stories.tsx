import { Story, Meta } from '@storybook/react'
import faker from 'faker'
import { Paragraphs } from '../LoadableText'
import { PageContent, PageContentProps } from './'

export default {
  title: 'PageContent',
  component: PageContent
} as Meta

const Template: Story<PageContentProps> = (args) => <PageContent {...args} />

export const WithContent = Template.bind({})
WithContent.args = {
  title: faker.lorem.sentence(),
  category: faker.lorem.word(),
  children: (
    <Paragraphs>{() => faker.lorem.paragraphs(12)}</Paragraphs>
  )
}

export const Loading = Template.bind({})
Loading.args = {
  loading: true
}

export const Empty = Template.bind({})
Empty.args = {}
