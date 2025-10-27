import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";

import {
  About,
  Contact,
  Home,
  ForumPage,
  TopicDetails,
  NotFound,
  Upcoming,
  Profile,
  AllCourses,
  Course,
  Register,
  Login,
  DonationPage,
  User,
} from "@/pages/index";

function App() {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:id" element={<TopicDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/donation" element={<DonationPage />} />
        {/* User */}
        <Route path="/login" element={!userInfo ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!userInfo ? <Register /> : <Navigate to="/" />} />
        <Route path="/profile/:id" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/user/:id" element={<User />} />
        {/* Courses */}
        {/* <Route path="/course/:courseId" element={<PrivateRoute element={<Course />} />} /> */}
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/all-courses" element={<AllCourses />} />
        {/* catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
