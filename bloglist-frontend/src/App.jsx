import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='notification'>
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const App = () => {

  
  const [blogs, setBlogs] = useState([])
  // const [title, setTitle] = useState('')
  // const [author, setAuthor] = useState('')
  // const [url, setUrl] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const blogFormRef = useRef()

  const handleLogin = async (event) => {
    event.preventDefault()

    
    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token) 
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = async (event) => {
    event.preventDefault()

    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  // const addBlog = (event) => {
  //   event.preventDefault()
  //   const blogObject = {
  //     title: title,
  //     author: author,
  //     url: url,
  //   }

  //   blogService
  //     .create(blogObject)
  //     .then(returnedBlog => {
  //       setBlogs(blogs.concat(returnedBlog))
  //       setNotificationMessage(
  //         `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
  //       )
  //       setTimeout(() => {
  //         setNotificationMessage(null)
  //       }, 5000)
  //     })
  // }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setNotificationMessage(
          `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
        )
        setTimeout(() => {
          setNotificationMessage(null)
        }, 5000)
      })
  }

  const loginForm = () => (
    <div>
      <h2>Log in to application</h2>
      <Error message={errorMessage} />
      <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>      
    </div>
  )

  // const blogForm = () => (
  //   <div>
  //     <h2>create new</h2>
  //   <form onSubmit={addBlog}>
  //     <div>
  //       title:
  //         <input
  //         value={title}
  //         onChange={({ target }) => setTitle(target.value)}
  //       />
  //     </div>
  //     <div>
  //       author:
  //         <input
  //         value={author}
  //         onChange={({ target }) => setAuthor(target.value)}
  //       />
  //     </div>
  //     <div>
  //       url:
  //         <input
  //         value={url}
  //         onChange={({ target }) => setUrl(target.value)}
  //       />
  //     </div>
  //     <button type="submit">create</button>
  //   </form>
  //   </div>
  // )

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  if (user === null) {
    return (
      <div>
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notificationMessage} />
      <ul>
        {user.name} logged in
        <button onClick={handleLogout}>
          logout
        </button>
      </ul>
      <Togglable buttonLabel='new blog' ref={blogFormRef}>
        <BlogForm
          createBlog={addBlog}
        />
      </Togglable>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App