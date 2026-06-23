import React, { useState } from "react";
import { Check } from "lucide-react";
import { PermissionRole } from "../types";

export const MENU_NAME_MAP: Record<string, string> = {
  workstation: "工作台 (父级)",
  realtime: "实时监控",
  eventList: "事件列表",
  station: "收费站管理",
  permission: "权限管理",
  account: "账号管理",
  operation_log: "操作日志",
  general_config: "通用参数配置",
  device_parent: "设备管理 (父级)",
  device: "屏幕管理",
  device_speaker: "音响管理",
  camera: "摄像头管理",
  device_watch: "智能手表管理",
  event_type: "事件类型管理",
  upgrade_parent: "升级包升级 (父级)",
  upgrade_outdoor: "户外屏",
  upgrade_server: "服务端"
};

interface PermissionManagementViewProps {
  roles: PermissionRole[];
  onAddRole: (name: string, description: string, enabled: boolean, menus: string[]) => void;
  onEditRole: (id: string, name: string, description: string, enabled: boolean, menus: string[]) => void;
  onDeleteRole: (id: string) => void;
  showAnnotations: boolean;
}

export default function PermissionManagementView({
  roles,
  onAddRole,
  onEditRole,
  onDeleteRole,
  showAnnotations,
}: PermissionManagementViewProps) {
  // Mode toggles
  const [formActive, setFormActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form input states
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleEnabled, setRoleEnabled] = useState(true);
  const [selectedMenus, setSelectedMenus] = useState<string[]>(["workstation", "realtime", "eventList"]);

  // Details pop-up card
  const [detailedRole, setDetailedRole] = useState<PermissionRole | null>(null);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingRoleId(null);
    setRoleName("");
    setRoleDesc("");
    setRoleEnabled(true);
    setSelectedMenus(["workstation", "realtime", "eventList"]);
    setFormActive(true);
  };

  const handleOpenEdit = (role: PermissionRole) => {
    setIsEditMode(true);
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDesc(role.description || "");
    setRoleEnabled(role.enabled);
    setSelectedMenus(role.authorizedMenus || []);
    setFormActive(true);
  };

  const handleToggleMenu = (key: string) => {
    setSelectedMenus((prev) => {
      // 1. Workstation block
      if (key === "workstation") {
        const has = prev.includes("workstation");
        if (has) {
          return prev.filter((k) => k !== "workstation" && k !== "realtime" && k !== "eventList");
        } else {
          return Array.from(new Set([...prev, "workstation", "realtime", "eventList"]));
        }
      }
      if (key === "realtime" || key === "eventList") {
        const exists = prev.includes(key);
        let updated = exists ? prev.filter((k) => k !== key) : [...prev, key];
        const hasAnyChild = updated.includes("realtime") || updated.includes("eventList");
        if (hasAnyChild) {
          updated = Array.from(new Set([...updated, "workstation"]));
        } else {
          updated = updated.filter((k) => k !== "workstation");
        }
        return updated;
      }

      // 2. Device block
      if (key === "device_parent") {
        const has = prev.includes("device_parent");
        if (has) {
          return prev.filter((k) => k !== "device_parent" && k !== "device" && k !== "device_speaker" && k !== "camera");
        } else {
          return Array.from(new Set([...prev, "device_parent", "device", "device_speaker", "camera"]));
        }
      }
      if (key === "device" || key === "device_speaker" || key === "camera") {
        const exists = prev.includes(key);
        let updated = exists ? prev.filter((k) => k !== key) : [...prev, key];
        const hasAnyChild = updated.includes("device") || updated.includes("device_speaker") || updated.includes("camera");
        if (hasAnyChild) {
          updated = Array.from(new Set([...updated, "device_parent"]));
        } else {
          updated = updated.filter((k) => k !== "device_parent");
        }
        return updated;
      }

      // 3. Upgrade block
      if (key === "upgrade_parent") {
        const has = prev.includes("upgrade_parent");
        if (has) {
          return prev.filter((k) => k !== "upgrade_parent" && k !== "upgrade_outdoor" && k !== "upgrade_server");
        } else {
          return Array.from(new Set([...prev, "upgrade_parent", "upgrade_outdoor", "upgrade_server"]));
        }
      }
      if (key === "upgrade_outdoor" || key === "upgrade_server") {
        const exists = prev.includes(key);
        let updated = exists ? prev.filter((k) => k !== key) : [...prev, key];
        const hasAnyChild = updated.includes("upgrade_outdoor") || updated.includes("upgrade_server");
        if (hasAnyChild) {
          updated = Array.from(new Set([...updated, "upgrade_parent"]));
        } else {
          updated = updated.filter((k) => k !== "upgrade_parent");
        }
        return updated;
      }

      // 4. Flat menus
      const exists = prev.includes(key);
      if (exists) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert("请输入角色名称");
      return;
    }

    if (isEditMode && editingRoleId) {
      onEditRole(editingRoleId, roleName, roleDesc, roleEnabled, selectedMenus);
    } else {
      onAddRole(roleName, roleDesc, roleEnabled, selectedMenus);
    }

    setFormActive(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {!formActive ? (
        // List screen
        <div className="flex-1 flex flex-col">
          {/* Breadcrumb title */}
          <div className="mb-2" data-purpose="page-breadcrumb">
            <h2 className="text-xs font-bold text-gray-800">权限管理</h2>
          </div>

          {/* Content Container */}
          <div className="bg-white border border-gray-200 rounded-sm flex-1 p-6 relative flex flex-col justify-between" data-purpose="data-container">
            <div>
              {/* Action Toolbar */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleOpenAdd}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-4 rounded transition duration-200 cursor-pointer"
                  data-purpose="btn-new"
                >
                  + 新增
                </button>
              </div>

              {/* Data Table */}
              <div className="border border-gray-200 rounded overflow-hidden" data-purpose="authority-table">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs font-semibold">
                      <th className="py-3 border-r border-b border-gray-200 w-24">序号</th>
                      <th className="py-3 border-r border-b border-gray-200">角色名称</th>
                      <th className="py-3 border-r border-b border-gray-200">角色描述</th>
                      <th className="py-3 border-r border-b border-gray-200 w-32">启用/停用</th>
                      <th className="py-3 border-b border-gray-200">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700">
                    {roles.map((role, idx) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="py-3 border-r border-b border-gray-200">{idx + 1}</td>
                        <td className="py-3 border-r border-b border-gray-200 font-medium text-gray-900">{role.name}</td>
                        <td className="py-3 border-r border-b border-gray-200 text-gray-500">{role.description || "所有权限"}</td>
                        <td className="py-3 border-r border-b border-gray-200">
                          {/* Toggle Switch */}
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (role.id === "role_1") {
                                  alert("超级管理员无法停用！");
                                  return;
                                }
                                onEditRole(role.id, role.name, role.description, !role.enabled, role.authorizedMenus);
                              }}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:outline-none ${
                                role.enabled ? "bg-blue-500" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                  role.enabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 border-b border-gray-200">
                          <div className="flex items-center justify-center space-x-3 text-gray-800">
                            <button
                              onClick={() => handleOpenEdit(role)}
                              className="hover:text-blue-600 font-medium cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => {
                                if (role.id === "role_1") {
                                  alert("超级管理员作为内置主控角色，不可删除！");
                                  return;
                                }
                                if (confirm(`确认要删除角色【${role.name}】吗？`)) {
                                  onDeleteRole(role.id);
                                }
                              }}
                              className={`font-medium ${
                                role.id === "role_1" ? "text-gray-300 cursor-not-allowed" : "hover:text-red-650 cursor-pointer"
                              }`}
                              disabled={role.id === "role_1"}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Replicating the "Add" view (PermissionManagementView Form) exactly
        <div className="flex-1 flex flex-col">
          {/* Breadcrumb line exactly matching screenshot code: "权限管理 / 新增" or "权限管理 / 编辑" */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-600 font-bold">
            权限管理 / {isEditMode ? "编辑" : "新增"}
          </nav>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded p-12 min-h-[600px] relative" data-purpose="authority-form-card">
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
              {/* Role Name */}
              <div className="flex items-center">
                <label className="w-24 flex-shrink-0 text-gray-700 select-none text-sm" htmlFor="role-name">角色名称</label>
                <input
                  id="role-name"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 outline-none"
                  required
                />
              </div>

              {/* Role Description */}
              <div className="flex items-center">
                <label className="w-24 flex-shrink-0 text-gray-700 select-none text-sm" htmlFor="role-desc">角色描述</label>
                <input
                  id="role-desc"
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="flex-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 outline-none"
                  required
                />
              </div>

              {/* Role Status */}
              <div className="flex items-center">
                <span className="w-24 flex-shrink-0 text-gray-700 select-none text-sm">角色状态</span>
                <div className="flex items-center space-x-4 text-sm">
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      value="enable"
                      checked={roleEnabled === true}
                      onChange={() => setRoleEnabled(true)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                    />
                    <span className="ml-2">启用</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      value="disable"
                      checked={roleEnabled === false}
                      onChange={() => {
                        if (isEditMode && editingRoleId === "role_1") {
                          alert("超级管理员不可禁用");
                          return;
                        }
                        setRoleEnabled(false);
                      }}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                    />
                    <span className="ml-2">禁用</span>
                  </label>
                </div>
              </div>

              {/* Authority Tree */}
              <div className="space-y-2">
                <label className="block text-gray-700 mb-4 font-normal text-sm select-none">后台管理系统权限</label>
                <div className="ml-8 space-y-3" data-purpose="authority-tree">
                  {/* Node: Workstation */}
                  <div className="relative pl-5">
                    {/* tree connectors simulated cleanly or absolute spacing */}
                    <div className="flex items-center space-x-2">
                      {/* chevron down indicator exactly matching screenshot SVG design */}
                      <svg className="w-3 h-3 text-blue-500 shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes("workstation")}
                        onChange={() => handleToggleMenu("workstation")}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      {/* Fill color yellow folder representing active workstations category */}
                      <svg className="w-4 h-4 text-yellow-500 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                      </svg>
                      <span className="text-blue-500 font-medium text-sm select-none">工作台</span>
                    </div>

                    {/* Children of Workstation */}
                    <div className="ml-10 mt-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("realtime")}
                          onChange={() => handleToggleMenu("realtime")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">实时监控</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("eventList")}
                          onChange={() => handleToggleMenu("eventList")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">事件列表</span>
                      </div>
                    </div>
                  </div>

                  {/* 收费站管理 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("station")}
                      onChange={() => handleToggleMenu("station")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">收费站管理</span>
                  </div>

                  {/* 权限管理 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("permission")}
                      onChange={() => handleToggleMenu("permission")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">权限管理</span>
                  </div>

                  {/* 账号管理 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("account")}
                      onChange={() => handleToggleMenu("account")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">账号管理</span>
                  </div>

                  {/* 操作日志 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("operation_log")}
                      onChange={() => handleToggleMenu("operation_log")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">操作日志</span>
                  </div>

                  {/* 通用参数配置 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("general_config")}
                      onChange={() => handleToggleMenu("general_config")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">通用参数配置</span>
                  </div>

                  {/* Node: Device parent with submenus */}
                  <div className="relative pl-5">
                    <div className="flex items-center space-x-2">
                      <svg className="w-3 h-3 text-blue-500 shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes("device_parent")}
                        onChange={() => handleToggleMenu("device_parent")}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <svg className="w-4 h-4 text-yellow-500 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                      </svg>
                      <span className="text-blue-500 font-medium text-sm select-none">设备管理</span>
                    </div>

                    {/* Submenus of Device parent */}
                    <div className="ml-10 mt-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("device")}
                          onChange={() => handleToggleMenu("device")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">屏幕管理</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("device_speaker")}
                          onChange={() => handleToggleMenu("device_speaker")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">音响管理</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("camera")}
                          onChange={() => handleToggleMenu("camera")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">摄像头管理</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("device_watch")}
                          onChange={() => handleToggleMenu("device_watch")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">智能手表管理</span>
                      </div>
                    </div>
                  </div>

                  {/* 事件类型管理 */}
                  <div className="ml-5 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes("event_type")}
                      onChange={() => handleToggleMenu("event_type")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <svg className="w-4 h-4 text-gray-400 fill-current shrink-0" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                    <span className="text-sm text-gray-700 select-none">事件类型管理</span>
                  </div>

                  {/* Node: Upgrade parent with submenus */}
                  <div className="relative pl-5">
                    <div className="flex items-center space-x-2">
                      <svg className="w-3 h-3 text-blue-500 shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes("upgrade_parent")}
                        onChange={() => handleToggleMenu("upgrade_parent")}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <svg className="w-4 h-4 text-yellow-500 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                      </svg>
                      <span className="text-blue-500 font-medium text-sm select-none">升级包升级</span>
                    </div>

                    {/* Submenus of Upgrade parent */}
                    <div className="ml-10 mt-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("upgrade_outdoor")}
                          onChange={() => handleToggleMenu("upgrade_outdoor")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">户外屏</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes("upgrade_server")}
                          onChange={() => handleToggleMenu("upgrade_server")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="text-sm text-gray-700 select-none">服务端</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center space-x-3 pt-6">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1.5 rounded transition shadow-sm text-xs cursor-pointer font-medium"
                  data-purpose="save-button"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setFormActive(false)}
                  className="bg-white border border-gray-300 text-gray-600 px-6 py-1.5 rounded hover:bg-gray-50 transition shadow-sm text-xs cursor-pointer inline-flex items-center justify-center whitespace-normal"
                  data-purpose="back-button"
                >
                  {/* Replicating character stack exactly */}
                  <span className="block w-3 text-center leading-tight">返回</span>
                </button>
              </div>
            </form>

            {/* Floating Annotation (From Screenshot) */}
            {showAnnotations && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-y-1/2 translate-x-20 w-56 border border-yellow-400 rounded overflow-hidden shadow-lg bg-white z-20"
                data-purpose="floating-annotation"
              >
                <div className="bg-yellow-400 text-white px-3 py-1 text-xs flex justify-between items-center font-bold">
                  <span>7</span>
                </div>
                <div className="p-3 text-xs leading-relaxed space-y-4">
                  <p className="font-bold text-gray-800">编辑代入历史填写数据</p>
                  <p className="text-gray-400 italic">漂亮小狗💛</p>
                </div>
                {/* Indicator Line Decor */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-4 h-[1px] bg-yellow-400"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL OVERLAY MODAL */}
      {detailedRole && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-850 text-sm">角色信息详情</span>
              <button
                onClick={() => setDetailedRole(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto">
              <div className="space-y-1.5 bg-gray-50 p-3 rounded">
                <p className="text-gray-400 font-semibold">角色名称</p>
                <p className="text-gray-900 font-bold text-sm">{detailedRole.name}</p>
              </div>
              <div className="space-y-1.5 bg-gray-50 p-3 rounded">
                <p className="text-gray-400 font-semibold">角色描述</p>
                <p className="text-gray-850 font-medium">{detailedRole.description || "未加入描述"}</p>
              </div>
              <div className="space-y-1.5 bg-gray-50 p-3 rounded">
                <p className="text-gray-400 font-semibold">状态</p>
                <p className={`font-bold ${detailedRole.enabled ? "text-green-600" : "text-gray-400"}`}>
                  {detailedRole.enabled ? "启用" : "禁用"}
                </p>
              </div>
              <div className="space-y-1.5 bg-gray-50 p-3 rounded">
                <p className="text-gray-400 font-semibold">拥有界面菜单权限</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {detailedRole.authorizedMenus && detailedRole.authorizedMenus.length > 0 ? (
                    detailedRole.authorizedMenus.map((key) => {
                      const name = MENU_NAME_MAP[key] || key;
                      return (
                        <span key={key} className="bg-blue-50 text-blue-600 border border-blue-100 rounded px-2 py-0.5 text-[10px] font-medium leading-none">
                          {name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 italic">暂无菜单权限</span>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 text-right border-t border-gray-200">
              <button
                onClick={() => setDetailedRole(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1.5 cursor-pointer font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
