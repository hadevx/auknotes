import Layout from "@/Layout";
import { useParams } from "react-router-dom";
import {
  useGetCourseByIdQuery,
  useGetProductsByCourseQuery,
  useLazyDownloadResourceQuery,
  useLikeCourseMutation,
} from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import { Download, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
// import LoaderFile from "@/components/LoaderFile";
import { useGetUserProfileQuery } from "../../redux/queries/userApi";

const Course = () => {
  const { data: userInfo } = useGetUserProfileQuery();
  console.log(userInfo);

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [triggerDownload] = useLazyDownloadResourceQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null); // track downloading file
  const [likeCourse] = useLikeCourseMutation();

  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id); // start spinner for this file
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
      setDownloadingId(null); // stop spinner
    }
  };

  const { courseId } = useParams(); // Get course ID from route params

  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({ courseId });
  console.log(products);
  const { data: category } = useGetCourseByIdQuery(courseId);

  useEffect(() => {
    setLikesCount(category?.likes?.length || 0);
    setIsLiked(category?.likes?.includes(userInfo?._id));
  }, [category, userInfo]);

  console.log(category);
  const [activeTab, setActiveTab] = useState<string>("All");

  if (loadingProducts)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  const types = ["All", "Note", "Exam", "Assignment"];

  const filteredProducts =
    activeTab === "All" ? products : products?.filter((p) => p.type === activeTab);

  // Check if user has purchased course
  const hasAccess = category?.isPaid
    ? userInfo?.purchasedCourses?.some((c: any) => c.toString() === category._id.toString())
    : true;

  // ✅ Like Topic (Optimistic UI)
  const handleLikeCourse = async () => {
    if (!userInfo) return;

    // store previous state
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // optimistic update
    const newLiked = !prevLiked;
    setIsLiked(newLiked);
    setLikesCount(prevCount + (newLiked ? 1 : -1));

    try {
      await likeCourse({ courseId: courseId }).unwrap();
      // no need to update state from server unless you want to ensure consistency
    } catch (err: any) {
      // revert
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err?.data?.message || "Failed to like course");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-3 lg:px-6 max-w-7xl mx-auto">
        <div className="mb-5 flex items-start sm:items-start  gap-1 flex-col">
          <div className="flex items-center  gap-5">
            <div className="text-tomato font-poppins flex ">
              <span className="uppercase text-4xl font-bold">{category?.code}</span>{" "}
            </div>
            {!hasAccess && (
              <Button
                onClick={() => window.open("https://wa.link/f9f5se", "_blank")}
                className="flex rounded-full items-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-700 shadow-[0_7px_15px_rgba(0,0,0,0.3)] hover:scale-[0.995]">
                <img src="/3d-fire.png" className="size-4" alt="Get Access" /> Unlock
              </Button>
            )}
          </div>
          <span className="capitalize text-gray-800 text-sm font-poppins">
            {category?.name && category.name}
          </span>
        </div>
        <div className="mb-5 flex items-center gap-5 ">
          {/* Tabs for filtering by resource type */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className=" flex items-center sm:items-start">
            <TabsList className="bg-white">
              {types.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="data-[state=active]:bg-tomato lg:text-lg data-[state=active]:text-white">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Like Button */}
          <button
            onClick={handleLikeCourse}
            disabled={!userInfo}
            className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-all duration-200 ${
              isLiked
                ? "bg-rose-500 shadow-[0_0_10px_rgba(255,0,0,0.3)] text-white border-rose-500"
                : "hover:bg-rose-50 text-rose-600 border-rose-300 "
            }`}>
            <motion.div
              animate={isLiked ? { scale: [0, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}>
              <Heart
                className={`size-4   transition-all ${isLiked ? "fill-white" : "fill-transparent"}`}
              />
            </motion.div>
            <span className="text-base lg:text-base">{likesCount} </span>
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts?.length > 0 ? (
              filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className="group bg-white border border-gray-200 rounded-md p-3 flex items-center gap-3 transition-transform duration-300 hover:border-tomato hover:shadow">
                  <div className="flex items-center justify-center size-20 bg-gray-100 rounded-md shrink-0">
                    <img
                      src={
                        p.file?.url?.toLowerCase().endsWith(".pdf")
                          ? "/pdf.png"
                          : p.file?.url?.toLowerCase().endsWith(".ppt") ||
                            p.file?.url?.toLowerCase().endsWith(".pptx")
                          ? "/powerpoint.png"
                          : "/word.png"
                      }
                      className="size-14 lg:size-18 object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-tomato transition-colors">
                      {p.name}
                    </h2>

                    <span className="text-xs uppercase font-medium text-gray-500 inline-block mt-1">
                      {p.type}
                    </span>

                    {p.size && (
                      <span className="text-xs text-gray-400 mt-1 block">
                        {p.size < 1024 * 1024
                          ? `${(p.size / 1024).toFixed(2)} KB`
                          : `${(p.size / 1024 / 1024).toFixed(2)} MB`}
                      </span>
                    )}
                  </div>

                  {/* Download Button */}
                  {category?.isClosed || !hasAccess ? (
                    <div className="bg-black/10 p-3 rounded-full">
                      <Lock className="ml-auto" />
                    </div>
                  ) : downloadingId === p._id ? (
                    <Spinner className="border-t-black ml-auto" />
                  ) : (
                    // <LoaderFile />
                    <button
                      onClick={() => handleDownload(p._id, p.name)}
                      className="text-sm rounded-md text-tomato font-medium hover:underline ml-auto">
                      <Download />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-20 text-lg">
                No {activeTab === "All" ? "resources" : activeTab.toLowerCase()}s found for this
                course.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Course;
