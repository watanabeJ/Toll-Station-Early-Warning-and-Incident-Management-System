import React, { useState } from "react";
import { Plus, Edit, Trash2, ShieldAlert, Check, Calendar, Search, RefreshCw, Eye, EyeOff, AlertTriangle, ChevronDown } from "lucide-react";
import { TollStation } from "../types";

interface StationManagementViewProps {
  stations: TollStation[];
  onAddStation: (name: string, status: "启用" | "禁用") => void;
  onEditStation: (id: string, name: string) => void;
  onChangeStatus: (id: string, newStatus: "启用" | "禁用") => void;
  onDeleteStation: (id: string) => void;
}

export default function StationManagementView({
  stations,
  onAddStation,
  onEditStation,
  onChangeStatus,
  onDeleteStation,
}: StationManagementViewProps) {
  // Query Filter state
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部");
  const [openStatusDrop, setOpenStatusDrop] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addStatus, setAddStatus] = useState<"启用" | "禁用">("启用");

  const [editingStation, setEditingStation] = useState<TollStation | null>(null);
  const [editName, setEditName] = useState("");

  const [disablingStation, setDisablingStation] = useState<TollStation | null>(null);
  const [deletingStation, setDeletingStation] = useState<TollStation | null>(null);

  // Toast Alerts list
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: "success" | "warning" }>>([]);

  const addToast = (msg: string, type: "success" | "warning" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleCreate = () => {
    if (!addName.trim()) {
      alert("请输入收费站名称");
      return;
    }
    onAddStation(addName, addStatus);
    setShowAddModal(false);
    setAddName("");
    setAddStatus("启用");
    addToast("收费站创建成功");
  };

  const handleUpdate = () => {
    if (!editingStation) return;
    if (!editName.trim()) {
      alert("请输入收费站名称");
      return;
    }
    onEditStation(editingStation.id, editName);
    setEditingStation(null);
    setEditName("");
    addToast("收费站更新成功");
  };

  const confirmDisable = () => {
    if (!disablingStation) return;
    onChangeStatus(disablingStation.id, "禁用");
    addToast("已禁用", "warning");
    setDisablingStation(null);
  };

  const confirmDelete = () => {
    if (!deletingStation) return;
    onDeleteStation(deletingStation.id);
    addToast("已删除", "warning");
    setDeletingStation(null);
  };

  const handleToggleStatus = (station: TollStation) => {
    if (station.status === "启用") {
      // Prompt warning dialog for disabling
      setDisablingStation(station);
    } else {
      // Toggle immediately to enable
      onChangeStatus(station.id, "启用");
      addToast("启用成功");
    }
  };

  const filteredStations = stations.filter((s) => {
    if (searchName && !s.name.includes(searchName)) return false;
    if (searchStatus !== "全部" && s.status !== searchStatus) return false;
    if (searchDate && !s.createdTime.includes(searchDate)) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Title */}
      <div className="pb-2 border-b border-gray-200 shrink-0">
        <h2 className="text-sm font-semibold text-gray-700">收费站管理</h2>
      </div>

      {/* Main Content card */}
      <div className="bg-white rounded border border-gray-200 shadow-xs p-6 min-h-[500px] flex flex-col justify-between relative">
        <div>
          {/* Query Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6" data-purpose="filter-bar">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600 whitespace-nowrap" htmlFor="station-name-search">收费站名称</label>
              <input
                id="station-name-search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs w-36 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-8 bg-white text-gray-700"
                placeholder="请输入名称"
                type="text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600 whitespace-nowrap" htmlFor="creation-time-search">创建时间</label>
              <div className="relative">
                <input
                  id="creation-time-search"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-xs w-40 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none pr-8 h-8 bg-white text-gray-700"
                  placeholder="开始-结束 (年月日)"
                  type="text"
                />
                <Calendar className="w-4 h-4 absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status selector */}
            <div className="flex items-center space-x-2 relative">
              <span className="text-xs text-gray-600 whitespace-nowrap">收费站状态</span>
              <div className="relative w-28">
                <button
                  type="button"
                  onClick={() => setOpenStatusDrop(!openStatusDrop)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left text-gray-700"
                >
                  <span>{searchStatus}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {openStatusDrop && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30">
                    {["全部", "启用", "禁用"].map((st) => (
                      <div
                        key={st}
                        onClick={() => {
                          setSearchStatus(st);
                          setOpenStatusDrop(false);
                        }}
                        className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center justify-between"
                      >
                        <span>{st}</span>
                        {searchStatus === st && <Check className="w-3 h-3 text-blue-550 shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {}}
                className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-4 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
              <button
                onClick={() => {
                  setSearchName("");
                  setSearchDate("");
                  setSearchStatus("全部");
                }}
                className="bg-white hover:bg-gray-50 text-[#1890ff] border border-blue-200 rounded text-xs px-4 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
              >
                重置
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-4 rounded transition duration-200 cursor-pointer h-8 flex items-center"
            >
              + 新增
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600 font-bold">
                  <th className="py-3 px-4 border-r border-gray-200 w-20">序号</th>
                  <th className="py-3 px-4 border-r border-gray-200 text-left pl-6">收费站名称</th>
                  <th className="py-3 px-4 border-r border-gray-200 w-28">状态</th>
                  <th className="py-3 px-4 border-r border-gray-200">创建时间</th>
                  <th className="py-3 px-4 w-44">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {filteredStations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      暂无收费站记录
                    </td>
                  </tr>
                ) : (
                  filteredStations.map((station, idx) => {
                    const isEnabled = station.status === "启用";
                    return (
                      <tr key={station.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-4 px-4 border-r border-gray-200 font-semibold text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-6 border-r border-gray-200 text-left font-medium text-gray-900">
                          {station.name}
                        </td>
                        <td className="py-4 px-4 border-r border-gray-200">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(station)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? "bg-blue-500" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                  isEnabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-gray-200 text-gray-500 font-mono">
                          {station.createdTime}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center items-center space-x-3 text-xs">
                            <button
                              onClick={() => {
                                setEditingStation(station);
                                setEditName(station.name);
                              }}
                              className="text-gray-800 hover:text-blue-500 font-medium flex items-center gap-1 cursor-pointer"
                              title="编辑名称"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => setDeletingStation(station)}
                              className="text-gray-800 hover:text-red-600 font-medium cursor-pointer"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex justify-end mt-4 text-[11px] text-gray-400">
          <span>共 {filteredStations.length} 个收费站点</span>
        </div>
      </div>

      {/* NEW MODAL (Screen 8) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-[450px] p-8 border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-6">新增收费站</h3>
            <div className="space-y-6 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-2" htmlFor="add-name-input">收费站名称</label>
                <input
                  id="add-name-input"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="请输入收费站名称"
                  type="text"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">默认状态</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={addStatus === "启用"}
                      onChange={() => setAddStatus("启用")}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      type="radio"
                      name="addStatus"
                    />
                    <span className="text-xs text-gray-700">启用</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={addStatus === "禁用"}
                      onChange={() => setAddStatus("禁用")}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      type="radio"
                      name="addStatus"
                    />
                    <span className="text-xs text-gray-700">禁用</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-150">
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold cursor-pointer"
                >
                  确定
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddName("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-xs hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (Screen 9) */}
      {editingStation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-[450px] p-8 border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-6">编辑收费站</h3>
            <div className="space-y-6 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-2" htmlFor="edit-name-input">收费站名称</label>
                <input
                  id="edit-name-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="请输入收费站名称"
                  type="text"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-150">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold cursor-pointer"
                >
                  确定
                </button>
                <button
                  onClick={() => {
                    setEditingStation(null);
                    setEditName("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-xs hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WARNING DIALOG - DISABLING STATION (Screen 8) */}
      {disablingStation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-lg p-8 w-[450px] shadow-2xl border border-gray-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900">确认要禁用该站点吗？</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded border border-amber-100">
                提醒：禁用收费站【{disablingStation.name}】后，您将<strong>无法继续处理</strong>该站点的任何特情监控车道事件！
              </p>
            </div>
            <div className="flex justify-start gap-4">
              <button
                onClick={() => setDisablingStation(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-xs font-medium transition cursor-pointer"
              >
                再想想
              </button>
              <button
                onClick={confirmDisable}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded text-xs font-medium hover:bg-gray-50 transition cursor-pointer"
              >
                确定禁用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARNING DIALOG - DELETING STATION (Screen 8) */}
      {deletingStation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-lg p-8 w-[450px] shadow-2xl border border-gray-200 text-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-gray-900">删除后不可恢复！</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed bg-red-50 p-3 rounded border border-red-100">
                警告：删除站点【{deletingStation.name}】后将<strong>永久清空</strong>该站点历史关联的所有车道流、记录以及处理人反馈数据，请谨慎评估与操作！
              </p>
            </div>
            <div className="flex justify-start gap-3">
              <button
                onClick={() => setDeletingStation(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-xs font-medium transition cursor-pointer"
              >
                再想想
              </button>
              <button
                onClick={confirmDelete}
                className="bg-white border border-gray-300 text-red-600 px-6 py-2 rounded text-xs font-medium hover:bg-red-50 transition cursor-pointer"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM CONTAINER (Screen 8 Toast representation) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-8 py-3 rounded shadow-lg text-xs font-bold border flex items-center gap-2 animate-slideIn ${toast.type === "warning" ? "bg-red-50 border-red-200 text-red-700 shadow-red-500/10" : "bg-white border-green-200 text-green-700 shadow-green-500/10"}`}
          >
            {toast.type === "success" ? <Check className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
            {toast.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
