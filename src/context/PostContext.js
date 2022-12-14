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
  function updateLocalComment(id, message) {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === id) {
          return { ...comment, message };
        } else {
          return comment;
        }
      });
    });
  }

  function deleteLocalComment(id) {
    setComments((prevComments) => {
      return prevComments.filter((comment) => comment.id !== id);
    });
  }

  function toggleLocalCommentLike(id, addLike) {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (id === comment.id) {
          if (addLike) {
            return {
              ...comment,
              likeCount: comment.likeCount + 1,
              likedByMe: true,
            };
          } else {
            return {
              ...comment,
              likeCount: comment.likeCount - 1,
              likedByMe: false,
            };
          }
        } else {
          return comment;
        }
      });
    });
  }
  return (
    <PostContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
        toggleLocalCommentLike,
      }}
    >
      {loading ? <h1>Loading</h1> : error ? <h1 className="error-msg">{error}</h1> : children}
    </PostContext.Provider>
  );
};
