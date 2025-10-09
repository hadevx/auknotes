import clsx from "clsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

function Layout({ children, className }: LayoutProps) {
  return (
    <div className={clsx(" ", className && className)}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default Layout;
