import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getPost } from '../services/posts';

const PostContext = createContext();
export const usePost = () => {
  return useContext(PostContext);
};

export const PostProvider = ({ children }) => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);

  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);

  const commentsByParentId = useMemo(() => {
    const group = {};

    if (comments === null) return [];

    comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  useEffect(() => {
    if (post?.comments == null) return;

    setComments(post.comments);
  }, [post?.comments]);

  function createLocalComment(comment) {
    setComments((prevComments) => [comment, ...prevComments]);
  }

  return (
    <PostContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
        createLocalComment,
      }}
    >
      {loading ? <h1>Loading</h1> : error ? <h1 className="error-msg">{error}</h1> : children}
    </PostContext.Provider>
  );
};
