import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  Crown,
  Lock,
  Unlock,
  Trash2,
  Heart,
  ChevronDown,
} from "lucide-react";
import Layout from "@/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useCloseTopicMutation,
  useAdminDeleteTopicMutation,
} from "@/redux/queries/forumApi";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";
import ReactQuill from "react-quill-new";
import { categories, courses } from "./index";
import Loader from "@/components/Loader";
import FormatDate from "@/components/FormatDate";

export default function ForumPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    category: "General",
    course: "",
  });
  const [searchCourse, setSearchCourse] = useState("");

  const { userInfo } = useSelector((state: any) => state.auth);

  const {
    data,
    isLoading: loadingTopics,
    refetch,
  } = useGetTopicsQuery({
    pageNumber: page,
    category: selectedCategory,
    search: query,
  });

  const topics = data?.topics;
  const pages = data?.pages;

  console.log(topics);

  const [createTopic] = useCreateTopicMutation();
  const [closeTopic] = useCloseTopicMutation();
  const [adminDeleteTopic] = useAdminDeleteTopicMutation();

  // -------------------- Handlers --------------------

  const handleCreateTopic = async () => {
    if (!newTopic.title || !newTopic.description) {
      toast.error("Please provide both title and description");
      return;
    }

    if (!userInfo) {
      toast.error("You must be logged in to create a topic");
      navigate("/login");
      return;
    }

    try {
      const payload =
        newTopic.category === "Course" ? { ...newTopic, category: newTopic.course } : newTopic;

      await createTopic(payload).unwrap();

      setNewTopic({
        title: "",
        description: "",
        category: "General",
        course: "",
      });
      setIsDialogOpen(false);
      refetch();
      toast.success("Topic created successfully");
    } catch (err) {
      console.error("Failed to create topic:", err);
      toast.error(err?.data?.message || err?.error || "Error creating topic. Please try again.");
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      await closeTopic(topicId).unwrap();
      toast.success("Topic status updated successfully");
      refetch();
    } catch (err) {
      console.error("Failed to toggle topic:", err);
      toast.error("Error updating topic");
    }
  };

  const handleAdminDeleteTopic = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    try {
      await adminDeleteTopic(topicId).unwrap();
      toast.success("Topic deleted successfully by admin");
      refetch();
    } catch (err) {
      console.error("Failed to delete topic:", err);
      toast.error("Error deleting topic");
    }
  };

  const handleDialogOpen = () => {
    if (!userInfo) {
      toast.error("You must be logged in to create a topic");
      return;
    }
    setIsDialogOpen(true);
  };

  // -------------------- UI --------------------

  return (
    <Layout>
      {loadingTopics ? (
        <Loader />
      ) : (
        <div className="max-w-4xl min-h-screen mx-auto px-2 lg:px-0 py-10  pb-20">
          <h1 className="text-3xl font-bold mb-6 flex justify-between">
            AUKNotes Forum
            <Button onClick={handleDialogOpen} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Topic
            </Button>
          </h1>

          {/* -------------------- Search & Category Filter -------------------- */}
          <div className="flex flex-col sm:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 flex items-center">
              <input
                placeholder="Search topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white py-3 w-full border px-10 rounded-md focus:ring-2 shadow-sm focus:ring-tomato focus:border-tomato outline-none"
              />
              <Search className="absolute left-2 w-5 h-5 text-gray-500" />
            </div>

            {/* Category Buttons + Course Dropdown */}
            <div className="flex gap-2 flex-wrap items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat !== "Course") setNewTopic((prev) => ({ ...prev, course: "" }));
                  }}
                  className={`text-sm px-4 py-2 rounded-full border ${
                    selectedCategory === cat
                      ? "bg-tomato text-white"
                      : "text-black bg-white hover:bg-gray-100"
                  }`}>
                  {cat}
                </button>
              ))}

              {/* 👇 Searchable Course Dropdown */}
              <Select
                value={newTopic.course}
                onValueChange={(value) => {
                  setNewTopic({ ...newTopic, course: value });
                  setSelectedCategory(value);
                }}>
                <SelectTrigger
                  className={`bg-white rounded-full [&>svg]:hidden px-3 py-1 ${
                    selectedCategory === newTopic.course ? "bg-tomato  text-white" : ""
                  }`}>
                  <SelectValue placeholder="Select Course" />
                  <ChevronDown
                    style={{ display: "block" }}
                    className={`text-black w-4 h-4 ${
                      selectedCategory === newTopic.course ? "text-white" : ""
                    }`}
                  />
                </SelectTrigger>

                <SelectContent className="max-h-64 overflow-y-auto ">
                  {/* 🔍 Search input inside dropdown */}
                  <div className="sticky top-0 bg-white z-10 p-2 border-b">
                    <Input
                      placeholder="Search courses..."
                      value={searchCourse}
                      onChange={(e) => setSearchCourse(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Filtered course list */}
                  {courses
                    .filter((course) => course.toLowerCase().includes(searchCourse.toLowerCase()))
                    .map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* -------------------- Topics List -------------------- */}
          <div className="space-y-2">
            {topics?.length === 0 && <p className="text-center text-gray-500">No topics found.</p>}

            {topics?.map((post) => {
              const authorName = post?.author?.name || "Unknown";

              const isAdmin = post.author?.isAdmin;

              return (
                <div
                  key={post._id}
                  className={`border rounded-lg p-4  flex justify-between items-center transition ${
                    isAdmin
                      ? "bg-neutral-900 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                      : "bg-white shadow border-gray-200"
                  }`}>
                  <Link to={`/forum/${post._id}`} className="flex items-center gap-3 flex-1">
                    {post?.author?.avatar ? (
                      <img
                        src={isAdmin ? "/n.png" : post?.author?.avatar}
                        alt={authorName}
                        className={`size-20  object-cover ${
                          isAdmin ? "ring-2 logo rounded-full" : "rounded-md"
                        }`}
                      />
                    ) : (
                      <div
                        className={`size-20 rounded-md text-3xl flex items-center uppercase justify-center font-semibold ${
                          isAdmin ? "bg-white text-black" : "bg-tomato text-white"
                        }`}>
                        {post.author.username.charAt(0) +
                          post.author.username.charAt(post.author.username.length - 1)}
                      </div>
                    )}

                    <div>
                      <span className={`block  ${isAdmin ? "text-white font-bold" : ""}`}>
                        {post.title}
                      </span>
                      <p
                        className={`text-xs lg:text-sm flex items-center gap-3
                         ${isAdmin ? "text-white" : "text-gray-500"}`}>
                        <p className="flex gap-2 items-center">
                          {userInfo?._id === post.author._id
                            ? "By You"
                            : `By ${post?.author?.name}`}{" "}
                          {isAdmin && (
                            <span className="bg-tomato flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full">
                              <Crown size={16} />
                              Admin
                            </span>
                          )}
                        </p>
                        |
                        <FormatDate date={post.createdAt} />
                      </p>
                      <div className="flex items-center  gap-3 mt-1">
                        <span
                          className={`flex items-center gap-1 ${
                            isAdmin ? "text-white" : "text-gray-600"
                          }`}>
                          <MessageSquare className="w-4 h-4" />
                          {post?.commentCount}
                        </span>
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full border border-rose-300 bg-rose-50 text-rose-600 transition-all duration-300  `}>
                          <Heart
                            className={`w-5 h-5 transition-all ${
                              post?.likes?.includes(userInfo?._id)
                                ? "fill-rose-500 text-rose-500 "
                                : "text-rose-500"
                            }`}
                          />
                          <span className="font-medium text-sm">{post?.likes?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex  items-center gap-3">
                    <span
                      className={`hidden  items-center gap-1 ${
                        isAdmin ? "text-white" : "text-gray-600"
                      }`}>
                      <MessageSquare className="w-4 h-4" />
                      {post?.commentCount}
                    </span>
                    <span
                      className={`hidden  items-center gap-2 px-3 py-1 rounded-full border border-rose-300 bg-rose-50 text-rose-600 transition-all duration-300 hover:bg-rose-100 hover:scale-105`}>
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          post?.likes?.includes(userInfo?._id)
                            ? "fill-rose-500 text-rose-500 "
                            : "text-rose-500"
                        }`}
                      />
                      <span className="font-medium text-sm">{post?.likes?.length || 0}</span>
                    </span>

                    {userInfo?.isAdmin && (
                      <>
                        {!post.isClosed ? (
                          <Button
                            onClick={() => handleToggleTopic(post._id)}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
                            <Lock size={16} />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleToggleTopic(post._id)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                            <Unlock size={16} />
                          </Button>
                        )}

                        <Button
                          onClick={() => handleAdminDeleteTopic(post._id)}
                          size="sm"
                          className="bg-red-500 hover:bg-gray-800 text-white flex items-center gap-1">
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}

                    {post.isClosed && !userInfo?.isAdmin && (
                      <span className="text-sm lg:text-lg text-red-600 font-medium flex items-center gap-1">
                        <Lock size={14} /> Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Paginate page={page} pages={pages} setPage={setPage} />
        </div>
      )}

      {/* -------------------- Create Topic Modal -------------------- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            />

            <ReactQuill
              theme="snow"
              value={newTopic.description}
              onChange={(value) => setNewTopic({ ...newTopic, description: value })}
              placeholder="Write your topic description here..."
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
              className="h-40 "
            />

            <div className="mt-22 sm:mt-16 flex gap-3">
              {/* Category Dropdown */}
              <Select
                value={newTopic.category}
                onValueChange={(value) =>
                  setNewTopic({ ...newTopic, category: value, course: "" })
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

              {/* Course Dropdown (searchable) */}
              {newTopic.category === "Course" && (
                <Select
                  value={newTopic.course}
                  onValueChange={(value) => setNewTopic({ ...newTopic, course: value })}>
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
            </div>
            <Button className="w-full" onClick={handleCreateTopic}>
              Create Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
