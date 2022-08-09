import { useState } from 'react';

export const CommentForm = ({ initialValue = '', loading, error, onSubmit, autoFocus = false }) => {
  const [message, setMessage] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message).then(() => setMessage(''));
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          autoFocus={autoFocus}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
        />
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Loading' : 'Post'}
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </form>
  );
};
