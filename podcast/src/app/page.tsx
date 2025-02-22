import Header from "@/components/header";
import Hero from "@/components/herosection";
import Footer from "@/components/footer";

import Link from "next/link";
export default function Home() {
  return (
    <div>
      <Header />
      <Hero/>
      <Footer />
    </div>
  );
}