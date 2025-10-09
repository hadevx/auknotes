import HeroSection from "../../components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Layout from "@/Layout";
import Features from "@/components/Features";
import ProfessorsList from "@/components/ProfessorsList";
import { MarqueeDemo } from "@/components/MarqueeDemo";
import Four from "@/components/Contributors";

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
