import HeroSection from "../../components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Layout from "@/Layout";
import Features from "@/components/Features";
import Four from "@/components/Contributors";
// import ShareToast from "@/components/ShareToast";
const Home = () => {
  return (
    <Layout>
      <HeroSection />
      <Features />
      <FeaturedCourses />
      <Four />
    </Layout>
  );
};

export default Home;
