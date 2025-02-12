'use client'; // Needed to use hooks like usePathname

import "./globals.css";
import MainFooter from "./components/footer/Footer";
import MainMenu from "./components/menu/Menu";
import Sidebar from "./components/menu/Sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Determine if we are on a route that should use the minimal layout,
  // In this example, any route starting with '/minimal' will have no menu, sidebar, or footer.
  // const isMinimalLayout = pathname.startsWith('/minimal');
  const isMinimalLayout = pathname?.startsWith('/minimal') ?? false;

  return (
    <html lang="en" className="h-full">
      <body className="bg-gray-900 text-white flex flex-col h-full min-h-screen">
        {!isMinimalLayout && <MainMenu />}
        <div className="flex flex-1 w-full h-full">
          {!isMinimalLayout && <Sidebar className="h-full" />}
          <main className="flex-1 flex flex-col p-4 w-full h-full">{children}</main>
        </div>
        {!isMinimalLayout && <MainFooter />}
      </body>
    </html>
  );
}





// import "./globals.css";
// import MainFooter from "./components/footer/Footer";
// import MainMenu from "./components/menu/Menu";
// import Sidebar from "./components/menu/Sidebar";

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" className="h-full">
//       <body className="bg-gray-900 text-white flex flex-col h-full min-h-screen">
//         <MainMenu />
//         <div className="flex flex-1 w-full h-full">
//           <Sidebar className="h-full" />
//           <main className="flex-1 flex flex-col p-4 w-full h-full">{children}</main>
//         </div>
//         <MainFooter />
//       </body>
//     </html>
//   );
// }
