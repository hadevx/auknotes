import { useState } from "react";
import Layout from "@/Layout";
import { useGetCoursesQuery } from "@/redux/queries/productApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import Paginate from "@/components/Paginate";
import { Search, FileText, Lock } from "lucide-react";

const AllCourses = () => {
  const [page, setPage] = useState(1);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const { data, isLoading: loadingCourses } = useGetCoursesQuery({
    pageNumber: page,
    keyword,
  });

  const categories = data?.courses || [];
  const pages = data?.pages;

  console.log("courses", categories);
  const handleGoToCourse = (id) => {
    if (!userInfo) {
      navigate("/login");
      toast.info("You need to login first", { position: "top-center" });
      return;
    }
    navigate(`/course/${id}`);
  };
  return (
    <Layout>
      {loadingCourses ? (
        <Loader />
      ) : (
        <div className="min-h-screen px-3 py-20 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 space-y-6">
            <h1 className="text-5xl font-bold text-black tracking-tight">Explore Courses</h1>
            <p className="text-gray-600 text-center max-w-2xl">
              Discover all available courses below. Each course offers valuable resources and notes
              shared by students.
            </p>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-tomato focus:border-tomato outline-none text-gray-800"
              />
            </div>
          </div>

          <div className="grid gap-3  sm:gap-5 grid-cols-2 z-0 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const isClosed = cat.isClosed;

              return (
                <button
                  key={cat._id}
                  onClick={() => !isClosed && handleGoToCourse(cat._id)}
                  disabled={isClosed}
                  className={`relative rounded-xl overflow-hidden shadow-custom aspect-square group ${
                    isClosed ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                  }`}>
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${cat.image || "/placeholder.png"})`,
                    }}></div>

                  {/* Dark overlay */}
                  {isClosed ? (
                    <div className="absolute inset-0 bg-black/50"></div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40"></div>
                  )}

                  {/* Coming Soon Badge */}
                  {isClosed && (
                    <div className="absolute top-3 left-3 bg-tomato text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                      Coming Soon
                    </div>
                  )}

                  {/* Center Lock Icon */}
                  {isClosed && (
                    <div className="absolute  inset-0 flex items-center justify-center">
                      <div className="bg-black/70 p-3 rounded-full flex justify-around items-center">
                        <Lock className="text-white size-8 " />
                      </div>
                    </div>
                  )}

                  {/* Course info (bottom) */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <p className="text-lg text-start font-semibold text-white truncate uppercase">
                      {cat.code}
                    </p>

                    <div className="flex items-center gap-1 text-white">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {cat.resources?.length || 0} resources
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {!loadingCourses && categories.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No courses found.</p>
          )}
          <div className="pt-10">
            <Paginate page={page} pages={pages} setPage={setPage} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AllCourses;
