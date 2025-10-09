import Layout from "@/Layout";
import { MessageSquare, Plus, Trash2, Edit, Reply, Crown, Heart } from "lucide-react";
import {
  useGetTopicByIdQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useAdminDeleteCommentMutation,
  useLikeTopicMutation,
} from "@/redux/queries/forumApi";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Loader";
import FormatDate from "@/components/FormatDate";
import { motion } from "framer-motion";

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: topic, isLoading: loadingTopic, refetch } = useGetTopicByIdQuery(id);
  const { userInfo } = useSelector((state: any) => state.auth);

  console.log(topic);

  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [adminDeleteComment] = useAdminDeleteCommentMutation();
  const [likeTopic] = useLikeTopicMutation();

  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyParent, setReplyParent] = useState<any>(null);

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editTopic, setEditTopic] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (topic) {
      setEditTopic({
        title: topic.title,
        description: topic.description,
        category: topic.category,
      });
      setLikesCount(topic.likes?.length || 0);
      setIsLiked(topic.likes?.includes(userInfo?._id));
    }
  }, [topic, userInfo]);

  // ✅ Add Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({
        topicId: id,
        comment: { text: newComment, parentComment: null },
      }).unwrap();
      setNewComment("");
      setIsCommentDialogOpen(false);
      toast.success("Comment added successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add comment");
    }
  };

  // ✅ Open Reply Dialog
  const openReplyDialog = (parent: any) => {
    setReplyParent(parent);
    setIsReplyDialogOpen(true);
  };

  // ✅ Add Reply
  const handleAddReply = async () => {
    if (!replyText.trim() || !replyParent) return;
    try {
      await addComment({
        topicId: id,
        comment: { text: replyText, parentComment: replyParent._id },
      }).unwrap();
      setReplyText("");
      setReplyParent(null);
      setIsReplyDialogOpen(false);
      toast.success("Reply added successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add reply");
    }
  };

  // ✅ Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment({ topicId: id, commentId }).unwrap();
      toast.success("Comment deleted successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete comment");
    }
  };

  // ✅ Admin Delete Comment
  const handleAdminDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment as admin?")) return;
    try {
      await adminDeleteComment({ topicId: id, commentId }).unwrap();
      toast.success("Comment deleted successfully by admin!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete comment");
    }
  };

  // ✅ Update Topic
  const handleUpdateTopic = async () => {
    if (!editTopic.title.trim() || !editTopic.description.trim()) return;
    try {
      await updateTopic({
        topicId: id,
        title: editTopic.title,
        description: editTopic.description,
        category: editTopic.category,
      }).unwrap();
      setIsEditDialogOpen(false);
      toast.success("Topic updated successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update topic");
    }
  };

  // ✅ Delete Topic
  const handleDeleteTopic = async () => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await deleteTopic({ topicId: id }).unwrap();
      toast.success("Topic deleted successfully!");
      navigate("/forum");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete topic");
    }
  };

  // ✅ Like Topic
  const handleLikeTopic = async () => {
    try {
      const res = await likeTopic({ topicId: id }).unwrap();
      setLikesCount(res.likes?.length || 0);
      setIsLiked(res.likes?.includes(userInfo?._id));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to like topic");
    }
  };

  // ✅ Render Comments
  const renderComments = (comments: any[]) => {
    return comments?.map((comment) => {
      const parent = comments.find((c) => c._id === comment.parentComment);
      return (
        <div key={comment._id} className="border rounded-md p-3 bg-gray-50 mt-3">
          {parent && (
            <div className="border-l-4 border-blue-400 bg-blue-50 p-3 mb-2 rounded-r-md text-sm text-gray-700">
              <p className="font-medium text-blue-600">
                Replying to {parent.author?.name || "Unknown"}:
              </p>
              <p className="italic text-gray-600 line-clamp-3">“{parent.text}”</p>
            </div>
          )}

          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3 items-start">
              {comment?.author?.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full uppercase bg-tomato flex items-center justify-center text-white font-semibold">
                  {comment?.author?.username?.charAt(0) +
                    comment?.author?.username?.charAt(comment.author.username.length - 1)}
                </div>
              )}
              <div>
                <p className="text-gray-800 text-lg">{comment.text}</p>
                <p className="font-medium text-xs flex flex-col lg:flex-row gap-1 lg:text-sm text-black/50 mt-1">
                  <p className="flex gap-2 items-center">
                    {userInfo?._id === comment.author._id ? "By You" : `By ${comment.author?.name}`}{" "}
                    •{" "}
                    {comment.author.isAdmin && (
                      <span className="bg-tomato flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full">
                        <Crown size={16} /> Admin
                      </span>
                    )}
                  </p>
                  <FormatDate date={comment?.createdAt} />
                </p>
              </div>
            </div>

            {!topic?.isClosed && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 p-1"
                  onClick={() => openReplyDialog(comment)}>
                  <Reply className="w-4 h-4" />
                </Button>

                {comment.author?._id === userInfo?._id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-rose-500 bg-rose-600 hover:bg-rose-500 hover:text-white text-white p-1"
                    onClick={() => handleDeleteComment(comment._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : userInfo?.isAdmin ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="p-1"
                    onClick={() => handleAdminDeleteComment(comment._id)}>
                    <Trash2 className="w-4 h-4" /> Admin
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <Layout>
      {loadingTopic ? (
        <Loader />
      ) : (
        <div className="max-w-4xl min-h-screen mx-auto px-4 py-10 space-y-6">
          <div className="border bg-white rounded-lg p-6 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-2 px-2 rounded-full border bg-white hover:bg-zinc-100 text-black transition-colors">
              <span className="text-lg">←</span>
              <span className="font-medium text-sm">Back</span>
            </button>

            {/* Topic Header */}
            <div className="flex items-center gap-3 mb-4">
              {topic?.author?.avatar ? (
                <img
                  src={topic.author.avatar}
                  alt={topic.author.name}
                  className={`w-10 h-10 rounded-full object-cover ${
                    topic.author.isAdmin ? "ring-black ring-2" : ""
                  }`}
                />
              ) : (
                <div className="w-10 h-10 uppercase rounded-full bg-tomato flex items-center justify-center text-white font-semibold">
                  {topic?.author?.username?.charAt(0) +
                    topic?.author?.username?.charAt(topic.author.username.length - 1)}
                </div>
              )}

              <div className="text-sm text-gray-500 flex-1">
                <p className="font-medium text-black/70 flex gap-2">
                  {topic?.author?.name}{" "}
                  {topic?.author?.isAdmin && (
                    <span className="bg-tomato flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full">
                      <Crown size={16} /> Admin
                    </span>
                  )}
                </p>
                <p>
                  <FormatDate date={topic?.createdAt} /> • {topic?.category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* ❤️ Like Button */}
                <button
                  onClick={handleLikeTopic}
                  disabled={!userInfo}
                  className={` hidden items-center gap-2 px-3 py-1 rounded-full border transition ${
                    isLiked
                      ? "bg-rose-500 text-white border-rose-500"
                      : "hover:bg-rose-50 text-rose-600 border-rose-300"
                  }`}>
                  <Heart
                    className={`w-5 h-5 transition ${isLiked ? "fill-white" : "fill-transparent"}`}
                  />
                  <span>{likesCount}</span>
                </button>

                {/* ✏️ Edit Topic */}
                {topic?.author?._id === userInfo?._id && (
                  <>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-4xl ">
                        <DialogHeader>
                          <DialogTitle>Edit Topic</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Title"
                            value={editTopic.title}
                            onChange={(e) => setEditTopic({ ...editTopic, title: e.target.value })}
                          />
                          <ReactQuill
                            theme="snow"
                            value={editTopic.description}
                            onChange={(value) => setEditTopic({ ...editTopic, description: value })}
                            className="h-80"
                          />
                          <div className="mt-20">
                            <Select
                              value={editTopic.category}
                              onValueChange={(value) =>
                                setEditTopic({ ...editTopic, category: value })
                              }>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {["General", "Professor", "Course"].map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full" onClick={handleUpdateTopic}>
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* 🗑️ Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={handleDeleteTopic}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Topic Title & Description */}
            <p className="text-black font-bold text-2xl mb-2 ">{topic?.title}</p>
            <div
              className="ql-editor text-gray-700 mb-4 "
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic?.description || "") }}
            />

            {/*  {topic?.updatedAt !== topic?.createdAt && (
              <p className="text-gray-700 mb-2 text-sm italic">
                Updated at <FormatDate date={topic?.updatedAt} />
              </p>
            )} */}

            {/* Comments Section */}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-lg   flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> {topic?.comments?.length}
                </h2>
                {/* ❤️ Like Button */}

                <button
                  onClick={handleLikeTopic}
                  disabled={!userInfo}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 ${
                    isLiked
                      ? "bg-rose-500 text-white border-rose-500"
                      : "hover:bg-rose-50 text-rose-600 border-rose-300"
                  }`}>
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}>
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isLiked ? "fill-white" : "fill-transparent"
                      }`}
                    />
                  </motion.div>
                  <span className="font-medium">{likesCount}</span>
                </button>
              </div>
              {!topic?.isClosed && userInfo && (
                <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Reply
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Comment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button className="w-full" onClick={handleAddComment} disabled={isAdding}>
                        {isAdding ? "Adding..." : "Submit"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Render Comments */}
            <div className="space-y-3 mt-3">
              {topic?.isClosed && (
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-md text-center text-gray-600 font-medium">
                  🚫 This topic is closed.
                </div>
              )}

              {topic?.comments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              ) : (
                renderComments(topic?.comments)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to {replyParent?.author?.name || "Comment"}</DialogTitle>
          </DialogHeader>
          <div className="border-l-4 border-blue-400 bg-blue-50 p-3 mb-2 rounded-r-md text-sm text-gray-700">
            <p className="italic text-gray-600 line-clamp-3">“{replyParent?.text}”</p>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button className="w-full" onClick={handleAddReply}>
              Submit Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TopicDetails;
