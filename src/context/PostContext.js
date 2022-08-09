import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getPost } from '../services/posts';

const PostContext = createContext();

export const usePost = () => {
  return useContext(PostContext);
};

export const PostProvider = ({ children }) => {
  const { id } = useParams();

  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);

  const commentsByParentId = useMemo(() => {
    const group = {};

    if (post?.comment === null) return [];

    post?.comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [post?.comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  return (
    <PostContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
      }}
    >
      {loading ? <h1>Loading</h1> : error ? <h1 className="error-msg">{error}</h1> : children}
    </PostContext.Provider>
  );
};
