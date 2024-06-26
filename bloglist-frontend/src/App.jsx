import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
import {
    useQuery,
    useMutation,
    useQueryClient,
    notifyManager,
} from '@tanstack/react-query'
import { useNotificationDispatch } from './NotificationContext'
import { useUserDispatch, useUserValue } from './UserContext'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams,
} from 'react-router-dom'
import { Table, Form, Button, Navbar, Nav } from 'react-bootstrap'

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

// const BlogList = ({ blogs }) => (
//     <div>
//         <h2>Anecdotes</h2>
//         <ul>
//             {anecdotes.map((anecdote) => (
//                 <li key={anecdote.id}>
//                     <Link to={`/anecdotes/${anecdote.id}`}>
//                         {anecdote.content}
//                     </Link>
//                 </li>
//             ))}
//         </ul>
//     </div>
// )

const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    listStyleType: 'none',
}

const Home = (props) => (
    <div>
        <Togglable buttonLabel="new blog" ref={props.blogFormRef}>
            <BlogForm createBlog={props.addBlog} />
        </Togglable>
        {/* {props.blogs
            .sort((a, b) => b.likes - a.likes)
            .map((blog) => (
                <li style={blogStyle} key={blog.id}>
                    <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                </li>
            ))} */}
        <Table striped>
            <tbody>
                {props.blogs
                    .sort((a, b) => b.likes - a.likes)
                    .map((blog) => (
                        <tr key={blog.id}>
                            <td>
                                <Link to={`/blogs/${blog.id}`}>
                                    {blog.title}
                                </Link>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </Table>
    </div>
)

const User = ({ users }) => {
    const id = useParams().id
    const user = users.find((n) => n.id === id)
    console.log(user)

    if (!user) {
        return null
    }

    return (
        <div>
            <h2>{user.name}</h2>
            <h3>added blogs</h3>
            <ol>
                {user.blogs.map((blog) => (
                    <li key={blog.id}>{blog.title}</li>
                ))}
            </ol>
            <br />
        </div>
    )
}

const BlogPage = ({ blogs, increaseLike, addComment }) => {
    const id = useParams().id
    const blog = blogs.find((n) => n.id === id)
    const [comment, setComment] = useState('')

    const handleLike = (event) => {
        event.preventDefault()
        increaseLike({
            user: blog.user.id,
            likes: blog.likes + 1,
            author: blog.author,
            title: blog.title,
            url: blog.url,
            id: blog.id,
        })
    }

    const handleComment = (event) => {
        event.preventDefault()
        addComment({
            id: blog.id,
            comment: comment,
        })
        setComment('')
    }

    if (!blog) {
        return null
    }

    return (
        <div>
            <h2>{blog.title}</h2>
            <a href={blog.url}>{blog.url}</a>
            <div>
                {blog.likes}likes <button onClick={handleLike}>like</button>
            </div>
            <div>added by {blog.user.name}</div>
            <h3>comments</h3>
            <label>
                <input
                    value={comment}
                    onChange={({ target }) => setComment(target.value)}
                />
                <button onClick={handleComment}>add comment</button>
            </label>
            <ol>
                {blog.comments.map((comment) => (
                    <li key={comment.id}>{comment}</li>
                ))}
            </ol>
        </div>
    )
}

const Users = ({ users }) => (
    <div>
        <h2>Users</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>
                        <strong>Blogs created</strong>
                    </th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) => (
                    <tr key={index}>
                        <td>
                            <Link to={`/users/${user.id}`}>{user.name}</Link>
                        </td>
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
    const padding = {
        padding: 5,
    }

    const inlineBlock = {
        display: 'inline-block',
        marginRight: '10px', // Adjust the spacing between links as needed
    }

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

    const newCommentMutation = useMutation({
        mutationFn: blogService.postComment,
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
            const message = `welcome ${username}`
            dispatch({ type: 'set', payload: message })
            setTimeout(() => {
                dispatch({ type: 'clear' })
            }, 5000)
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
    }

    const increaseLike = (blogObject) => {
        updateBlogMutation.mutate(blogObject)
    }

    const removeBlog = (id) => {
        deleteBlogMutation.mutate(id)
    }

    const addComment = (commentObject) => {
        newCommentMutation.mutate(commentObject)
    }

    const loginForm = () => (
        <div>
            <h2>Log in to application</h2>
            <Notification />
            {/* <form onSubmit={handleLogin}>
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
            </form> */}
            <Form onSubmit={handleLogin}>
                <Form.Group>
                    <Form.Label>username:</Form.Label>
                    <Form.Control
                        id="username"
                        type="text"
                        value={username}
                        name="Username"
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>password:</Form.Label>
                    <Form.Control
                        id="password"
                        type="password"
                        value={password}
                        name="Password"
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    login
                </Button>
            </Form>
        </div>
    )

    const blogs = result.data

    const users = usersResult.data

    if (user === null) {
        return <div className="container">{loginForm()}</div>
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
        <div className="container">
            <Router>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#" as="span">
                                <Link style={padding} to="/">
                                    blogs
                                </Link>
                            </Nav.Link>
                            <Nav.Link href="#" as="span">
                                <Link style={padding} to="/users">
                                    users
                                </Link>
                            </Nav.Link>
                            <Nav.Link href="#" as="span">
                                {user ? (
                                    <ul style={inlineBlock}>
                                        <em style={padding}>
                                            {user.username} logged in
                                        </em>
                                        <button
                                            id="logout-button"
                                            onClick={handleLogout}
                                        >
                                            logout
                                        </button>
                                    </ul>
                                ) : (
                                    <Link style={padding} to="/login">
                                        login
                                    </Link>
                                )}
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <h1>blog app</h1>
                <Notification />
                {/* <div>
                <h2>blogs</h2>
                <Notification />
                <ul>
                    {user.name} logged in
                    <br></br>
                    <button id="logout-button" onClick={handleLogout}>
                        logout
                    </button>
                </ul> */}

                <Routes>
                    <Route path="/users" element={<Users users={users} />} />
                    <Route path="/users/:id" element={<User users={users} />} />
                    <Route
                        path="/blogs/:id"
                        element={
                            <BlogPage
                                blogs={blogs}
                                increaseLike={increaseLike}
                                addComment={addComment}
                            />
                        }
                    />
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
                {/* </div> */}
            </Router>
        </div>
    )
}

export default App
