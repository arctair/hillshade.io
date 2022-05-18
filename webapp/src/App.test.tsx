import { render, screen } from '@testing-library/react'
import App from './App'

test('hello world', () => {
  render(<App />)
  const helloWorld = screen.getByText(/hello world/i)
  expect(helloWorld).toBeInTheDocument()
})