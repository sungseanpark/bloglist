import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationDispatch } from './NotificationContext'
import { useUserDispatch, useUserValue } from './UserContext'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

// const Notification = ({ message }) => {
//   if (message === null) {
//     return null;
//   }

//   return <div className="notification">{message}</div>;
// };

// const Error = ({ message }) => {
//     if (message === null) {
//         return null
//     }

//     return <div className="error">{message}</div>
// }

const BlogList = ({ blogs }) => (
    <div>
        <h2>Anecdotes</h2>
        <ul>
            {anecdotes.map((anecdote) => (
                <li key={anecdote.id}>
                    <Link to={`/anecdotes/${anecdote.id}`}>
                        {anecdote.content}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
)

const Home = (props) => (
    <div>
        <Togglable buttonLabel="new blog" ref={props.blogFormRef}>
            <BlogForm createBlog={props.addBlog} />
        </Togglable>
        {props.blogs
            .sort((a, b) => b.likes - a.likes)
            .map((blog) => (
                <Blog
                    key={blog.id}
                    blog={blog}
                    updateBlog={props.increaseLike}
                    deleteBlog={props.removeBlog}
                    userUsername={props.username}
                />
            ))}
    </div>
)

const Users = ({ users }) => (
  <div>
    <h2>Users</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th><strong>Blogs created</strong></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={index}>
            <td>{user.name}</td>
            <td>{user.blogs.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
const App = () => {
    // const [blogs, setBlogs] = useState([])
    // const [title, setTitle] = useState('')
    // const [author, setAuthor] = useState('')
    // const [url, setUrl] = useState('')
    // const [notificationMessage, setNotificationMessage] = useState(null)
    // const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    // const [user, setUser] = useState(null)
    const user = useUserValue()

    const queryClient = useQueryClient()

    const result = useQuery({
        queryKey: ['blogs'],
        queryFn: blogService.getAll,
        retry: 1,
    })

    const usersResult = useQuery({
      queryKey: ['users'],
      queryFn: userService.getAll,
      retry: 1,
  })

    const dispatch = useNotificationDispatch()
    const userDispatch = useUserDispatch()

    const newBlogMutation = useMutation({
        mutationFn: blogService.create,
        onSuccess: (newBlog) => {
            const blogs = queryClient.getQueryData(['blogs'])
            queryClient.setQueryData(['blogs'], blogs.concat(newBlog))
            const message = `A new blog '${newBlog.title}' by '${newBlog.author}' added`
            dispatch({ type: 'set', payload: message })
            setTimeout(() => {
                dispatch({ type: 'clear' })
            }, 5000)
        },
        // onError: () => {
        //   const message = `Anecdote too short, must have 5 characters or more`
        //   dispatch({type: 'set', payload: message})
        //   setTimeout(() => {
        //     dispatch({type: 'clear'})
        //   }, 5000)
        // }
    })

    const updateBlogMutation = useMutation({
        mutationFn: blogService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] })
        },
    })

    const deleteBlogMutation = useMutation({
        mutationFn: blogService.deleteBlog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] })
        },
    })

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            userDispatch({ type: 'set', payload: user })
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
            userDispatch({ type: 'set', payload: user })
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
        userDispatch({ type: 'clear' })
    }

    const addBlog = (blogObject) => {
        blogFormRef.current.toggleVisibility()
        newBlogMutation.mutate(blogObject)
        // blogService.create(blogObject).then((returnedBlog) => {
        //     setBlogs(blogs.concat(returnedBlog))
        //     // setNotificationMessage(
        //     //     `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
        //     // )
        //     // setTimeout(() => {
        //     //     setNotificationMessage(null)
        //     // }, 5000)

        //     const message = `A new blog '${returnedBlog.title}' by '${returnedBlog.author}' added`
        //     dispatch({ type: 'set', payload: message })
        //     setTimeout(() => {
        //         dispatch({ type: 'clear' })
        //     }, 5000)
        // })
    }

    const increaseLike = (blogObject) => {
        // blogService.update(id, blogObject).then((returnedBlog) => {
        //     setBlogs(
        //         blogs.map((blog) => (blog.id !== id ? blog : returnedBlog))
        //     )
        //     //console.log(returnedBlog.user)
        // })

        // blogService.update(blogObject)

        // console.log(blogObject)
        updateBlogMutation.mutate(blogObject)
        //console.log(user)
    }

    const removeBlog = (id) => {
        // blogService
        //     .deleteBlog(id)
        //     .then(setBlogs(blogs.filter((blog) => blog.id !== id)))
        deleteBlogMutation.mutate(id)
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

    // useEffect(() => {
    //     blogService.getAll().then((blogs) => setBlogs(blogs))
    // }, [])

    const blogs = result.data

    const users = usersResult.data

    if (user === null) {
        return <div>{loginForm()}</div>
    }

    if (result.isLoading) {
        return <div>loading data...</div>
    }

    if (result.isError) {
        return (
            <div>blog service is not available due to problems in server</div>
        )
    }

    return (
        <Router>
            <div>
                <h2>blogs</h2>
                <Notification />
                <ul>
                    {user.name} logged in
                    <br></br>
                    <button id="logout-button" onClick={handleLogout}>
                        logout
                    </button>
                </ul>

                <Routes>
                  <Route path="/users" element={<Users users={users}/>}/>
                    <Route
                        path="/"
                        element={
                            <Home
                                blogFormRef={blogFormRef}
                                addBlog={addBlog}
                                blogs={blogs}
                                increaseLike={increaseLike}
                                removeBlog={removeBlog}
                                username={user.username}
                            />
                        }
                    />
                </Routes>
                {/* <Togglable buttonLabel="new blog" ref={blogFormRef}>
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
                ))} */}
            </div>
        </Router>
    )
}

export default App
