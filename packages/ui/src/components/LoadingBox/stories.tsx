import { Meta } from '@storybook/react'
import { BsFillImageFill } from 'react-icons/bs'
import { LoadingBox } from './'

export default {
  title: 'LoadingBox',
  component: LoadingBox
} as Meta

export const Default = () => (
  <div style={{ display: 'block', width: 300, height: 300 }}>
    <LoadingBox width="100%" height="100%" />
  </div>
)

export const WithAnIcon = () => (
  <div style={{ display: 'block', width: 300, height: 300 }}>
    <LoadingBox width="100%" height="100%">
      <BsFillImageFill />
    </LoadingBox>
  </div>
)
