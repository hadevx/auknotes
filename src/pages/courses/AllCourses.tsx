import { useState } from "react";
import Layout from "@/Layout";
import { useGetMainCategoriesWithCountsPaginamtionQuery } from "@/redux/queries/productApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import Paginate from "@/components/Paginate";
import { Search } from "lucide-react";

const AllCourses = () => {
  const [page, setPage] = useState(1);
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const {
    data,
    error,
    isLoading: loadingCourses,
  } = useGetMainCategoriesWithCountsPaginamtionQuery({
    pageNumber: page,
    keyword,
  });

  const categories = data?.categories || [];
  const pages = data?.pages;

  console.log(categories);
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
        <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-12 space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Explore Courses</h1>
            <p className="text-gray-600 text-center max-w-2xl">
              Discover all available courses below. Each course offers valuable resources and notes
              shared by students.
            </p>

            {/* Search */}
            <div className="relative w-full sm:w-96">
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

          <div className="grid gap-6 grid-cols-2 z-0 sm:grid-cols-2 lg:grid-cols-4 ">
            {categories.map((cat) => (
              <button
                onClick={() => handleGoToCourse(cat._id)}
                key={cat._id}
                className="relative rounded-xl overflow-hidden shadow-custom cursor-pointer group aspect-square">
                <div
                  className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${cat.image || "https://via.placeholder.com/400"})`,
                  }}></div>

                {/* Overlay */}
                <div className="absolute inset-0 flex items-end bg-black/30 p-4">
                  <p className="text-lg font-semibold text-white truncate uppercase">{cat.name}</p>
                </div>
              </button>
            ))}
          </div>

          {!loadingCourses && categories.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No courses found.</p>
          )}
          <Paginate page={page} pages={pages} setPage={setPage} />
        </div>
      )}
    </Layout>
  );
};

export default AllCourses;
