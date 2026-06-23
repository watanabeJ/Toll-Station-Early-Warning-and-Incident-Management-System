import React, { useState, useEffect } from "react";
import { Check, Copy, ChevronDown, X } from "lucide-react";

interface AccountItem {
  id: string;
  username: string;
  contact: string;
  phone: string;
  role: string;
  station: string;
  enabled: boolean;
}

interface AccountManagementViewProps {
  onPasswordChanged: () => void;
  showAnnotations: boolean;
}

export default function AccountManagementView({
  onPasswordChanged,
  showAnnotations,
}: AccountManagementViewProps) {
  // Accounts state - persisted to local storage for persistence durability
  const [accounts, setAccounts] = useState<AccountItem[]>(() => {
    const defaultAccounts: AccountItem[] = [
      {
        id: "1",
        username: "admin",
        contact: "王珊",
        phone: "13602239887",
        role: "超级管理员",
        station: "永川西收费站",
        enabled: true,
      },
      {
        id: "2",
        username: "li_min",
        contact: "李敏",
        phone: "13888329124",
        role: "值班站长",
        station: "永川西收费站",
        enabled: true,
      },
      {
        id: "3",
        username: "zhang_wei",
        contact: "张伟",
        phone: "13911223344",
        role: "前台收费员",
        station: "永川南收费站",
        enabled: true,
      },
      {
        id: "4",
        username: "liu_yang",
        contact: "刘洋",
        phone: "15033445566",
        role: "值班站长",
        station: "永川东收费站",
        enabled: true,
      },
      {
        id: "5",
        username: "chen_jie",
        contact: "陈洁",
        phone: "18655667788",
        role: "前台收费员",
        station: "荣昌东收费站",
        enabled: true,
      },
      {
        id: "6",
        username: "zhao_lei",
        contact: "赵磊",
        phone: "13799881122",
        role: "值班站长",
        station: "永川南收费站",
        enabled: false,
      },
      {
        id: "7",
        username: "huang_ting",
        contact: "黄婷",
        phone: "18933221100",
        role: "前台收费员",
        station: "荣昌东收费站",
        enabled: true,
      },
      {
        id: "8",
        username: "wu_chao",
        contact: "吴超",
        phone: "13511229988",
        role: "前台收费员",
        station: "永川西收费站",
        enabled: true,
      },
      {
        id: "9",
        username: "xu_jing",
        contact: "徐静",
        phone: "15988776655",
        role: "值班站长",
        station: "永川东收费站、永川西收费站",
        enabled: true,
      },
      {
        id: "10",
        username: "sun_tao",
        contact: "孙涛",
        phone: "18566778899",
        role: "前台收费员",
        station: "永川南收费站",
        enabled: true,
      },
      {
        id: "11",
        username: "zhu_hong",
        contact: "朱红",
        phone: "13699887766",
        role: "前台收费员",
        station: "荣昌东收费站",
        enabled: true,
      },
      {
        id: "12",
        username: "zhou_jie",
        contact: "周杰",
        phone: "13422334455",
        role: "前台收费员",
        station: "永川西收费站",
        enabled: true,
      }
    ];

    const saved = localStorage.getItem("sub_accounts_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If persistent cache only has the single default admin, expand to include other default mock accounts for a realistic demo layout
          if (parsed.length === 1 && parsed[0].username === "admin") {
            return defaultAccounts;
          }
          return parsed;
        }
      } catch (err) {
        // ignore
      }
    }
    return defaultAccounts;
  });

  // Persist accounts
  useEffect(() => {
    localStorage.setItem("sub_accounts_db", JSON.stringify(accounts));
  }, [accounts]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const totalItems = accounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = accounts.slice(startIndex, startIndex + itemsPerPage);

  // Auto-adjust current page when total items change (like after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Main UI Mode toggles: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState<"list" | "add" | "edit">("list");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Form states for account creation/editing
  const [formUsername, setFormUsername] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("超级管理员");
  
  // Multi-select state for stations
  const [formStations, setFormStations] = useState<string[]>(["永川西收费站", "永川南收费站"]);
  const [formEnabled, setFormEnabled] = useState(true);

  // Dropdown states
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  // Password reset success overlay
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [formCopiedNotice, setFormCopiedNotice] = useState(false);

  // Read dynamic roles from local storage to match Permission Management Roles (保证数据闭环)
  const [availableRoles, setAvailableRoles] = useState<string[]>(() => {
    const saved = localStorage.getItem("toll_sys_roles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => r.name);
        }
      } catch (e) {}
    }
    return ["超级管理员", "值班站长", "前台收费员"];
  });

  // Keep roles fresh in local storage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("toll_sys_roles");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAvailableRoles(parsed.map((r: any) => r.name));
          }
        } catch (e) {}
      }
    };
    
    // Check on render or mode changes
    handleStorageChange();
  }, [viewMode]);

  const availableStations = [
    "永川西收费站",
    "永川南收费站",
    "永川东收费站",
    "荣昌东收费站",
  ];

  // Open inline add view
  const handleOpenAdd = () => {
    setFormUsername("");
    setFormContact("");
    setFormPhone("");
    setFormRole("超级管理员");
    setFormStations(["永川西收费站", "永川南收费站"]);
    setFormEnabled(true);
    setViewMode("add");
  };

  // Open inline edit view
  const handleOpenEdit = (account: AccountItem) => {
    setEditingAccountId(account.id);
    setFormUsername(account.username);
    setFormContact(account.contact);
    setFormPhone(account.phone);
    setFormRole(account.role || "超级管理员");
    
    // Parse stations list
    const parsedStations = account.station
      ? account.station.split(/、|,|，\s*/).map((s) => s.trim()).filter(Boolean)
      : [];
    setFormStations(parsedStations.length > 0 ? parsedStations : ["永川西收费站"]);
    setFormEnabled(account.enabled);
    setViewMode("edit");
  };

  // Trigger password reset
  const handleTriggerReset = (account: AccountItem) => {
    setResetTargetUser(account.username);
    setShowResetSuccessModal(true);
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    navigator.clipboard.writeText("Admin!1234");
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 2000);
  };

  const handleCopyFormPassword = () => {
    navigator.clipboard.writeText("Admin!1234");
    setFormCopiedNotice(true);
    setTimeout(() => {
      setFormCopiedNotice(false);
    }, 2000);
  };

  // Save add/edit
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      alert("请输入账号");
      return;
    }
    if (!formContact.trim()) {
      alert("请输入联系人");
      return;
    }
    if (!formPhone.trim()) {
      alert("请输入手机号码");
      return;
    }
    if (!formRole) {
      alert("请选择关联角色");
      return;
    }
    if (formStations.length === 0) {
      alert("请至少选择一个关联收费站");
      return;
    }

    // Join stations using "、" character to match standard Chinese UI
    const stationsStr = formStations.join("、");

    if (viewMode === "edit" && editingAccountId) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccountId
            ? {
                ...acc,
                username: formUsername,
                contact: formContact,
                phone: formPhone,
                role: formRole,
                station: stationsStr,
                enabled: formEnabled,
              }
            : acc
        )
      );
    } else {
      // Check duplicated user names
      if (accounts.some((acc) => acc.username === formUsername.trim())) {
        alert("账号已存在，请输入其他账号");
        return;
      }

      const newAcc: AccountItem = {
        id: "acc_" + Date.now(),
        username: formUsername,
        contact: formContact,
        phone: formPhone,
        role: formRole,
        station: stationsStr,
        enabled: formEnabled,
      };
      setAccounts((prev) => [...prev, newAcc]);
    }

    setViewMode("list");
  };

  // Delete account row
  const handleDeleteAccount = (id: string, username: string) => {
    if (id === "1" || username === "admin") {
      alert("内置主超级管辖账号 admin 无法删除，系统至少需要保留一位超级管理员！");
      return;
    }
    if (confirm(`确定要彻底删除账号 [${username}] 吗？本操作无法撤销。`)) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    }
  };

  // Toggle switch row
  const handleToggleStatus = (id: string) => {
    if (id === "1") {
      alert("主管理员账号状态无法更改！");
      return;
    }
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, enabled: !acc.enabled } : acc))
    );
  };

  // Select-unselect handlers for Custom Role Select
  const handleSelectRole = (role: string) => {
    setFormRole(role);
    setShowRoleDropdown(false);
  };

  // Add/remove handlers for Custom Station Multi-Select
  const handleToggleStationOption = (station: string) => {
    if (formStations.includes(station)) {
      setFormStations(formStations.filter((s) => s !== station));
    } else {
      setFormStations([...formStations, station]);
    }
  };

  return (
    <div className="flex-1 p-0 flex flex-col relative text-[13px] font-sans">
      
      {/* ----------------- LIST VIEW ----------------- */}
      {viewMode === "list" && (
        <>
          {/* Table Title and Actions bar matching layout style */}
          <div className="mb-4 flex items-center justify-between" id="account-header">
            <h2 className="text-sm font-bold text-gray-800">账号管理</h2>
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-4 rounded transition duration-200 cursor-pointer flex items-center gap-1"
              id="btn-add-account"
            >
              <span>+ 新增</span>
            </button>
          </div>

          {/* Main Content Card Container */}
          <div className="bg-white rounded border border-gray-200 flex flex-col p-6 min-h-[500px]" id="account-card">
            {/* Account List Grid */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4 border-r border-gray-200 w-20">序号</th>
                    <th className="py-3 px-4 border-r border-gray-200">账号</th>
                    <th className="py-3 px-4 border-r border-gray-200">联系人</th>
                    <th className="py-3 px-4 border-r border-gray-200">手机号码</th>
                    <th className="py-3 px-4 border-r border-gray-200">关联角色</th>
                    <th className="py-3 px-4 border-r border-gray-200">关联收费站</th>
                    <th className="py-3 px-4 border-r border-gray-200 w-32">启用/停用</th>
                    <th className="py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-200 bg-white">
                  {paginatedAccounts.map((acc, index) => (
                    <tr key={acc.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="py-3.5 px-4 border-r border-gray-200">{startIndex + index + 1}</td>
                      <td className="py-3.5 px-4 border-r border-gray-200 font-medium">{acc.username}</td>
                      <td className="py-3.5 px-4 border-r border-gray-200">{acc.contact}</td>
                      <td className="py-3.5 px-4 border-r border-gray-200 font-mono">{acc.phone}</td>
                      <td className="py-3.5 px-4 border-r border-gray-200 text-gray-600">{acc.role}</td>
                      <td className="py-3.5 px-4 border-r border-gray-200 text-gray-600 text-left pl-4 max-w-xs truncate" title={acc.station}>
                        {acc.station}
                      </td>
                      <td className="py-3.5 px-4 border-r border-gray-200">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(acc.id)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              acc.enabled ? "bg-blue-500" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                acc.enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-normal text-gray-800">
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleTriggerReset(acc)}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            重置密码
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.username)}
                            className={`font-medium ${
                              acc.id === "1"
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-blue-600 hover:text-red-500 cursor-pointer"
                            }`}
                            disabled={acc.id === "1"}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        暂无管理员账号数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination block matching screen design */}
            <div className="flex justify-between items-center pt-4 select-none mt-4 border-t border-gray-150" id="account-table-footer">
              <div className="text-[11px] text-gray-400 font-sans">
                <span>当前展示第 <strong className="text-gray-700 font-extrabold">{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> 个 / 共 <strong>{totalItems}</strong> 个管理员账号</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-sans">
                {/* Prev button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                    currentPage === 1
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
                  }`}
                >
                  &lt;
                </button>

                {/* Page number buttons */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold transition cursor-pointer ${
                        currentPage === p
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
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                    currentPage === totalPages
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ----------------- INLINE ADD / EDIT VIEW (EXACT MATCH) ----------------- */}
      {(viewMode === "add" || viewMode === "edit") && (
        <div className="bg-white rounded border border-gray-200 flex flex-col min-h-[600px] text-gray-800 relative z-20" id="account-form-panel">
          
          {/* Breadcrumb path at the top of the window */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <span className="text-gray-400">账号管理</span>
              <span className="text-gray-305 font-normal">/</span>
              <span className="text-gray-800">{viewMode === "add" ? "新增" : "编辑"}</span>
            </div>
          </div>

          <form onSubmit={handleSaveAccount} className="p-8 max-w-4xl space-y-5 flex-1 relative">
            
            {/* ROW 1: 账号 */}
            <div className="flex items-start">
              <label className="w-28 text-right pr-4 pt-1.5 text-xs text-gray-700 font-medium" htmlFor="input-username">
                <span className="text-red-500 mr-1 font-bold">*</span>账号
              </label>
              <div className="flex-1 max-w-md">
                <input
                  id="input-username"
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-white h-9"
                  required
                  placeholder="请输入登录系统账号"
                  disabled={viewMode === "edit"}
                />
              </div>
            </div>

            {/* ROW 2: 密码 (Initial generated password detail panel in screenshot) */}
            {viewMode === "add" && (
              <div className="flex items-start">
                <label className="w-28 text-right pr-4 pt-1 text-xs text-gray-700 font-medium">
                  密码
                </label>
                <div className="flex-1 max-w-md flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    初始密码为 <span className="font-semibold text-gray-700 bg-gray-150/60 py-0.5 px-1.5 rounded select-all font-mono">Admin!1234</span>
                    ，如需修改请登录账号进行操作
                  </span>
                  
                  {/* Inline Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyFormPassword}
                    className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition shrink-0"
                    title="复制初始密码"
                  >
                    {formCopiedNotice ? (
                      <span className="text-green-600 text-[10px] font-bold">已复制!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ROW 3: 联系人 */}
            <div className="flex items-start">
              <label className="w-28 text-right pr-4 pt-1.5 text-xs text-gray-700 font-medium" htmlFor="input-contact">
                <span className="text-red-500 mr-1 font-bold">*</span>联系人
              </label>
              <div className="flex-1 max-w-md">
                <input
                  id="input-contact"
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-white h-9"
                  placeholder="请填写真实姓名"
                  required
                />
              </div>
            </div>

            {/* ROW 4: 手机号码 */}
            <div className="flex items-start">
              <label className="w-28 text-right pr-4 pt-1.5 text-xs text-gray-700 font-medium" htmlFor="input-phone">
                <span className="text-red-500 mr-1 font-bold">*</span>手机号码
              </label>
              <div className="flex-1 max-w-md">
                <input
                  id="input-phone"
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-white h-9"
                  placeholder="请输入手机号码"
                  required
                />
              </div>
            </div>

            {/* ROW 5: 关联角色 (SINGLE pill choice in container with ChevronDown) */}
            <div className="flex items-start relative">
              <label className="w-28 text-right pr-4 pt-2 text-xs text-gray-700 font-medium">
                <span className="text-red-500 mr-1 font-bold">*</span>关联角色
              </label>
              <div className="flex-1 max-w-md relative">
                {/* Simulated luxury selector representing modern design */}
                <div
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1 min-h-[36px] flex items-center justify-between cursor-pointer focus-within:border-blue-500 bg-white"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {formRole ? (
                      <span className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-150 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-200">
                        {formRole}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormRole("");
                          }}
                          className="hover:bg-red-200 hover:text-red-700 text-gray-400 font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs pl-1">请选择管理角色</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Dropdown float selection list */}
                {showRoleDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 py-1 divide-y divide-gray-50">
                    {availableRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                          formRole === role ? "text-blue-600 font-semibold bg-blue-50/40" : "text-gray-700"
                        }`}
                      >
                        <span>{role}</span>
                        {formRole === role && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ROW 6: 关联收费站 (MULTI pill choices in container with ChevronDown + Yellow callout popup) */}
            <div className="flex items-start relative">
              <label className="w-28 text-right pr-4 pt-2 text-xs text-gray-700 font-medium">
                <span className="text-red-500 mr-1 font-bold">*</span>关联收费站
              </label>
              
              <div className="flex-1 max-w-md relative" id="multi-station-container">
                {/* Simulated multiselect luxury wrapper */}
                <div
                  onClick={() => setShowStationDropdown(!showStationDropdown)}
                  className="w-full border border-blue-400 focus:ring-1 focus:ring-blue-500 rounded px-2.5 py-1 min-h-[36px] flex items-center justify-between cursor-pointer bg-white"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {formStations.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-150 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-200"
                      >
                        {st}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStationOption(st);
                          }}
                          className="hover:bg-red-200 hover:text-red-700 text-gray-400 font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </span>
                      </span>
                    ))}
                    {formStations.length === 0 && (
                      <span className="text-gray-400 text-xs pl-1">请选择关联收费站</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Multiselect Float List */}
                {showStationDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 py-1 divide-y divide-gray-50">
                    {availableStations.map((st) => {
                      const isSelected = formStations.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleToggleStationOption(st)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                            isSelected ? "text-blue-600 font-semibold bg-blue-50/20" : "text-gray-700"
                          }`}
                        >
                          <span>{st}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FLOATING ANNOTATION CALLOUT BUBBLE EXACTLY LIKE IN THE SCREENSHOT */}
              {showAnnotations && (
                <div
                  className="absolute left-full ml-12 top-0 w-64 border border-yellow-400 rounded-lg overflow-hidden shadow-md bg-white z-40 animate-fadeIn"
                  style={{ animationDelay: "150ms" }}
                >
                  {/* Yellow header bar with quotation background mark exactly */}
                  <div className="bg-yellow-400 text-white px-3 py-1 text-sm flex justify-between items-center font-bold">
                    <span className="font-mono text-[10px] bg-yellow-500/55 text-white w-4 h-4 rounded-full flex items-center justify-center">
                      5
                    </span>
                  </div>
                  
                  {/* SMS Template annotation notes */}
                  <div className="p-4 text-xs leading-relaxed space-y-3.5 bg-white">
                    <p className="font-bold text-gray-900 text-xs leading-none">单个账号只关联单个角色</p>
                    
                    <div className="text-gray-600 space-y-1 text-xs leading-relaxed font-normal">
                      <p>收费站可以关联多个，关联哪个收费站就能看到哪个收费站的内容</p>
                    </div>
                    
                    {/* Signature block with heart emoji */}
                    <p className="text-right text-yellow-600 font-bold text-[10px] pt-1">
                      漂亮小狗💛
                    </p>
                  </div>

                  {/* Golden indicator connection line and dot pinning to station selector border */}
                  <div className="absolute -left-12 top-11 flex items-center select-none pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm border border-white"></div>
                    <div className="w-10 h-[1.5px] bg-yellow-400"></div>
                  </div>
                </div>
              )}
            </div>

            {/* ROW 7: 是否启用此账号 */}
            <div className="flex items-start pt-2">
              <label className="w-28 text-right pr-4 pt-1 text-xs text-gray-700 font-medium">
                是否启用该账号
              </label>
              <div className="flex-1 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === "edit" && editingAccountId === "1") {
                      alert("系统内置超级管理员无法停用！");
                      return;
                    }
                    setFormEnabled(!formEnabled);
                  }}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formEnabled ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  disabled={viewMode === "edit" && editingAccountId === "1"}
                >
                  <span
                    className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      formEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* ROW 8: BUTTON ACTIONS */}
            <div className="flex items-start pt-6">
              <div className="w-28" />
              <div className="flex-1 max-w-md flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-8 py-2 rounded shadow-sm hover:shadow transition cursor-pointer"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-medium px-8 py-2 rounded transition cursor-pointer"
                >
                  返回
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* MODAL 2: PASSWORD RESET SUCCESS OVERLAY EXACTLY REPRINTING SCREENSHOT DETAIL */}
      {showResetSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="relative flex items-center justify-center w-full max-w-4xl">
            {/* The Main Reset Password feedback modal frame */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-300 p-8 h-48 flex flex-col justify-between animate-fadeIn z-30">
              <div>
                <h3 className="text-gray-900 font-bold text-lg">重置成功!</h3>
                
                {/* Reset Password details box with light blue value matching screenshot exactly */}
                <div className="bg-gray-50 border border-gray-100 rounded-sm py-2.5 px-4 mt-4 flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>
                    您的密码已重置为:{" "}
                    <span className="text-blue-500 font-bold select-all">Admin!1234</span>
                  </span>
                  
                  {/* Copy to clipboard utility icon */}
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-gray-400 hover:text-blue-500 focus:outline-none cursor-pointer p-0.5"
                    title="点击复制密码"
                  >
                    {copiedNotification ? (
                      <span className="text-green-600 text-[10px] font-bold">✔ 已复制</span>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400 font-bold shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        {/* Copy indicator SVG */}
                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h6m-3-3v6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm submit blue button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowResetSuccessModal(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded text-xs px-8 py-2 font-medium cursor-pointer transition shadow-xs"
                >
                  确定
                </button>
              </div>
            </div>

            {/* FLOATING ANNOTATION CARD (短信下发 - 漂亮小狗💛) */}
            {showAnnotations && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-y-1/2 translate-x-24 w-60 border border-yellow-400 rounded overflow-hidden shadow-lg bg-white z-40 ease-out duration-300 animate-fadeIn"
                data-purpose="floating-annotation"
              >
                {/* Yellow header bar with quotation background mark exactly */}
                <div className="bg-yellow-400 text-white px-3 py-2 text-sm flex justify-between items-center font-bold">
                  {/* quotation sign matching exactly */}
                  <span className="font-serif italic leading-none text-white text-md">“</span>
                </div>
                
                {/* SMS Template annotation notes */}
                <div className="p-3 text-xs leading-relaxed space-y-4">
                  <p className="font-bold text-gray-800 text-xs">短信下发</p>
                  
                  <div className="text-gray-500 space-y-1 text-[11px] leading-relaxed">
                    <p className="font-medium">短信模板：</p>
                    <p className="font-normal text-gray-650">您的密码已重置为：Admin!1234</p>
                    <p className="font-normal text-gray-650">为保障您的账号安全，请及时登录系统进行密码修改。</p>
                  </div>
                  
                  {/* Signature block with heart emoji */}
                  <p className="text-right text-yellow-600 font-bold text-[10px]">
                    漂亮小狗💛
                  </p>
                </div>

                {/* Golden indicator connection line and dot */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                  <div className="w-4 h-[1px] bg-yellow-400"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
