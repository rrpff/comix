import styled from '@emotion/styled'
import { CgSpinner } from 'react-icons/cg'

export const Spinner = styled(CgSpinner)`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(359deg); }
  }

  animation: spin 1.5s infinite linear;
  font-size: 16px;
  margin-bottom: -2px;
`
