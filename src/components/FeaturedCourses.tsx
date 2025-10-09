import { Button } from "@/components/ui/button";
import { useGetMainCategoriesWithCountsQuery } from "@/redux/queries/productApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "./Loader";

export default function FeaturedCourses() {
  const { userInfo } = useSelector((state: any) => state.auth);
  const { data, isLoading: loadingCourses } = useGetMainCategoriesWithCountsQuery();

  const categories = data?.categories || [];
  const navigate = useNavigate();

  const handleGoToCourse = (id) => {
    if (!userInfo) {
      navigate("/login");
      toast.info("You need to login first", { position: "top-center" });
      return;
    }
    navigate(`/course/${id}`);
  };
  return (
    <section className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
      {loadingCourses ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Courses</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((course, index) => (
              <button onClick={() => handleGoToCourse(course._id)}>
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group  transition-transform aspect-square"
                  style={{
                    backgroundImage: `url(${course.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-white text-2xl font-bold mb-2 uppercase">{course.name}</h3>
                    <div className="flex gap-4 items-center justify-between text-white text-sm">
                      {/*  <div className="flex items-center  gap-1">
                        <FileText className="h-4 w-4" /> {course.count || 0} Resource
                      </div> */}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className=" flex justify-center mt-5">
            <Button
              onClick={() => navigate("/course/all-courses")}
              variant="outline"
              className="rounded-full bg-tomato text-white">
              View All Courses
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
