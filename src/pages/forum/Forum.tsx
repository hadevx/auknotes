import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  Heart,
  Lock,
  Unlock,
  Trash2,
  Filter,
  X,
  MessageSquare,
  MessagesSquare,
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

/**
 * Updates requested:
 * ✅ if post is closed -> add "Closed" badge next to likes (footer)
 * ✅ for admin posts -> add a clear Admin badge in header
 * ✅ NO title anywhere
 */

function stripHtml(html: string) {
  if (!html) return "";
  const cleaned = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  const text = cleaned.replace(/<\/?[^>]+(>|$)/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function initials(username?: string) {
  if (!username) return "AU";
  const a = username.charAt(0);
  const b = username.charAt(username.length - 1);
  return (a + b).toUpperCase();
}

function prettyCount(n: number) {
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
}

function cx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

export default function ForumPage() {
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  const [newTopic, setNewTopic] = useState({
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

  const [createTopic] = useCreateTopicMutation();
  const [closeTopic] = useCloseTopicMutation();
  const [adminDeleteTopic] = useAdminDeleteTopicMutation();

  const MORE_THRESHOLD = 170;

  useEffect(() => {
    const styleId = "clamp-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .clamp-4 {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];
    if (selectedCategory && selectedCategory !== "General") {
      chips.push({ key: "cat", label: selectedCategory });
    }
    if (query?.trim()) chips.push({ key: "q", label: `Search: "${query.trim()}"` });
    return chips;
  }, [selectedCategory, query]);

  const clearSearch = () => setQuery("");

  const handleCreateTopic = async () => {
    if (!newTopic.description) {
      toast.error("Please write something");
      return;
    }

    if (!userInfo) {
      toast.info("You must be logged in to create a topic");
      navigate("/login");
      return;
    }

    try {
      const payload =
        newTopic.category === "Course"
          ? { description: newTopic.description, category: newTopic.course }
          : { description: newTopic.description, category: newTopic.category };

      await createTopic(payload as any).unwrap();

      setNewTopic({ description: "", category: "General", course: "" });
      setIsDialogOpen(false);
      refetch();
      toast.success("Post created");
    } catch (err: any) {
      console.error("Failed to create topic:", err);
      toast.error(err?.data?.message || err?.error || "Error creating post. Please try again.");
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    try {
      await closeTopic(topicId).unwrap();
      toast.success("Post status updated");
      refetch();
    } catch (err) {
      console.error("Failed to toggle topic:", err);
      toast.error("Error updating post");
    }
  };

  const handleAdminDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await adminDeleteTopic(topicId).unwrap();
      toast.success("Post deleted");
      refetch();
    } catch (err) {
      console.error("Failed to delete topic:", err);
      toast.error("Error deleting post");
    }
  };

  const handleDialogOpen = () => {
    if (!userInfo) {
      toast.info("You must be logged in to create a post");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      {loadingTopics ? (
        <Loader />
      ) : (
        <div className="min-h-screen ">
          <div className="max-w-4xl mx-auto px-3 lg:px-0 py-10 pb-20">
            <div className="bg-white border rounded-2xl mb-5">
              {/* Header Card */}
              <div className="rounded-2xl bg-white  p-5 ">
                <div className="flex items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Forum</h1>
                    <p className="text-sm text-slate-600 mt-1">
                      Share thoughts, ask questions, and connect with the AUK community.
                    </p>
                  </div>

                  <Button
                    onClick={handleDialogOpen}
                    className="flex items-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-700 shadow-[0_7px_15px_rgba(0,0,0,0.35)] hover:scale-[0.995]">
                    <Plus className="w-4 h-4" /> New Post
                  </Button>
                </div>

                {activeFilterChips.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {activeFilterChips.map((c) => (
                      <span
                        key={c.key}
                        className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        <Filter className="h-3.5 w-3.5" />
                        {c.label}
                      </span>
                    ))}
                    {query?.trim() && (
                      <button
                        onClick={clearSearch}
                        className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <X className="h-3.5 w-3.5" />
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search & Filters */}
              <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm p-4 ">
                <div className="flex flex-col sm:flex-row lg:items-center justify-between gap-4">
                  <div className="relative flex-1 flex items-center">
                    <input
                      placeholder="Search posts..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-white py-2 w-full border px-10 rounded-xl focus:ring-2 focus:ring-tomato focus:border-tomato outline-none"
                    />
                    <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                    {query?.trim() && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 p-1 rounded-md hover:bg-slate-100"
                        title="Clear">
                        <X className="h-4 w-4 text-slate-600" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center ">
                    {categories.map((cat: string) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          if (cat !== "Course") setNewTopic((prev) => ({ ...prev, course: "" }));
                        }}
                        className={cx(
                          "text-sm px-4 py-2 rounded-full border transition",
                          selectedCategory === cat
                            ? "bg-tomato border-tomato text-white shadow"
                            : "text-slate-800 bg-white hover:bg-slate-50"
                        )}>
                        {cat}
                      </button>
                    ))}

                    <Select
                      value={newTopic.course}
                      onValueChange={(value) => {
                        setNewTopic({ ...newTopic, course: value, category: "Course" });
                        setSelectedCategory(value);
                      }}>
                      <SelectTrigger className="bg-white rounded-full [&>svg]:hidden px-3 py-1 w-[180px]">
                        <SelectValue placeholder="Select Course" />
                        <ChevronDown style={{ display: "block" }} className="w-4 h-4 text-black" />
                      </SelectTrigger>

                      <SelectContent className="max-h-64 overflow-y-auto">
                        <div className="sticky top-0 bg-white z-10 p-2 border-b">
                          <Input
                            placeholder="Search courses..."
                            value={searchCourse}
                            onChange={(e) => setSearchCourse(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        {courses
                          .filter((course: string) =>
                            course.toLowerCase().includes(searchCourse.toLowerCase())
                          )
                          .map((course: string) => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {topics?.length === 0 && (
                <div className="rounded-2xl border bg-white shadow-sm p-8 text-center text-slate-600">
                  No posts found.
                </div>
              )}

              {topics?.map((post: any) => {
                const isAdmin = post?.author?.isAdmin;
                const isVerified = post?.author?.isVerified;

                const username = post?.author?.username || "aukstudent";
                const displayName = post?.author?.name || "AUK Student";
                const avatarUrl = post?.author?.avatar ? `/avatar/${post?.author?.avatar}` : null;

                const plain = stripHtml(post?.description || "");
                const shouldMore = plain.length > MORE_THRESHOLD;

                return (
                  <div
                    key={post._id}
                    className={cx(
                      "rounded-2xl border overflow-hidden bg-white shadow-sm transition",
                      "hover:shadow-md hover:-translate-y-[1px]"
                    )}>
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className={cx(
                              "h-11 w-11 object-cover rounded-md",
                              isAdmin && "ring-2 ring-slate-900"
                            )}
                          />
                        ) : (
                          <div
                            className={cx(
                              "h-11 w-11 rounded-md flex items-center justify-center text-sm font-extrabold",
                              isAdmin ? "bg-slate-900 text-white" : "bg-tomato text-white"
                            )}>
                            {initials(username)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 truncate">
                              {displayName}
                            </p>

                            {/* ✅ Admin badge for admin posts */}
                            {isAdmin && (
                              <span className="inline-flex items-center ">
                                <img src="/admin.png" className="size-4" alt="" />
                              </span>
                            )}

                            {isVerified && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Verified
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 truncate">
                            @{username} • <FormatDate date={post?.createdAt} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {userInfo?.isAdmin && (
                          <>
                            {!post.isClosed ? (
                              <Button
                                onClick={() => handleToggleTopic(post._id)}
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                title="Close">
                                <Lock size={16} />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleToggleTopic(post._id)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                title="Open">
                                <Unlock size={16} />
                              </Button>
                            )}

                            <Button
                              onClick={() => handleAdminDeleteTopic(post._id)}
                              size="sm"
                              className="bg-red-500 hover:bg-gray-800 text-white"
                              title="Delete">
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <Link to={`/forum/${post._id}`} className="block px-4 py-4">
                      <div className="text-base leading-7 text-slate-900">
                        <span className={shouldMore ? "clamp-4" : ""}>{plain}</span>

                        {shouldMore && (
                          <span className="ml-2">
                            <span className="text-slate-400">…</span>{" "}
                            <span className="inline-flex items-center rounded-full border bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100">
                              Read more
                            </span>
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Footer */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-2 rounded-full   px-3 py-1 text-sm font-bold text-slate-500">
                          <MessageSquare className="h-5 w-5" />
                          {prettyCount(post?.commentCount || 0)}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border bg-rose-50 border-rose-300 px-3 py-1 text-sm font-bold text-rose-500">
                          <Heart className="h-5 w-5" />
                          {prettyCount(post?.likes?.length || 0)}
                        </span>

                        {/* ✅ Closed badge next to likes (only when closed) */}
                        {post?.isClosed && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                            <Lock className="h-5 w-5" />
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Paginate page={page} pages={pages} setPage={setPage} />
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal (NO title) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ReactQuill
              theme="snow"
              value={newTopic.description}
              onChange={(value) => setNewTopic({ ...newTopic, description: value })}
              placeholder="Write your post..."
              modules={{
                toolbar: [
                  ["bold", "italic", "underline", "strike"],
                  [{ script: "sub" }, { script: "super" }],
                  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                  [{ color: [] }, { background: ["#FFFF00"] }],
                  ["code-block"],
                ],
              }}
              className="h-40"
            />

            <div className="mt-20 sm:mt-14 flex gap-3">
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
                      .filter((course: string) =>
                        course.toLowerCase().includes(searchCourse.toLowerCase())
                      )
                      .map((course: string) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button className="w-full" onClick={handleCreateTopic}>
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
