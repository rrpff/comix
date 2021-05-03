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
      <SidebarHeading>Library</SidebarHeading>
      <SidebarOption>Starred</SidebarOption>
      <SidebarOption selected>Reading</SidebarOption>
      <SidebarOption>Uncategorised</SidebarOption>

      <SidebarHeading>Publishers</SidebarHeading>
      <SidebarOption>2000 AD</SidebarOption>
      <SidebarOption>DC</SidebarOption>
      <SidebarOption>Marvel</SidebarOption>
    </>
  )
}

export const WithLoadingOptions = Template.bind({})
WithLoadingOptions.args = {
  children: (
    <>
      <SidebarHeading loading>Library</SidebarHeading>
      <SidebarOption loading>Starred</SidebarOption>
      <SidebarOption selected loading>Reading</SidebarOption>
      <SidebarOption loading>Uncategorised</SidebarOption>

      <SidebarHeading loading>Publishers</SidebarHeading>
      <SidebarOption loading>2000 AD</SidebarOption>
      <SidebarOption loading>DC</SidebarOption>
      <SidebarOption loading>Marvel</SidebarOption>
    </>
  )
}

export const Empty = Template.bind({})
Empty.args = {
  children: null
}
