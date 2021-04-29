import { Story, Meta } from '@storybook/react'
import faker from 'faker'
import {
  LoadableTextProps,
  Title as TitleC,
  Subtitle as SubtitleC,
  Sentence as SentenceC,
  Paragraph as ParagraphC,
  Paragraphs as ParagraphsC,
} from './'

export default {
  title: 'LoadableText',
  component: TitleC
} as Meta

const TitleTemplate: Story<LoadableTextProps<string>> = (args) => <TitleC {...args} />
const SubtitleTemplate: Story<LoadableTextProps<string>> = (args) => <SubtitleC {...args} />
const SentenceTemplate: Story<LoadableTextProps<string>> = (args) => <SentenceC {...args} />
const ParagraphTemplate: Story<LoadableTextProps<string>> = (args) => <ParagraphC {...args} />
const ParagraphsTemplate: Story<LoadableTextProps<string>> = (args) => <ParagraphsC {...args} />
const CombinedTemplate: Story<{ loading: boolean }> = (args) => (
  <div>
    <Title loading={args.loading} children={() => faker.lorem.sentence()} />
    <Subtitle loading={args.loading} children={() => faker.lorem.sentences()} />
    <Paragraphs loading={args.loading} children={() => faker.lorem.paragraphs(12)} />
  </div>
)

export const Combined = CombinedTemplate.bind({})
Combined.args = {
  loading: false,
}

export const Title = TitleTemplate.bind({})
Title.args = {
  loading: false,
  children: () => faker.lorem.sentence()
}

export const Subtitle = SubtitleTemplate.bind({})
Subtitle.args = {
  loading: false,
  children: () => faker.lorem.sentence()
}

export const SubtitleWithLongText = SubtitleTemplate.bind({})
SubtitleWithLongText.args = {
  loading: false,
  children: () => faker.lorem.paragraph()
}

export const Sentence = SentenceTemplate.bind({})
Sentence.args = {
  loading: false,
  children: () => faker.lorem.sentence()
}

export const Paragraph = ParagraphTemplate.bind({})
Paragraph.args = {
  loading: false,
  children: () => faker.lorem.paragraph()
}

export const Paragraphs = ParagraphsTemplate.bind({})
Paragraphs.args = {
  loading: false,
  children: () => faker.lorem.paragraphs()
}
