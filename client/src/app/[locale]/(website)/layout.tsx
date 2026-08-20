import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer/footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col lg:pb-12">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
