import HomePageResponsive from "@/components/HomePageResponsive";
import { generateSEOMetadata } from "@/lib/seo";

export const metadata = generateSEOMetadata({
  pagePath: '/',
  title: "Trang chủ",
  description: "Tiến Đạt Audio - Chuyên cung cấp thiết bị âm thanh chất lượng cao, loa, ampli, phụ kiện âm thanh chính hãng với giá tốt nhất"
});

export default function Home() {
  return <HomePageResponsive />;
}
