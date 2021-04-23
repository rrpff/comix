import { Story, Meta } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { Dropzone, DropzoneProps } from './'

export default {
  title: 'Dropzone',
  component: Dropzone
} as Meta

const Template: Story<DropzoneProps> = (args) => <Dropzone {...args} />

export const Default = Template.bind({})
Default.args = {
  onDrop: action('onDrop'),
}

export const Processing = Template.bind({})
Processing.args = {
  onDrop: action('onDrop'),
  processing: true,
}
