import { Story, Meta } from '@storybook/react'
import { ReactNode, useEffect, useState } from 'react'
import { ProgressBar, ProgressBarProps } from './'

export default {
  title: 'ProgressBar',
  component: ProgressBar
} as Meta

const StoryContainer = ({ children }: { children: ReactNode }) =>
  <section style={{ position: 'relative', width: '100%', height: '30px' }}>
    {children}
  </section>

const Template: Story<ProgressBarProps> = (args) =>
  <StoryContainer>
    <ProgressBar {...args} />
  </StoryContainer>

export const HalfFull = Template.bind({})
HalfFull.args = { progress: 0.5 }

export const Empty = Template.bind({})
Empty.args = { progress: 0 }

export const Full = Template.bind({})
Full.args = { progress: 1 }

export const Styled = Template.bind({})
Styled.args = {
  progress: 0.5,
  barStyles: {
    background: 'orange',
    boxShadow: '0px 3px 8px rgba(200, 100, 10, 0.8)'
  }
}

export const Animating = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setProgress(p => p >= 1 ? 0 : p + 0.025)
    }, 50)
  }, [progress])

  return (
    <StoryContainer>
      <ProgressBar progress={progress} />
    </StoryContainer>
  )
}
