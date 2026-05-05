import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { Notification } from "./Notification";
import { useAuthProvider } from "../context/Auth";

export function Layout() {
  const [openSidebar, setOpenSidebar] = React.useState<boolean>(false);
  const [openNotifications, setOpenNotifications] = React.useState<boolean>(false);
  const { currentUser } = useAuthProvider();

  const isWaiting = currentUser?.status === "waiting" && currentUser?.roles?.includes("coordinator");

  return (
    <div className="relative flex flex-col min-h-screen">
      {isWaiting && (
        <div className="fixed top-[100px] left-0 right-0 z-[9] bg-yellow-400 text-yellow-900 text-center text-sm font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Aguarde a aprovação de um ADM, para se tornar coordenador
        </div>
      )}

      <Header openSidebar={() => setOpenSidebar(true)} openNotification={() => setOpenNotifications(true)} />
      <Sidebar open={openSidebar} close={() => setOpenSidebar(false)} />
      <Notification open={openNotifications} close={() => setOpenNotifications(false)} />

      <main className="flex-1 overflow-x-hidden px-4">
        <div className={`m-auto max-w-7xl w-full ${isWaiting ? "mt-[136px]" : "mt-[100px]"}`}>
          <Outlet />
        </div>
      </main>

      <Footer className="mt-auto" />

      <LoadingScreen />
    </div>
  );
}
