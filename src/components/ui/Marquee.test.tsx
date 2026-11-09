import { render, screen } from '@testing-library/react'
import { Marquee } from './Marquee'

test('the sentence is read once; the moving copies are only for the eye', () => {
  const { container } = render(<Marquee text="Hoàng Sa, Trường Sa là của Việt Nam!" />)
  expect(screen.getAllByText('Hoàng Sa, Trường Sa là của Việt Nam!').filter((el) => !el.closest('[aria-hidden]'))).toHaveLength(1)
  expect(container.querySelector('.animate-marquee')).toHaveAttribute('aria-hidden')
})
