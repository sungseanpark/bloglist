import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogForm from "./BlogForm";

describe("<BlogForm />", () => {
  test("calls the event handler it received as props with the right details when a new blog is created", async () => {
    const user = userEvent.setup();
    const createBlog = vi.fn();

    render(<BlogForm createBlog={createBlog} />);

    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "What really caused the sriracha shortage?");
    await user.type(inputs[1], "Indrani Sen");
    await user.type(
      inputs[2],
      "https://fortune.com/2024/01/30/sriracha-shortage-huy-fong-foods-tabasco-underwood-ranches/",
    );

    const sendButton = screen.getByText("create");

    await user.click(sendButton);

    expect(createBlog.mock.calls).toHaveLength(1);

    expect(createBlog.mock.calls[0][0].title).toBe(
      "What really caused the sriracha shortage?",
    );
    expect(createBlog.mock.calls[0][0].author).toBe("Indrani Sen");
    expect(createBlog.mock.calls[0][0].url).toBe(
      "https://fortune.com/2024/01/30/sriracha-shortage-huy-fong-foods-tabasco-underwood-ranches/",
    );
  });
});
