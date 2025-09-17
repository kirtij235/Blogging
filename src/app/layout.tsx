import "./globals.css";
import NavbarClient from "./components/Navigation";

export const metadata = {
  title: "MyBlog",
  description: "A simple blogging app with Supabase + Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {/* ✅ Navbar visible on ALL pages */}
        <NavbarClient />
        
        {/* Page content */}
        <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
