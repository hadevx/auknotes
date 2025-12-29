import Layout from "@/Layout";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseByIdQuery,
  useGetProductsByCourseQuery,
  useLazyDownloadResourceQuery,
  useLikeCourseMutation,
} from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import { Download, Lock, Heart, MoveLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUserProfileQuery } from "../../redux/queries/userApi";

const fileIcon = (url?: string) => {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".pdf")) return "/pdf.png";
  if (u.endsWith(".ppt") || u.endsWith(".pptx")) return "/powerpoint.png";
  return "/word.png";
};

const typePill: Record<string, string> = {
  Note: "bg-blue-50 text-blue-700 ring-blue-100",
  Exam: "bg-rose-50 text-rose-700 ring-rose-100",
  Assignment: "bg-amber-50 text-amber-800 ring-amber-100",
};

const formatSize = (size?: number) => {
  if (!size) return "";
  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(2)} KB`
    : `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const Course = () => {
  const { data: userInfo } = useGetUserProfileQuery();
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const [triggerDownload] = useLazyDownloadResourceQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [likeCourse] = useLikeCourseMutation();

  const { courseId } = useParams();
  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({ courseId });
  const { data: category } = useGetCourseByIdQuery(courseId);

  useEffect(() => {
    setLikesCount(category?.likes?.length || 0);
    setIsLiked(Boolean(category?.likes?.includes(userInfo?._id)));
  }, [category, userInfo]);

  const [activeTab, setActiveTab] = useState<string>("All");
  const [query, setQuery] = useState("");

  const types = ["All", "Note", "Exam", "Assignment"];

  const hasAccess = category?.isPaid
    ? userInfo?.purchasedCourses?.some((c: any) => c.toString() === category?._id?.toString())
    : true;

  const locked = category?.isClosed || !hasAccess;

  const filteredProducts = useMemo(() => {
    const list = products || [];
    const byType = activeTab === "All" ? list : list.filter((p: any) => p.type === activeTab);
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((p: any) => (p?.name || "").toLowerCase().includes(q));
  }, [products, activeTab, query]);

  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      const { blob, filename } = await triggerDownload(id).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("error:", err);
      toast.error("Download failed. This file might be restricted or unavailable.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLikeCourse = async () => {
    if (!userInfo) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;

    const newLiked = !prevLiked;
    setIsLiked(newLiked);
    setLikesCount(prevCount + (newLiked ? 1 : -1));

    try {
      await likeCourse({ courseId }).unwrap();
    } catch (err: any) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err?.data?.message || "Failed to like course");
    }
  };

  if (loadingProducts)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-biege">
        <div className="max-w-7xl mx-auto px-3 lg:px-6 py-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full">
              <MoveLeft className="mr-2 size-4" />
              Back
            </Button>

            {!hasAccess && (
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-zinc-900 text-white hover:opacity-95 active:scale-[0.99]">
                <img src="/3d-fire.png" className="size-4" alt="Get Access" />
                Unlock All Courses
              </Link>
            )}
          </div>

          {/* Header (NO SHADOW) */}
          <div className="mt-4 rounded-2xl border bg-white">
            <div className="p-5 lg:p-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">
                      {category?.code}
                    </h1>

                    {/*   {category?.isPaid && (
                      <span className="text-[11px] font-semibold rounded-full p-2 bg-zinc-900 text-white">
                        <Lock className="size-4" />
                      </span>
                    )} */}

                    {category?.isClosed && (
                      <span className="text-[11px] font-semibold rounded-full px-3 py-1 bg-zinc-100 text-zinc-700 border">
                        Closed
                      </span>
                    )}
                  </div>

                  {category?.name && (
                    <p className="mt-1 text-sm text-zinc-600 max-w-2xl">{category.name}</p>
                  )}

                  <div className="mt-4 flex items-center gap-1 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">{products?.length || 0}</span>
                    resource/s available
                  </div>
                </div>

                {/* Like */}
                <button
                  onClick={handleLikeCourse}
                  disabled={!userInfo}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold transition
                    ${
                      isLiked
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                    }
                    ${!userInfo ? "opacity-60 cursor-not-allowed" : ""}`}>
                  <motion.div
                    animate={isLiked ? { scale: [0.9, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}>
                    <Heart className={`size-5 ${isLiked ? "fill-white" : "fill-transparent"}`} />
                  </motion.div>
                  <span>{likesCount}</span>
                </button>
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-zinc-50 border rounded-full p-1">
                    {types.map((type) => (
                      <TabsTrigger
                        key={type}
                        value={type}
                        className="rounded-full px-4 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full rounded-full border bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resources (SEPARATED ITEMS, NO SHADOW) */}
          <div className="mt-6">
            {/* header row */}
            <div className="hidden sm:grid grid-cols-[1fr_140px_120px] gap-4 px-2 pb-2">
              <div className="text-xs font-semibold text-zinc-500">Resource</div>
              <div className="text-xs font-semibold text-zinc-500">Size</div>
              <div className="text-xs font-semibold text-zinc-500 text-right">Action</div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts?.length > 0 ? (
                <motion.div layout className="space-y-3">
                  {filteredProducts.map((p: any) => (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-2xl border bg-white px-4 py-4">
                      <div className="flex items-center gap-4">
                        {/* icon */}
                        <div className="size-15 rounded-xl bg-zinc-50  flex items-center justify-center shrink-0">
                          <img src={fileIcon(p.file?.url)} className="size-15 object-contain" />
                        </div>

                        {/* main */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-xl text-zinc-900 line-clamp-1">
                                {p.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`text-[11px] font-semibold rounded-full px-1  ring-1 ${
                                    typePill[p.type] || "bg-zinc-50 text-zinc-700 ring-zinc-100"
                                  }`}>
                                  {p.type}
                                </span>
                              </div>
                            </div>

                            {/* desktop size + action */}
                            <div className="hidden sm:flex items-center gap-6">
                              <span className="text-sm text-zinc-500 w-[140px]">
                                {formatSize(p.size)}
                              </span>

                              <div className="w-[120px] flex justify-end">
                                {locked ? (
                                  <span className="inline-flex items-center gap-2 text-sm bg-zinc-100 p-2 rounded-full text-black">
                                    <Lock className="size-5" />
                                  </span>
                                ) : downloadingId === p._id ? (
                                  <Spinner className="border-t-black" />
                                ) : (
                                  <button
                                    onClick={() => handleDownload(p._id, p.name)}
                                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full border bg-black text-white hover:bg-zinc-500">
                                    <Download className="size-4 " /> Download
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* mobile row */}
                          <div className="sm:hidden mt-3 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">{formatSize(p.size)}</span>
                            {locked ? (
                              <span className="inline-flex bg-zinc-100 rounded-full p-2 items-center gap-2 text-sm text-black">
                                <Lock className="size-5" />
                              </span>
                            ) : downloadingId === p._id ? (
                              <Spinner className="border-t-black" />
                            ) : (
                              <button
                                onClick={() => handleDownload(p._id, p.name)}
                                className="inline-flex text-white items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-black hover:bg-zinc-500">
                                <Download className="size-4" />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center">
                  <p className="text-zinc-700 text-lg font-semibold">
                    No {activeTab === "All" ? "resources" : activeTab.toLowerCase()}s found.
                  </p>
                  <p className="text-zinc-500 text-sm mt-2">Try changing filters or search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Course;
