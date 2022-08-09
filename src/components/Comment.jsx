import { IconBtn } from './IconBtn';
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa';
import { usePost } from '../context/PostContext';
import { CommentList } from './CommentList';
import { useState } from 'react';
import { CommentForm } from './CommentForm';
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from '../services/comments';
import { useAsyncFn } from '../hooks/useAsync';
import { useUser } from '../hooks/useUser';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyled: 'medium',
  timeStyle: 'short',
});

export const Comment = ({ id, message, user, createdAt, likeCount, likedByMe }) => {
  const {
    post,
    getReplies,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
    toggleLocalCommentLike,
  } = usePost();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const createCommentFn = useAsyncFn(createComment);
  const updateCommentFn = useAsyncFn(updateComment);
  const deleteCommentFn = useAsyncFn(deleteComment);
  const toggleCommentLikeFn = useAsyncFn(toggleCommentLike);
  const currentUser = useUser();

  const onCommentReply = (message) => {
    return createCommentFn.execute({ postId: post.id, message, parentId: id }).then((comment) => {
      createLocalComment(comment);
      setIsReplying(false);
    });
  };

  const onCommentUpdate = (message) => {
    return updateCommentFn
      .execute({
        postId: post.id,
        message,
        id,
      })
      .then((comment) => {
        setIsEditing(false);
        updateLocalComment(id, comment.message);
      });
  };

  const onCommentDelete = () => {
    return deleteCommentFn
      .execute({
        postId: post.id,
        id,
      })
      .then((comment) => {
        deleteLocalComment(comment.id);
      });
  };

  function onToggleCommentLike() {
    return toggleCommentLikeFn
      .execute({ id, postId: post.id })
      .then(({ addLike }) => toggleLocalCommentLike(id, addLike));
  }
  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">{dateFormatter.format(Date.parse(createdAt))}</span>
        </div>

        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={message}
            onSubmit={onCommentUpdate}
            loading={updateCommentFn.loading}
            error={updateCommentFn.error}
          />
        ) : (
          <div className="message">{message}</div>
        )}

        <div className="footer">
          <IconBtn
            onClick={onToggleCommentLike}
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? 'Unlike' : 'Like'}
          >
            {likeCount}
          </IconBtn>

          <IconBtn
            isActive={isReplying}
            onClick={() => setIsReplying((prev) => !prev)}
            Icon={FaReply}
            aria-label={isReplying ? 'Cancel reply' : 'Reply'}
          />

          {user.id === currentUser.id && (
            <>
              <IconBtn
                isActive={isEditing}
                onClick={() => setIsEditing((prev) => !prev)}
                Icon={FaEdit}
                aria-label={isEditing ? 'Cancel edit' : 'Edit'}
              />

              <IconBtn
                disabled={deleteCommentFn.loading}
                onClick={() => onCommentDelete(id)}
                Icon={FaTrash}
                aria-label="Delete"
                color="danger"
              />
            </>
          )}
        </div>
      </div>
      {deleteCommentFn.error && <div className="error-msg">{deleteCommentFn.error}</div>}
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div className={`nested-comments-stack ${areChildrenHidden ? 'hide' : ''}`}>
            <button
              className="collapse-line"
              aria-label="Hide replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? 'hide' : ''}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
};
