import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMainCategoriesWithCountsQuery } from "@/redux/queries/productApi";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { pathname } = useLocation();
  console.log(pathname);
  const { data } = useGetMainCategoriesWithCountsQuery();
  const categories = data?.categories || [];
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.2,
      },
    },
    exit: { opacity: 0, y: -10 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <header className="border-b  border-border/40 backdrop-blur">
      <div className="lg:container lg:mx-auto  px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <img src="/n.png" className="logo" alt="" />
            </div>
            <Link to="/" className="text-xl font-semibold">
              AUKNOTES
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 relative">
            <div className="relative">
              <Link
                to="/course/all-courses"
                aria-expanded={coursesOpen}
                aria-controls="courses-dropdown"
                className={`flex items-center text-sm  text-foreground/80 hover:text-foreground transition-colors ${
                  pathname.startsWith("/course") ? "text-tomato font-bold" : "font-medium"
                }`}>
                Courses
              </Link>
            </div>

            <Link
              to="/forum"
              className={`text-sm  text-foreground/80 hover:text-foreground transition-colors ${
                pathname.startsWith("/forum") ? "text-tomato font-bold" : "font-medium"
              }`}>
              Forum
            </Link>
            <Link
              to="/about"
              className={`text-sm  text-foreground/80 hover:text-foreground transition-colors ${
                pathname.startsWith("/about") ? "text-tomato font-bold" : "font-medium"
              }`}>
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm  text-foreground/80 hover:text-foreground transition-colors ${
                pathname.startsWith("/contact") ? "text-tomato font-bold" : "font-medium"
              }`}>
              Contact
            </Link>
            <Link
              to="/upcoming"
              className={`relative flex items-center gap-2 ${
                pathname.startsWith("/upcoming") ? "text-tomato font-bold" : "font-medium"
              }`}>
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-tomato opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tomato animate-pulse"></span>
              Coming Soon
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {userInfo ? (
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="rounded-full border-foreground/20 text-black flex items-center gap-2">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="size-7  rounded-full  uppercase bg-tomato text-white flex items-center justify-center font-bold">
                    {userInfo?.username?.charAt(0) +
                      userInfo?.username?.charAt(userInfo?.username?.length - 1)}
                  </span>
                )}
                <span>{userInfo?.name}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Button
                  onClick={() => navigate("/register")}
                  variant="outline"
                  className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background bg-transparent">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {userInfo && (
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="rounded-full border-foreground/20 text-black flex items-center gap-2">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full text-xs uppercase bg-tomato text-white flex items-center justify-center font-bold">
                    {userInfo?.username?.charAt(0) +
                      userInfo?.username?.charAt(userInfo?.username?.length - 1)}
                  </span>
                )}
                <span>{userInfo.name}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="bg-tomato hover:bg-tomato/90 hover:text-white text-white"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden  bg-beige border-t border-border/40 px-6 py-4">
            <nav className="flex flex-col gap-4">
              <div>
                <button
                  onClick={() => setCoursesOpen(!coursesOpen)}
                  className="flex items-center justify-between text-base font-medium text-foreground/80 hover:text-foreground w-full">
                  Courses
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${coursesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {coursesOpen && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="mt-2 flex flex-col gap-3 pl-2 overflow-hidden">
                      {categories.map((course) => (
                        <motion.div key={course._id} variants={itemVariants}>
                          <Link
                            to={`/course/${course._id}`}
                            className="flex items-center gap-3 rounded-md p-2 hover:bg-tomato hover:text-white transition-colors">
                            <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden ">
                              <img
                                src={course.image}
                                alt={course.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium ">{course.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                      <motion.div variants={itemVariants}>
                        <button
                          onClick={() => navigate("/course/all-courses")}
                          className="bg-tomato text-white  rounded-md p-2 w-full">
                          Show all
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link
                to="/contact"
                className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link
                to="/forum"
                className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                Forum
              </Link>
              {!userInfo && (
                <Link
                  to="/login"
                  className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Sign In
                </Link>
              )}
              {!userInfo && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="mt-2 rounded-full border-foreground/20 hover:bg-foreground hover:text-background bg-transparent">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
