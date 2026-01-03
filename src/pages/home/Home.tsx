import HeroSection from "../../components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Layout from "@/Layout";
import Features from "@/components/Features";
import Four from "@/components/Contributors";
import X from "@/components/X";
// import Z from "@/components/Z";
import Q from "@/components/Q";
import R from "@/components/R";
const Home = () => {
  return (
    <Layout>
      <HeroSection />
      <Features />
      <R />
      <X />
      <Q />
      {/* <Z /> */}
      <FeaturedCourses />
      <Four />
    </Layout>
  );
};

export default Home;
