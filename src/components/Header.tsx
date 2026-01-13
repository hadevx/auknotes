import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../redux/slices/authSlice.js";
import { useLogoutApiMutation } from "../redux/queries/userApi.js";
import { useGetStoreStatusQuery } from "@/redux/queries/maintenanceApi";

export default function Header() {
  const { data: storeStatus, isLoading } = useGetStoreStatusQuery();
  const bannerText = storeStatus?.[0]?.banner;

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutApiMutation();

  const handleLogout = async () => {
    await dispatch(logout());
    await logoutApi();
    navigate("/");
  };

  return (
    <>
      {/* ===== Top Banner ===== */}
      {!isLoading && bannerText && (
        <div className="w-full bg-neutral-900 text-white text-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center text-center">
            <p className="font-medium">{bannerText}</p>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <header className="border-b border-border/40  sticky top-0 z-50">
        <div className="lg:container lg:mx-auto px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/avatar/logo.webp" className="rounded-md size-8" alt="logo" />
              <h1 className="text-xl font-semibold">AUKNOTES</h1>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { path: "/courses", label: "Courses" },
                { path: "/forum", label: "Forum" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors ${
                    pathname.startsWith(item.path)
                      ? "text-tomato font-bold"
                      : "text-foreground/80 font-medium"
                  }`}>
                  {item.label}
                </Link>
              ))}

              {/* Find Tutor */}
              <Link
                to="/tutors"
                className={`relative flex items-center gap-2 text-sm ${
                  pathname.startsWith("/tutors")
                    ? "text-tomato font-bold"
                    : "text-foreground/80 font-medium"
                }`}>
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-tomato opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-tomato animate-pulse" />
                Find Tutor
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              {userInfo ? (
                <Button
                  onClick={() => navigate(`/profile/${userInfo._id}`)}
                  variant="outline"
                  className="rounded-full border-foreground/20 text-black flex items-center gap-2">
                  {userInfo.avatar ? (
                    <img
                      src={`/avatar/${userInfo.avatar}`}
                      alt={userInfo.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="size-7 rounded-full uppercase bg-tomato text-white flex items-center justify-center font-bold">
                      {userInfo.username?.charAt(0)}
                    </span>
                  )}
                  <span>{userInfo.name}</span>
                </Button>
              ) : (
                <div className="flex items-center gap-5">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground">
                    Sign In
                  </Link>
                  <Button
                    onClick={() => navigate("/register")}
                    variant="outline"
                    className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-tomato text-white hover:bg-tomato/90"
                onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-beige border-t border-border/40 px-6 py-4">
              <nav className="flex flex-col gap-4">
                {["courses", "forum", "about", "contact", "tutors"].map((route) => (
                  <Link
                    key={route}
                    to={`/${route}`}
                    className={`text-sm ${
                      pathname.startsWith(`/${route}`)
                        ? "text-tomato font-bold"
                        : "text-foreground/80 font-medium"
                    }`}>
                    {route.charAt(0).toUpperCase() + route.slice(1)}
                  </Link>
                ))}

                {userInfo && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="mt-2 bg-black text-white">
                    Logout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
