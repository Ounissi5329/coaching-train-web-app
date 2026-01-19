import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  ChatBubbleLeftIcon, 
  TrashIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolid, 
  HandThumbDownIcon as HandThumbDownSolid 
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ courseId, lessonId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [courseId, lessonId]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(courseId, lessonId);
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to comment');
    if (!newComment.trim()) return;

    try {
      const response = await commentAPI.createComment({
        content: newComment,
        courseId,
        lessonId
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const response = await commentAPI.createComment({
        content: replyContent,
        courseId,
        lessonId,
        parentCommentId: parentId
      });
      
      setComments(comments.map(c => {
        if (c._id === parentId) {
          return { ...c, replies: [...(c.replies || []), response.data] };
        }
        return c;
      }));
      
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted');
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleReaction = async (commentId, type, isReply = false, parentId = null) => {
    if (!isAuthenticated) return toast.error('Please login to react');
    try {
      const response = await commentAPI.reactToComment(commentId, type);
      
      if (isReply) {
        setComments(comments.map(c => {
          if (c._id === parentId) {
            return {
              ...c,
              replies: c.replies.map(r => r._id === commentId ? { ...r, likes: response.data.likes, dislikes: response.data.dislikes } : r)
            };
          }
          return c;
        }));
      } else {
        setComments(comments.map(c => 
          c._id === commentId ? { ...c, likes: response.data.likes, dislikes: response.data.dislikes } : c
        ));
      }
    } catch (error) {
      toast.error('Reaction failed');
    }
  };

  const handleDelete = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentAPI.deleteComment(commentId);
      if (isReply) {
        setComments(comments.map(c => {
          if (c._id === parentId) {
            return { ...c, replies: c.replies.filter(r => r._id !== commentId) };
          }
          return c;
        }));
      } else {
        setComments(comments.filter(c => c._id !== commentId));
      }
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }) => {
    const isLiked = user && comment.likes?.includes(user._id);
    const isDisliked = user && comment.dislikes?.includes(user._id);
    const canDelete = user && (user._id === comment.user?._id || user.role === 'admin');

    return (
      <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="flex-shrink-0">
          {comment.user?.avatar ? (
            <img src={comment.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {comment.user?.firstName?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="font-bold text-gray-900 text-sm">
                  {comment.user?.firstName} {comment.user?.lastName}
                </span>
	                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] uppercase font-bold">
	                  {comment.user?.role === 'coach' ? 'Instructor' : comment.user?.role === 'client' ? 'Student' : comment.user?.role}
	                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button 
              onClick={() => handleReaction(comment._id, 'like', isReply, parentId)}
              className={`flex items-center gap-1 text-xs font-medium ${isLiked ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              {isLiked ? <HandThumbUpSolid className="w-4 h-4" /> : <HandThumbUpIcon className="w-4 h-4" />}
              {comment.likes?.length || 0}
            </button>
            <button 
              onClick={() => handleReaction(comment._id, 'dislike', isReply, parentId)}
              className={`flex items-center gap-1 text-xs font-medium ${isDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
            >
              {isDisliked ? <HandThumbDownSolid className="w-4 h-4" /> : <HandThumbDownIcon className="w-4 h-4" />}
              {comment.dislikes?.length || 0}
            </button>
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-indigo-600"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                Reply
              </button>
            )}
            {canDelete && (
              <button 
                onClick={() => handleDelete(comment._id, isReply, parentId)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          {replyingTo === comment._id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="mt-4 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          )}

          {comment.replies?.map(reply => (
            <CommentItem key={reply._id} comment={reply} isReply={true} parentId={comment._id} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ChatBubbleLeftIcon className="w-6 h-6 text-indigo-600" />
        Discussion ({comments.length})
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8 flex gap-4">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="1"
              className="flex-1 bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="px-6 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded-2xl text-center mb-8">
          <p className="text-gray-600 text-sm">Please <Link to="/login" className="text-indigo-600 font-bold hover:underline">login</Link> to join the discussion.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-10">No comments yet. Be the first to start the conversation!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;