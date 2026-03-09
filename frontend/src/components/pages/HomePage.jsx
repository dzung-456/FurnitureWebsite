import React from "react";
import Header from "../commons/Header";
import Footer from "../commons/Footer";
import HomeBanner from "../banners/homeBanner";
import HomeService from "../banners/homeService";
import TopSale from "../products/topSale";
import TrendyCollection from "../products/trendyCollection";
import HotDeal from "../banners/hotDeal";
import Testimonials from "../comment_feedback/testimonials";
import BestSellers from "../products/bestSellers";
import RecentBlog from "../blog/recentBlog";
import Offcanvas from "../commons/OffCanvas";

export function HomePage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <HomeBanner />
      <HomeService />
      <TopSale />

      <HotDeal />
      <Testimonials />
      {/* <BestSellers /> */}
      <RecentBlog />
      <Footer />
    </React.Fragment>
  );
}
export default HomePage;
