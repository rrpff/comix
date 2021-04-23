import { Story, Meta } from '@storybook/react'
import { useCallback, useState } from 'react'
import { useHover } from './useHover'

const boxStyles = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: 300, height: 300 }

const ViewportTargetDemo = () => {
  const active = useHover(document.body)
  const background = active ? '#1dd1a1' : '#feca57'
  const color = active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
  const text = active ? 'Hovering!' : 'Hover over the viewport'

  return (
    <div style={{ ...boxStyles, background, color }}>
      {text}
    </div>
  )
}

const ElementTargetDemo = () => {
  const [target, setTarget] = useState(null as any)
  const ref = useCallback(node => setTarget(node), [])
  const active = useHover(target)
  const background = active ? '#1dd1a1' : '#feca57'
  const color = active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
  const text = active ? 'Hovering!' : 'Hover over this element'

  return (
    <div ref={ref} style={{ ...boxStyles, background, color }}>
      {text}
    </div>
  )
}

export default {
  title: 'Hooks/useHover',
  component: ViewportTargetDemo
} as Meta

const ViewportTemplate: Story<{}> = (args) => <ViewportTargetDemo {...args} />
const ElementTemplate: Story<{}> = (args) => <ElementTargetDemo {...args} />

export const ViewportTarget = ViewportTemplate.bind({})
ViewportTarget.args = {}

export const ElementTarget = ElementTemplate.bind({})
ElementTarget.args = {}
