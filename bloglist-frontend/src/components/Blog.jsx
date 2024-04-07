import { useState } from "react";

const Blog = ({ blog, updateBlog, deleteBlog, userUsername }) => {
  const [visible, setVisible] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("view");
  const showWhenVisible = { display: visible ? "" : "none" };
  const [blogUser, setBlogUser] = useState(blog.user.name);
  const blogCreatedByUser = {
    display: blog.user.username === userUsername ? "" : "none",
  };

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const increaseLike = (event) => {
    event.preventDefault();
    updateBlog(blog.id, {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    });
  };

  const removeBlog = (event) => {
    event.preventDefault();

    deleteBlog(blog.id);
  };

  const toggleVisibility = () => {
    if (visible) {
      setButtonLabel("view");
    } else {
      setButtonLabel("hide");
    }
    setVisible(!visible);
  };

  return (
    <div className="blog" style={blogStyle}>
      <div>
        {blog.title} {blog.author}{" "}
        <button onClick={toggleVisibility}>{buttonLabel}</button>
      </div>
      <div style={showWhenVisible} className="togglableContent">
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}{" "}
          <button id="like-button" onClick={increaseLike}>
            like
          </button>
        </div>
        <div>{blogUser}</div>
        <button
          style={blogCreatedByUser}
          id="remove-button"
          onClick={removeBlog}
        >
          remove
        </button>
      </div>
    </div>
  );
};

export default Blog;
