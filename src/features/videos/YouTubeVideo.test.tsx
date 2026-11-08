import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YouTubeVideo } from './YouTubeVideo'

const video = {
  provider: 'youtube' as const,
  id: 'P5yh-S1ffMg',
  title: 'Thiêng liêng Lễ khao lề thế lính Hoàng Sa | VTV24',
  channel: 'VTV24',
  channelUrl: 'https://www.youtube.com/@vtv24',
}

test('shows a thumbnail first and loads the player only when the child presses play', async () => {
  const { container } = render(<YouTubeVideo video={video} />)
  expect(container.querySelector('iframe')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: `Phát video: ${video.title}` }))
  const frame = screen.getByTitle(`Video: ${video.title}`)
  expect(frame.getAttribute('src')).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/P5yh-S1ffMg\?/)
})

test('always credits the video: title links to YouTube, channel links to the channel', () => {
  render(<YouTubeVideo video={video} />)
  const credit = screen.getByText(/Video:/).closest('p')!
  expect(within(credit).getByRole('link', { name: video.title })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=P5yh-S1ffMg')
  expect(within(credit).getByRole('link', { name: 'VTV24' })).toHaveAttribute('href', 'https://www.youtube.com/@vtv24')
  expect(credit).toHaveTextContent('YouTube')
})
