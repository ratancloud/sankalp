import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
