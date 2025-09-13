import HomePageResponsive from "@/components/HomePageResponsive";
import { generateSEOMetadata } from "@/lib/seo";

export const metadata = generateSEOMetadata({
  pagePath: '/'
});

export default function Home() {
  return <HomePageResponsive />;
}
