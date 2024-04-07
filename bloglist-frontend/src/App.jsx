import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationDispatch } from './NotificationContext'

// const Notification = ({ message }) => {
//   if (message === null) {
//     return null;
//   }

//   return <div className="notification">{message}</div>;
// };

const Error = ({ message }) => {
    if (message === null) {
        return null
    }

    return <div className="error">{message}</div>
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

    const dispatch = useNotificationDispatch()

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
                username,
                password,
            })
            window.localStorage.setItem(
                'loggedBlogappUser',
                JSON.stringify(user)
            )
            blogService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        } catch (exception) {
            const message = 'Wrong username or password'
            dispatch({ type: 'set', payload: message })
            setTimeout(() => {
                dispatch({ type: 'clear' })
            }, 5000)
        }
    }

    const handleLogout = async (event) => {
        event.preventDefault()

        window.localStorage.removeItem('loggedBlogappUser')
        setUser(null)
    }

    const addBlog = (blogObject) => {
        blogFormRef.current.toggleVisibility()
        blogService.create(blogObject).then((returnedBlog) => {
            setBlogs(blogs.concat(returnedBlog))
            // setNotificationMessage(
            //     `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
            // )
            // setTimeout(() => {
            //     setNotificationMessage(null)
            // }, 5000)

            const message = `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
            dispatch({ type: 'set', payload: message })
            setTimeout(() => {
                dispatch({ type: 'clear' })
            }, 5000)
        })
    }

    const increaseLike = (id, blogObject) => {
        blogService.update(id, blogObject).then((returnedBlog) => {
            setBlogs(
                blogs.map((blog) => (blog.id !== id ? blog : returnedBlog))
            )
            //console.log(returnedBlog.user)
        })
        //console.log(user)
    }

    const removeBlog = (id) => {
        blogService
            .deleteBlog(id)
            .then(setBlogs(blogs.filter((blog) => blog.id !== id)))
    }

    const loginForm = () => (
        <div>
            <h2>Log in to application</h2>
            <Notification />
            <form onSubmit={handleLogin}>
                <div>
                    username
                    <input
                        id="username"
                        type="text"
                        value={username}
                        name="Username"
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    password
                    <input
                        id="password"
                        type="password"
                        value={password}
                        name="Password"
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button id="login-button" type="submit">
                    login
                </button>
            </form>
        </div>
    )

    useEffect(() => {
        blogService.getAll().then((blogs) => setBlogs(blogs))
    }, [])

    if (user === null) {
        return <div>{loginForm()}</div>
    }

    return (
        <div>
            <h2>blogs</h2>
            <Notification />
            <ul>
                {user.name} logged in
                <button id="logout-button" onClick={handleLogout}>
                    logout
                </button>
            </ul>
            <Togglable buttonLabel="new blog" ref={blogFormRef}>
                <BlogForm createBlog={addBlog} />
            </Togglable>
            {blogs
                .sort((a, b) => b.likes - a.likes)
                .map((blog) => (
                    <Blog
                        key={blog.id}
                        blog={blog}
                        updateBlog={increaseLike}
                        deleteBlog={removeBlog}
                        userUsername={user.username}
                    />
                ))}
        </div>
    )
}

export default App
