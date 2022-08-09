import { Comment } from './Comment';

export const CommentList = ({ comments }) => {
  return comments.map((comment) => {
    return (
      <div key={comment.id} className="comment-stack">
        <Comment {...comment} />
      </div>
    );
  });
};
