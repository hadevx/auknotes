import Layout from "@/Layout";
import { useParams } from "react-router-dom";
import { useGetCourseByIdQuery, useGetProductsByCourseQuery } from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

const Course = () => {
  const { courseId } = useParams(); // category ID
  const {
    data: products,
    isLoading: loadingProducts,
    error,
  } = useGetProductsByCourseQuery({ courseId });
  const { data: category } = useGetCourseByIdQuery(courseId);
  console.log(error);

  const [activeTab, setActiveTab] = useState<string>("All");

  console.log(products);
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
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center text-red-500 py-20 text-lg">
              {error?.data?.message ||
                (error?.status === 403
                  ? "This course is not yet available."
                  : "Something went wrong. Please try again.")}
            </motion.p>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts?.length > 0 ? (
                filteredProducts.map((p) => (
                  <a
                    key={p._id}
                    href={p.file?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white border border-gray-200 rounded-md p-3 flex items-center gap-3 transition-transform duration-300 hover:border-tomato hover:shadow">
                    <div className="flex items-center justify-center size-20 bg-gray-100 rounded-md shrink-0">
                      <img
                        src={p.file?.url?.toLowerCase().endsWith(".pdf") ? "/pdf.png" : "/word.png"}
                        alt={p.file?.url?.toLowerCase().endsWith(".pdf") ? "PDF file" : "Word file"}
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
                  </a>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-20 text-lg">
                  No {activeTab === "All" ? "resources" : activeTab.toLowerCase()}s found for this
                  course.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Course;

/* 
 <Layout>
      <div className="min-h-screen py-12 px-3 lg:px-6 max-w-7xl mx-auto">
      
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          <span className="text-tomato uppercase">{category?.name}</span>
        </h1>

      
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
                <a
                  key={p._id}
                  href={p.file?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-gray-200 rounded-md p-3 flex items-center gap-3 transition-transform duration-300 hover:shadow">
              
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md shrink-0">
                    <img src="/pdf.png" alt="PDF" className="w-10 h-10" />
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
                </a>
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

*/
