import { Story, Meta } from '@storybook/react'
import { useCallback, useState } from 'react'
import { useMouseIsActive } from './useMouseIsActive'

interface DemoProps {
  duration: number
}

const boxStyles = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: 300, height: 300 }

const WindowTargetDemo = (props: DemoProps) => {
  const active = useMouseIsActive(window, props.duration)
  const background = active ? '#1dd1a1' : '#feca57'
  const color = active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
  const text = active ? 'Active!' : 'Move the mouse around the window'

  return (
    <div style={{ ...boxStyles, background, color }}>
      {text}
    </div>
  )
}

const ElementTargetDemo = (props: DemoProps) => {
  const [target, setTarget] = useState(null as any)
  const ref = useCallback(node => setTarget(node), [])
  const active = useMouseIsActive(target, props.duration)
  const background = active ? '#1dd1a1' : '#feca57'
  const color = active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
  const text = active ? 'Active!' : 'Hover over this element'

  return (
    <div ref={ref} style={{ ...boxStyles, background, color }}>
      {text}
    </div>
  )
}

export default {
  title: 'Hooks/useMouseIsActive',
  component: WindowTargetDemo
} as Meta

const WindowTemplate: Story<DemoProps> = (args) => <WindowTargetDemo {...args} />
const ElementTemplate: Story<DemoProps> = (args) => <ElementTargetDemo {...args} />

export const WindowTarget = WindowTemplate.bind({})
WindowTarget.args = {
  duration: 500,
}

export const ElementTarget = ElementTemplate.bind({})
ElementTarget.args = {
  duration: 500,
}
