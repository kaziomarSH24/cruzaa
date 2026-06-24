import { ReactNode } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <TopBar />
      <Header />
      <main className="flex-1 pt-[70px] sm:pt-[106px]">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
