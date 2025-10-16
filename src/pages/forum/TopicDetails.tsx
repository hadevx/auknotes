import Layout from "@/Layout";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Reply,
  Crown,
  Heart,
  Lock,
  ThumbsDown,
} from "lucide-react";
import {
  useGetTopicByIdQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useAdminDeleteCommentMutation,
  useLikeTopicMutation,
} from "@/redux/queries/forumApi";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { categories, courses } from "./index";

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
  const [searchCourse, setSearchCourse] = useState("");
  const [editTopic, setEditTopic] = useState({
    title: "",
    description: "",
    category: "",
    course: "",
  });

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (topic) {
      setEditTopic({
        title: topic.title,
        description: topic.description,
        category: "General",
        course: "",
      });
      setLikesCount(topic?.likes?.length || 0);
      setIsLiked(topic?.likes?.includes(userInfo?._id));
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
    if (!replyText.trim() || !replyParent || !userInfo) return;
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
      const payload =
        editTopic.category === "Course" ? { ...editTopic, category: editTopic.course } : editTopic;
      await updateTopic({ topicId: id, ...payload }).unwrap();
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

  // ✅ Like Topic (Optimistic UI)
  const handleLikeTopic = async () => {
    if (!userInfo) return;

    // store previous state
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // optimistic update
    const newLiked = !prevLiked;
    setIsLiked(newLiked);
    setLikesCount(prevCount + (newLiked ? 1 : -1));

    try {
      await likeTopic({ topicId: id }).unwrap();
      // no need to update state from server unless you want to ensure consistency
    } catch (err: any) {
      // revert
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
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
            <div className="border-l-4 border-blue-400 bg-blue-50 p-2 mb-2 rounded-r-md text-sm text-gray-700">
              <p className="font-medium text-blue-600">@{parent.author?.username || "Unknown"}:</p>
              <p className="italic text-gray-600 line-clamp-3">“{parent.text}”</p>
            </div>
          )}

          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-3 items-start">
              <div className="flex gap-2 items-center ">
                {comment?.author?.avatar ? (
                  <img
                    src={`/avatar/${comment.author.avatar}`}
                    alt={comment.author.name}
                    className="size-9 lg:size-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="size-8 lg:size-10 rounded-md uppercase bg-tomato flex items-center justify-center text-white font-semibold">
                    {comment?.author?.username?.charAt(0) +
                      comment?.author?.username?.charAt(comment.author.username.length - 1)}
                  </div>
                )}
                <div>
                  {/* <p className="text-gray-800 text-lg">{comment.text}</p> */}
                  <p className="font-medium text-xs flex flex-col  lg:text-sm text-black/50 ">
                    <div className="flex gap-1 items-center ">
                      <p className="text-sm text-black">{comment?.author?.name}</p>
                      {comment?.author?.isAdmin && (
                        <span className="">
                          <Crown className="size-4 lg:size-4  text-blue-500" />
                          {/* <img src="/badge.png" alt="" className="size-4" /> */}
                        </span>
                      )}
                      {comment?.author?.isVerified && (
                        <span className="">
                          <img src="/verify.png" alt="" className="size-4" />
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>
                        <span className="">@</span>
                        {comment?.author?.username}
                      </p>
                      <span>-</span>
                      <FormatDate date={comment?.createdAt} />
                    </div>
                  </p>
                </div>
              </div>
              <div>{comment?.text}</div>
            </div>

            {!topic?.isClosed && userInfo && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 p-1"
                  onClick={() => openReplyDialog(comment)}>
                  <Reply className="w-4 h-4" />
                </Button>

                {comment?.author?._id === userInfo?._id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-rose-500 bg-rose-100 hover:bg-rose-200  text-rose-500 "
                    onClick={() => handleDeleteComment(comment?._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : userInfo?.isAdmin ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="p-1"
                    onClick={() => handleAdminDeleteComment(comment?._id)}>
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
            {/* Back - Category */}
            <div className="flex justify-start gap-2 items-center mb-5">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2  px-2 py-1 rounded-full border bg-white hover:bg-zinc-100 text-black transition-colors">
                <span className="font-medium text-xs">← Back</span>
              </button>
              <div className="bg-rose-500 px-2 py-1 text-xs rounded-full text-white">
                {topic?.category}
              </div>
            </div>
            {/* Topic Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex gap-2 items-center">
                {topic?.author?.avatar ? (
                  <img
                    src={`/avatar/${topic.author.avatar}`}
                    alt={topic.author.name}
                    loading="lazy"
                    className={`size-14 rounded-md object-cover `}
                  />
                ) : (
                  <div className="size-14 uppercase rounded-md bg-tomato flex items-center justify-center text-white font-semibold">
                    {topic?.author?.username?.charAt(0) +
                      topic?.author?.username?.charAt(topic?.author?.username?.length - 1)}
                  </div>
                )}
                <Link to={`/forum/${topic?._id}`}>
                  <div className="">
                    <div className="flex gap-1 items-center">
                      <p className="text-lg text-black">{topic?.author?.name} </p>
                      {topic?.author?.isAdmin && (
                        <span className="">
                          <Crown className="size-4 text-blue-500" />
                          {/* <img src="/badge.png" alt="" className="size-5" /> */}
                        </span>
                      )}
                      {topic?.author?.isVerified && (
                        <span className="">
                          <img src="/verify.png" alt="" className="size-5" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">@{topic?.author?.username}</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {topic?.author?._id === userInfo?._id && (
                  <>
                    {/* Edit Topic */}
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1">
                      <Edit className="w-4 h-4 " />
                    </Button>
                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1 bg-rose-100 border-rose-500 text-rose-500"
                      onClick={handleDeleteTopic}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Topic Title & Description */}
            {/* <p className="text-black font-bold text-2xl mb-2 ">{topic?.title}</p> */}
            <div
              className="ql-editor text-black  text-lg mb-4 !p-0 [&>p]:!m-0 [&>p]:!p-0"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic?.description || "") }}
            />
            <p className="text-sm text-gray-500">
              <FormatDate variant="full" date={topic?.createdAt} />
            </p>

            {/* Likes - Messages Section */}
            <div className="mt-2 flex justify-between items-center">
              <div className="flex  gap-3 ">
                <p className="text-sm sm:text-lg flex items-center gap-2">
                  <MessageSquare className="size-4 sm:size-5 " /> {topic?.comments?.length}
                </p>
                {/* Like Button */}
                <button
                  onClick={handleLikeTopic}
                  disabled={!userInfo}
                  className={`flex items-center gap-2 px-2 py-0.5 rounded-full border transition-all duration-200 ${
                    isLiked
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(255,0,0,0.3)] text-white border-rose-500"
                      : "hover:bg-rose-50 text-rose-600 border-rose-300"
                  }`}>
                  <motion.div
                    animate={isLiked ? { scale: [0, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}>
                    <Heart
                      className={`size-4 lg:size-5  transition-all ${
                        isLiked ? "fill-white" : "fill-transparent"
                      }`}
                    />
                  </motion.div>
                  <span className="text-sm sm:text-lg">{likesCount}</span>
                </button>
                {/* Dislike Button */}
                {/*    <button
                  onClick={handleLikeTopic}
                  disabled={!userInfo}
                  className={`flex items-center gap-2 px-2 py-0.5 rounded-full border transition-all duration-200 ${
                    isLiked
                      ? "bg-gray-500 shadow-[0_0_10px_rgba(255,0,0,0.3)] text-white border-gray-500"
                      : "hover:bg-rose-50 text-gray-600 border-gray-300"
                  }`}>
                  <motion.div
                    animate={isLiked ? { scale: [0, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}>
                    <ThumbsDown className={`size-4 lg:size-5  transition-all `} />
                  </motion.div>
                  <span className="text-sm sm:text-lg">{likesCount}</span>
                </button> */}
                {topic?.isClosed && (
                  <div className="flex items-center justify-center gap-2 px-2 py-1 rounded-full bg-gray-600  text-white font-medium">
                    <span className="">
                      <Lock className="size-5 " />
                    </span>
                    <span className="text-sm ">Closed by the admin.</span>
                  </div>
                )}
              </div>
              {!topic?.isClosed && userInfo && (
                <Button
                  onClick={() => setIsCommentDialogOpen(true)}
                  size="sm"
                  className="flex items-center gap-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <Plus className="w-4 h-4" /> Reply
                </Button>
              )}
            </div>

            {/* Render Comments */}
            <div className="space-y-3 mt-3">
              {topic?.comments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              ) : (
                renderComments(topic?.comments)
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Topic */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              className="h-40 lg:h-80"
              modules={{
                toolbar: [
                  // [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ script: "sub" }, { script: "super" }], // Subscript / superscript
                  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }], // Lists
                  [{ color: [] }, { background: ["#FFFF00"] }],
                  // ["link", "image", "video"],
                  // ["clean"],
                  ["code-block"], // Code block
                ],
              }}
            />
            <div className="mt-20">
              <Select
                value={editTopic.category}
                onValueChange={(value) =>
                  setEditTopic({ ...editTopic, category: value, course: "" })
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
            {/* Course Dropdown (searchable) */}
            {editTopic.category === "Course" && (
              <Select
                value={editTopic.course}
                onValueChange={(value) => setEditTopic({ ...editTopic, course: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  <div className="sticky top-0 bg-white p-2 border-b">
                    <Input
                      placeholder="Search courses..."
                      value={searchCourse}
                      onChange={(e) => setSearchCourse(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  {courses
                    .filter((course) => course.toLowerCase().includes(searchCourse.toLowerCase()))
                    .map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            <Button className="w-full" onClick={handleUpdateTopic}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
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
      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to @{replyParent?.author?.username || "Comment"}</DialogTitle>
          </DialogHeader>
          <div className="border-l-4 border-blue-500 bg-gray-100 p-3 mb-2 rounded-r-md text-base text-black">
            <p className="italic  line-clamp-3">“{replyParent?.text}”</p>
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
