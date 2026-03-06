import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
