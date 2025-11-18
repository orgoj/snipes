import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the game menu', () => {
    render(<App />)
    expect(screen.getByText(/S N I P E S/i)).toBeInTheDocument()
  })

  it('shows start game button', () => {
    render(<App />)
    expect(screen.getByText(/START SOLO GAME/i)).toBeInTheDocument()
  })
})
