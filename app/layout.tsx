// app/layout.tsx
import "./globals.css";
import MainFooter from "./components/footer/Footer";
import MainMenu from "./components/menu/Menu";
import Sidebar from "./components/menu/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-gray-900 text-white flex flex-col h-full min-h-screen">
        <MainMenu />
        <div className="flex flex-1 w-full h-full">
          <Sidebar className="h-full" />
          <main className="flex-1 flex flex-col p-4 w-full h-full">{children}</main>
        </div>
        <MainFooter />
      </body>
    </html>
  );
}
