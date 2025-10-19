import Layout from "@/Layout";
import { useParams } from "react-router-dom";
import {
  useGetCourseByIdQuery,
  useGetProductsByCourseQuery,
  useLazyDownloadResourceQuery,
} from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import { Download, Lock } from "lucide-react";

const Course = () => {
  const [triggerDownload] = useLazyDownloadResourceQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null); // track downloading file

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
      console.error(err);
      toast.error("Download failed. This file might be restricted or unavailable.");
    } finally {
      setDownloadingId(null); // stop spinner
    }
  };

  const { courseId } = useParams(); // Get course ID from route params

  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({ courseId });

  const { data: category } = useGetCourseByIdQuery(courseId);

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

  return (
    <Layout>
      <div className="min-h-screen py-12 px-3 lg:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          <span className="text-tomato uppercase">{category?.code}</span>
        </h1>

        {/* Tabs for filtering by resource type */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
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

                  {/* Show spinner only for the file being downloaded */}
                  {category?.isClosed ? (
                    <div className="bg-black/10 p-3 rounded-full">
                      <Lock className="ml-auto" />
                    </div>
                  ) : downloadingId === p._id ? (
                    <Spinner className="border-t-black ml-auto" />
                  ) : (
                    <button
                      onClick={() => handleDownload(p._id, p.name)}
                      className="text-sm text-tomato font-medium hover:underline ml-auto">
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
