import { useState } from 'react'

const Blog = ({ blog, updateBlog }) => {
  const [visible, setVisible] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('view')
  const showWhenVisible = { display: visible ? '' : 'none' }
  const [blogUser, setBlogUser] = useState(blog.user.name)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const increaseLike = (event) => {
    event.preventDefault()
    updateBlog(blog.id, {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    })
  }

  const toggleVisibility = () => {
    if (visible){
      setButtonLabel('view')
    }
    else{
      setButtonLabel('hide')
    }
    setVisible(!visible)
  }

  return (
    <div style = {blogStyle}>
      <div>
        {blog.title} {blog.author} <button onClick={toggleVisibility}>{buttonLabel}</button>
      </div>
      <div style = {showWhenVisible}>
        <div>
          {blog.url}
        </div>
        <div>
          likes {blog.likes} <button onClick={increaseLike}>like</button>
        </div>
        <div>
          {blogUser}
        </div>
      </div>  
    </div> 
)}

export default Blog