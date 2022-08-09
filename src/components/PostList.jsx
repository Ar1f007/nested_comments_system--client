import { useEffect, useState } from 'react';
import { getPosts } from '../services/posts';
import { Link } from 'react-router-dom';

export const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);
  return posts.map((post) => {
    return (
      <h1 key={post.id}>
        <Link to={'/posts/{post.id}'}>{post.title}</Link>
      </h1>
    );
  });
};
