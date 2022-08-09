import { usePost } from "../context/PostContext";

export const Post = () => {
  const { post} = usePost()

  return <>
  <h1>{post.title}</h1>
  <article>{post.body}</article>
  <h3 className="comments-title">Comments{}</h3>
  <section>
    {post.comments}
  </section>
  </>
};
