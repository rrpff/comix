import { Story, Meta } from '@storybook/react'
import { Sidebar, SidebarHeading, SidebarOption, SidebarProps } from './'

export default {
  title: 'Sidebar',
  component: Sidebar
} as Meta

const Template: Story<SidebarProps> = (args) => (
  <div style={{ position: 'fixed', left: 0, top: 0, width: 220, height: '100%', overflow: 'auto' }}>
    <Sidebar {...args} />
  </div>
)

export const WithOptions = Template.bind({})
WithOptions.args = {
  children: (
    <>
      <SidebarHeading text="Library" />
      <SidebarOption text="Starred" />
      <SidebarOption selected text="Reading" />
      <SidebarOption text="Uncategorised" />

      <SidebarHeading text="Publishers" />
      <SidebarOption text="2000 AD" />
      <SidebarOption text="DC" />
      <SidebarOption text="Marvel" />
    </>
  )
}

export const Empty = Template.bind({})
Empty.args = {
  children: null
}
