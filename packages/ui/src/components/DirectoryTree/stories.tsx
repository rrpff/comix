import { Story, Meta } from '@storybook/react'
import { generateDirectory } from '../../../test/generators'
import { DirectoryTree, DirectoryTreeProps, RenderDirectoryLabelProps, RenderFileLabelProps } from './'

export default {
  title: 'DirectoryTree',
  component: DirectoryTree
} as Meta

const Template: Story<DirectoryTreeProps> = (args) => <DirectoryTree {...args} />

export const WithContents = Template.bind({})
WithContents.args = {
  directory: generateDirectory(),
  load: async () => generateDirectory(),
}

export const WithDirectoriesHidden = Template.bind({})
WithDirectoriesHidden.args = {
  directory: generateDirectory(),
  load: async () => generateDirectory(),
  showDirectories: false,
}

export const WithFilesHidden = Template.bind({})
WithFilesHidden.args = {
  directory: generateDirectory(),
  load: async () => generateDirectory(),
  showFiles: false,
}

export const WithCustomRenderer = Template.bind({})
WithCustomRenderer.args = {
  directory: generateDirectory(),
  load: async () => generateDirectory(),
  renderDirectoryLabel: (props: RenderDirectoryLabelProps) => (
    <section>
      <span style={{ color: 'blue' }}>Folder: {props.directory.name}</span>
      <button onClick={() => props.toggle()}>
        {props.isExpanded ? 'collapse' : 'expand'}
      </button>
    </section>
  ),
  renderFileLabel: (props: RenderFileLabelProps) => (
    <section>
      <strong style={{ color: 'hotpink' }}>File: {props.file.name}</strong>
    </section>
  ),
}

const emptyDir = generateDirectory()
emptyDir.directories = []
emptyDir.files = []

export const WithNoContents = Template.bind({})
WithNoContents.args = {
  directory: emptyDir
}
