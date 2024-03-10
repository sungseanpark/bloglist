import { render, screen } from '@testing-library/react'
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
})
