import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Quad Hypertrophy Training Tips',
    author: 'Mike Israetel',
    url: 'https://rpstrength.com/blogs/articles/quad-hypertrophy-training-tips',
    likes: 0,
    user: {
      name: 'superuser'
    }
  }

  let container

  beforeEach(() => {
    container = render(<Blog blog={blog} />).container
  })


  test('renders title and author', async() => {

    await screen.getByText('Quad Hypertrophy Training Tips Mike Israetel')

  //   const div = container.querySelector('.togglableContent')
  //   expect(div).toHaveStyle('display: none')
  })

  test('does not render url or likes', () => {
    const div = container.querySelector('.togglableContent')
    expect(div).toHaveStyle('display: none')
  })

  test('after clicking the button, url and likes are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const div = container.querySelector('.togglableContent')
    expect(div).not.toHaveStyle('display: none')
  })
})
