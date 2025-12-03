import { useState } from "react";
import TokenIssuance from "./pages/TokenIssuance";
import NavUpdate from "./pages/NavUpdate";
import svgPaths from "./imports/svg-fodi3oah1h";

type Page = "nav" | "token";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("nav");

  return (
    <div className="bg-gray-100 relative size-full">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-10 flex h-[64px] items-center justify-between bg-[#008236] px-[32px] border-b border-[#005b25] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-[12px]">
          <div className="flex size-[32px] items-center justify-center rounded-[4px] bg-white">
            <span className="text-[#00a63e] font-semibold">신</span>
          </div>
          <p className="text-white text-[18px] font-semibold">신한자산운용 펀드 관리 시스템</p>
        </div>
        <div className="flex items-center gap-[16px]">
          <div className="flex h-[40px] items-center gap-[8px] rounded-[10px] bg-[#008236] px-[16px]">
            <span className="text-[#b9f8cf] text-[14px]">펀드매니저:</span>
            <span className="text-white text-[14px] font-medium">최운용</span>
          </div>
          <button
            type="button"
            className="h-[40px] rounded-[10px] bg-white px-[20px] text-[14px] font-medium text-[#00a63e] transition-colors hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-[64px] h-[calc(100vh-64px)] w-[256px] bg-[#1e2939] border-r border-[#364153] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <nav className="mt-[16px] flex flex-col gap-[8px] px-[16px]">
          {/* NAV 관리 */}
          <button
            onClick={() => setCurrentPage("nav")}
            className={`relative flex h-[48px] w-full items-center gap-[12px] rounded-[10px] px-[16px] transition-colors ${
              currentPage === "nav" ? "bg-[#313654]" : "hover:bg-[#2a3444]"
            }`}
          >
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <g>
                <path
                  d={svgPaths.p3ac0b600}
                  stroke={currentPage === "nav" ? "white" : "#D1D5DC"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.66667"
                />
                <path
                  d={svgPaths.p3c797180}
                  stroke={currentPage === "nav" ? "white" : "#D1D5DC"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.66667"
                />
              </g>
            </svg>
            <span className={currentPage === "nav" ? "text-white" : "text-[#d1d5dc]"}>NAV 관리</span>
          </button>

          {/* 토큰 발행 관리 */}
          <button
            onClick={() => setCurrentPage("token")}
            className={`relative flex h-[48px] w-full items-center gap-[12px] rounded-[10px] px-[16px] transition-colors ${
              currentPage === "token" ? "bg-[#313654]" : "hover:bg-[#2a3444]"
            }`}
          >
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <g>
                <path
                  d={svgPaths.p1e57e600}
                  stroke={currentPage === "token" ? "white" : "#D1D5DC"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.66667"
                />
                <path
                  d={svgPaths.p2a7ce900}
                  stroke={currentPage === "token" ? "white" : "#D1D5DC"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.66667"
                />
              </g>
            </svg>
            <span className={currentPage === "token" ? "text-white" : "text-[#d1d5dc]"}>토큰 발행 관리</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[256px] mt-[64px] min-h-[calc(100vh-64px)] bg-gray-100">
        {currentPage === "nav" && <NavUpdate />}
        {currentPage === "token" && <TokenIssuance />}
      </main>
    </div>
  );
}


