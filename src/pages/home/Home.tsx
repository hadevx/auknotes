import HeroSection from "../../components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Layout from "@/Layout";
import Features from "@/components/Features";
import Four from "@/components/Contributors";
import X from "@/components/X";

const Home = () => {
  return (
    <Layout>
      <HeroSection />
      <Features />
      <X />

      <FeaturedCourses />
      <Four />
    </Layout>
  );
};

export default Home;
