import React, { useState } from "react";
import { OperationLog } from "../types";

interface OperationLogViewProps {
  logs: OperationLog[];
}

export default function OperationLogView({ logs }: OperationLogViewProps) {
  const [operator, setOperator] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [timeSearch, setTimeSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(2); // Default to page 2 as requested in layout and screenshot

  // Fetch account list from localStorage to map username -> contact (real name)
  const savedAccounts = typeof window !== "undefined" ? localStorage.getItem("sub_accounts_db") : null;
  let accountsList: any[] = [];
  if (savedAccounts) {
    try {
      accountsList = JSON.parse(savedAccounts);
    } catch (e) {}
  }
  
  // Create a helper to map operator username to contact name
  const getOperatorContactName = (operatorName: string): string => {
    // If the operator matches a contact exactly (or matches an existing user's contact), keep it
    const matchedByUsername = accountsList.find(
      (acc) => acc.username?.toLowerCase() === operatorName?.toLowerCase()
    );
    if (matchedByUsername && matchedByUsername.contact) {
      return matchedByUsername.contact;
    }
    
    // Fallback default: if username is 'admin', default to '王珊' (initial demo account)
    if (operatorName?.toLowerCase() === "admin") {
      return "王珊";
    }
    return operatorName;
  };

  // Convert real logs and format them for display list
  const formattedRealLogs = logs.map((log) => ({
    id: log.id,
    loginIp: log.loginIp,
    operator: getOperatorContactName(log.operator),
    module: log.module,
    action: log.action,
    time: log.time.replace(/-/g, "/"), // Match slash format as shown in screenshot
  }));

  // Create combined logs list to match the visual footprint of the prototype
  // Merge dynamic operations logs with identical placeholder trace entries to span multiple pages
  const combinedLogs = [...formattedRealLogs];
  const totalDefaultItems = 50; 
  const remainingCount = Math.max(0, totalDefaultItems - formattedRealLogs.length);

  for (let i = 0; i < remainingCount; i++) {
    combinedLogs.push({
      id: `mock_log_${i}`,
      loginIp: "112.351.78.85",
      operator: getOperatorContactName("admin"),
      module: i % 2 === 0 ? "权限管理" : "安全会话",
      action: "新增",
      time: "2024/02/26 17:23:21",
    });
  }

  // Handle Filtration
  const filteredLogs = combinedLogs.filter((log) => {
    if (operator && !log.operator.toLowerCase().includes(operator.toLowerCase())) return false;
    if (selectedModule && log.module !== selectedModule) return false;
    if (timeSearch && !log.time.includes(timeSearch)) return false;
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  // Paginated Slice
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleReset = () => {
    setOperator("");
    setSelectedModule("");
    setTimeSearch("");
    setCurrentPage(2); // Reset to page 2 to restore screenshot default
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  // Generate pagination page items list
  const pageNumbers = [];
  const maxPagesToDisplay = Math.max(totalPages, 5); // Ensure at least 5 slots as displayed in prototype screenshot
  for (let i = 1; i <= maxPagesToDisplay; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex-1 p-0 flex flex-col">
      {/* Breadcrumb / Section Title */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">操作日志</h2>
      </div>

      {/* BEGIN: ContentContainer */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col h-full min-h-[600px] p-6 justify-between">
        <div>
          {/* BEGIN: FilterArea */}
          <section className="mb-6 flex flex-wrap items-center gap-6" data-purpose="search-filters">
            <div className="flex items-center space-x-2">
              <label htmlFor="operator-filter-input" className="text-xs text-gray-600 font-medium whitespace-nowrap">
                操作人
              </label>
              <input
                id="operator-filter-input"
                className="w-48 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 h-8 font-sans text-gray-700"
                placeholder="请输入"
                type="text"
                value={operator}
                onChange={(e) => {
                  setOperator(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="module-filter-select" className="text-xs text-gray-600 font-medium whitespace-nowrap">
                操作模块
              </label>
              <select
                id="module-filter-select"
                className="w-48 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 h-8 text-gray-700 cursor-pointer"
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">全部</option>
                <option value="安全会话">安全会话</option>
                <option value="事件管理">事件管理</option>
                <option value="收费站管理">收费站管理</option>
                <option value="权限管理">权限管理</option>
                <option value="设备管理">设备管理</option>
                <option value="音响管理">音响管理</option>
                <option value="事件类型管理">事件类型管理</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="time-filter-input" className="text-xs text-gray-600 font-medium whitespace-nowrap">
                操作时间
              </label>
              <div className="flex items-center bg-white border border-gray-300 rounded px-3 py-1 w-64 h-8">
                <input
                  id="time-filter-input"
                  className="bg-transparent border-none focus:ring-0 text-xs p-0 w-full text-gray-700 outline-none placeholder-gray-400 focus:outline-none"
                  placeholder="开始—结束"
                  type="text"
                  value={timeSearch}
                  onChange={(e) => {
                    setTimeSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="flex space-x-2 ml-auto">
              <button
                onClick={handleSearch}
                className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
              >
                查询
              </button>
              <button
                onClick={handleReset}
                className="bg-white hover:bg-gray-50 text-[#1890ff] border border-blue-200 rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
              >
                重置
              </button>
            </div>
          </section>
          {/* END: FilterArea */}

          {/* BEGIN: DataTable */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-700 font-medium border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4 border-r border-gray-200">序号</th>
                  <th className="py-3 px-4 border-r border-gray-200">登录IP地址</th>
                  <th className="py-3 px-4 border-r border-gray-200">操作人</th>
                  <th className="py-3 px-4 border-r border-gray-200">操作模块</th>
                  <th className="py-3 px-4 border-r border-gray-200">操作项</th>
                  <th className="py-3 px-4">操作时间</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y divide-gray-100">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-450">
                      没有符合条件的审计日志痕迹记录。
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => {
                    const rowNumber = startIndex + index + 1;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{rowNumber}</td>
                        <td className="py-3 px-4">{log.loginIp}</td>
                        <td className="py-3 px-4">{log.operator}</td>
                        <td className="py-3 px-4">{log.module}</td>
                        <td className="py-3 px-4">{log.action}</td>
                        <td className="py-3 px-4">{log.time}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* END: DataTable */}
        </div>

        {/* BEGIN: Pagination */}
        <footer className="flex justify-between items-center pt-4 select-none mt-4 border-t border-gray-150" data-purpose="pagination">
          <div className="text-[11px] text-gray-400 font-sans">
            <span>当前展示第 <strong className="text-gray-700 font-extrabold">{filteredLogs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredLogs.length)}</strong> 条 / 共 <strong>{filteredLogs.length}</strong> 条操作日志</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-sans">
            {/* Prev button */}
            <button
              onClick={() => activePage > 1 && setCurrentPage(activePage - 1)}
              disabled={activePage === 1}
              className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                activePage === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              &lt;
            </button>
            
            {/* Page number buttons */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === activePage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "border-[#1890ff] text-[#1890ff] bg-white font-extrabold"
                      : "border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 bg-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => activePage < totalPages && setCurrentPage(activePage + 1)}
              disabled={activePage === totalPages}
              className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                activePage === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              &gt;
            </button>
          </div>
        </footer>
        {/* END: Pagination */}
      </div>
      {/* END: ContentContainer */}
    </div>
  );
}
