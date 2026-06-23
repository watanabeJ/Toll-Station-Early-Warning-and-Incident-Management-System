import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Calendar, Search, RotateCcw, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { TollStation } from "../types";

export interface SpeakerDirectionParams {
  ip: string;
  ttsVoice: string;
  volume: number;
  ttsPitch: string;
  ttsSpeed: string;
  playInterval: string;
  sleepTime: string;
  playEventTypes: string[];
}

export interface SpeakerParamsGroup {
  front: SpeakerDirectionParams;
  back: SpeakerDirectionParams;
}

interface DeviceItem {
  id: string;          // 设备ID
  station: string;     // 所属收费站
  status: "正常" | "离线"; // 设备状态
  lastHeartbeat: string; // 最后心跳时间
  interactEnabled: boolean; // 数字人问答交互是否启用
  staffBroadcastEnabled: boolean; // 是否播报员工事件开关
  createdTime: string;   // 创建时间
  params?: SpeakerParamsGroup; // Parameter configurations
}

interface DeviceManagementViewProps {
  showAnnotations?: boolean;
  onAppendLog?: (module: string, action: string) => void;
  stations?: TollStation[];
  allowedStations?: string[];
}

export default function DeviceManagementView({
  showAnnotations = true,
  onAppendLog,
  stations = [],
  allowedStations = [],
}: DeviceManagementViewProps) {
  // Persistence key for device list (Must be separate from Speaker list key to avoid overwriting each other)
  const STORAGE_KEY = "highway_screens_list_db";

  // Pre-seeded device list exactly matching the screenshot
  const initialData: DeviceItem[] = [
    {
      id: "yongchuan23",
      station: "永川南收费站",
      status: "正常",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: true,
      staffBroadcastEnabled: true,
      createdTime: "2024/02/26 17:23:21",
    },
    {
      id: "yongchuan24",
      station: "永川南收费站",
      status: "离线",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: true,
      staffBroadcastEnabled: true,
      createdTime: "2024/02/26 17:23:21",
    },
    {
      id: "yongchuan25",
      station: "永川西收费站",
      status: "正常",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: false,
      staffBroadcastEnabled: false,
      createdTime: "2024/02/26 17:23:21",
    },
  ];

  // Helper to create starting config parameters for a device
  const initialParamsForDevice = (id: string): SpeakerParamsGroup => {
    if (id === "yongchuan23") {
      return {
        front: {
          ip: "192.168.1.108",
          ttsVoice: "晓峰 (xiaofeng)",
          volume: 95,
          ttsPitch: "50",
          ttsSpeed: "50",
          playInterval: "1",
          sleepTime: "4",
          playEventTypes: ["行人", "二轮车"]
        },
        back: {
          ip: "192.168.1.109",
          ttsVoice: "晓峰 (xiaofeng)",
          volume: 80,
          ttsPitch: "50",
          ttsSpeed: "50",
          playInterval: "1",
          sleepTime: "4",
          playEventTypes: ["行人", "二轮车"]
        }
      };
    } else if (id === "yongchuan24") {
      return {
        front: {
          ip: "192.168.1.112",
          ttsVoice: "晓梅 (xiaomei)",
          volume: 85,
          ttsPitch: "50",
          ttsSpeed: "45",
          playInterval: "2",
          sleepTime: "6",
          playEventTypes: ["超高车", "违停车"]
        },
        back: {
          ip: "192.168.1.113",
          ttsVoice: "晓峰 (xiaofeng)",
          volume: 75,
          ttsPitch: "50",
          ttsSpeed: "50",
          playInterval: "2",
          sleepTime: "6",
          playEventTypes: ["超高车", "违停车"]
        }
      };
    } else {
      return {
        front: {
          ip: "192.168.1.120",
          ttsVoice: "晓杰 (xiaojie)",
          volume: 90,
          ttsPitch: "50",
          ttsSpeed: "50",
          playInterval: "1",
          sleepTime: "2",
          playEventTypes: ["行人"]
        },
        back: {
          ip: "192.168.1.121",
          ttsVoice: "晓杰 (xiaojie)",
          volume: 80,
          ttsPitch: "50",
          ttsSpeed: "50",
          playInterval: "1",
          sleepTime: "2",
          playEventTypes: ["行人"]
        }
      };
    }
  };

  // Load from local storage or pre-seeded data
  const [devices, setDevices] = useState<DeviceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: any) => {
            if (!d.params) {
              d.params = initialParamsForDevice(d.id);
            }
            if (d.staffBroadcastEnabled === undefined) {
              d.staffBroadcastEnabled = d.interactEnabled !== undefined ? d.interactEnabled : true;
            }
            return d;
          });
        }
      } catch (e) {
        // Fallback
      }
    }
    return initialData.map(d => ({
      ...d,
      params: initialParamsForDevice(d.id)
    }));
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }, [devices]);

  // Search Filter form states
  const [searchStation, setSearchStation] = useState("全部");
  const [searchStatus, setSearchStatus] = useState("全部");
  const [searchInteract, setSearchInteract] = useState("全部");
  const [searchCreatedTime, setSearchCreatedTime] = useState("");
  const [searchDeviceId, setSearchDeviceId] = useState("");

  // Dropdown menus states for searching filters
  const [openStationDrop, setOpenStationDrop] = useState(false);
  const [openStatusDrop, setOpenStatusDrop] = useState(false);
  const [openInteractDrop, setOpenInteractDrop] = useState(false);

  // New Device creation form states (Bottom inline panel, now a modular popup/card)
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [formStation, setFormStation] = useState("");
  const [formDeviceId, setFormDeviceId] = useState("");
  const [formInteractEnabled, setFormInteractEnabled] = useState(false); // default to false based on rule: "语音默认是关闭"
  const [formStatus, setFormStatus] = useState<"正常" | "离线">("正常");

  // Dropdown for adding form station
  const [openFormStationDrop, setOpenFormStationDrop] = useState(false);

  // Pagination page state
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [originalDeviceId, setOriginalDeviceId] = useState("");

  // Get active stations list from props, fall back to localStorage, then default seeding list
  const getStationsList = (): string[] => {
    let result: string[] = [];
    if (stations && stations.length > 0) {
      result = stations.filter(s => s.status === "启用").map(s => s.name);
    } else {
      const saved = localStorage.getItem("toll_sys_stations");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            result = parsed.filter((s: any) => s.status === "启用").map((s: any) => s.name);
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (result.length === 0) {
        result = [
          "永川西收费站",
          "永川南收费站",
          "永川东收费站",
          "荣昌东收费站",
        ];
      }
    }
    if (allowedStations && allowedStations.length > 0) {
      result = result.filter((name) => allowedStations.includes(name));
    }
    return result;
  };

  const availableStations = getStationsList();

  // Handle queries search (still useful for custom page resets and appending logs)
  const handleSearch = () => {
    setCurrentPage(1); // jump to page 1 on active search
    if (onAppendLog) {
      onAppendLog("设备管理", `触发条件搜索: [收费站:${searchStation}]、[状态:${searchStatus}]、[设备ID:${searchDeviceId || "无"}]`);
    }
  };

  // Handle resetting search criteria
  const handleResetFilters = () => {
    setSearchStation("全部");
    setSearchStatus("全部");
    setSearchInteract("全部");
    setSearchCreatedTime("");
    setSearchDeviceId("");
    setCurrentPage(1); // restores back to default Page 1
    if (onAppendLog) {
      onAppendLog("设备管理", "重置设备管理查询条件");
    }
  };

  // Apply filters to device lists dynamically based on design values
  const filteredDevices = devices.filter((dev) => {
    // Check if the device's station is allowed
    if (allowedStations && allowedStations.length > 0 && !allowedStations.includes(dev.station)) {
      return false;
    }
    // 1. Station
    if (
      searchStation !== "全部" &&
      dev.station !== searchStation
    ) {
      return false;
    }
    // 2. Status
    if (searchStatus !== "全部" && dev.status !== searchStatus) {
      return false;
    }
    // 3. Interactions
    if (searchInteract !== "全部") {
      const wantEnabled = searchInteract === "开启";
      if (dev.interactEnabled !== wantEnabled) {
        return false;
      }
    }
    // 4. Device ID
    if (
      searchDeviceId.trim() &&
      !dev.id.toLowerCase().includes(searchDeviceId.trim().toLowerCase())
    ) {
      return false;
    }
    // 5. Created Time
    if (
      searchCreatedTime.trim() &&
      !dev.createdTime.toLowerCase().includes(searchCreatedTime.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  
  const paginatedDevices = filteredDevices.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Simulated list to fulfill bottom right pagination "5 slots" look easily
  const displayPages = Array.from({ length: Math.max(totalPages, 5) }, (_, i) => i + 1);

  // Toggle user voice interaction switches
  const handleToggleInteract = (id: string, currentVal: boolean) => {
    const updatedVal = !currentVal;
    setDevices((prev) =>
      prev.map((dev) =>
        dev.id === id ? { ...dev, interactEnabled: updatedVal } : dev
      )
    );
    if (onAppendLog) {
      onAppendLog(
        "设备管理",
        `修改数字人问答交互 [设备ID: ${id}] 为 [${updatedVal ? "开启" : "关闭"}]`
      );
    }
  };

  // Toggle staff event broadcast switches
  const handleToggleStaffBroadcast = (id: string, currentVal: boolean) => {
    const updatedVal = !currentVal;
    setDevices((prev) =>
      prev.map((dev) =>
        dev.id === id ? { ...dev, staffBroadcastEnabled: updatedVal } : dev
      )
    );
    if (onAppendLog) {
      onAppendLog(
        "设备管理",
        `修改员工事件播报 [设备ID: ${id}] 为 [${updatedVal ? "开启" : "关闭"}]`
      );
    }
  };

  // Handle Device status logging
  const handleViewStatusLogs = (id: string) => {
    if (onAppendLog) {
      onAppendLog("设备管理", `查看设备健康链路状态调试及上报: [${id}]`);
    }
    alert(`设备 [${id}] 链路检测通过，当前工作频率及自检心跳良好。`);
  };

  const handleEditDeviceClick = (dev: DeviceItem) => {
    setModalMode("edit");
    setOriginalDeviceId(dev.id);
    setFormStation(dev.station);
    setFormDeviceId(dev.id);
    setFormInteractEnabled(dev.interactEnabled);
    setFormStatus(dev.status);
    setShowAddPanel(true);
  };

  const handleDeleteDevice = (id: string) => {
    setDeleteTargetId(id);
  };

  // Save Device Form Submits
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStation) {
      alert("请选择所属收费站");
      return;
    }
    if (!formDeviceId.trim()) {
      alert("请输入设备ID");
      return;
    }

    const cleanedId = formDeviceId.trim();

    // Check duplicate ID (编号唯一)
    const isIdChanged = modalMode === "edit" ? cleanedId.toLowerCase() !== originalDeviceId.toLowerCase() : true;
    if (isIdChanged && devices.some((dev) => dev.id.toLowerCase() === cleanedId.toLowerCase())) {
      alert("设备ID编号已存在，编码需保持唯一，请重新输入！");
      return;
    }

    // Prepare time string in format 2024/02/26 17:23:21
    const now = new Date();
    const formattedTime = `${now.getFullYear()}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    if (modalMode === "add") {
      const newDevice: DeviceItem = {
        id: cleanedId,
        station: formStation,
        status: formStatus,
        lastHeartbeat: formattedTime,
        interactEnabled: formInteractEnabled,
        staffBroadcastEnabled: formInteractEnabled,
        createdTime: formattedTime,
      };

      setDevices((prev) => [newDevice, ...prev]);

      if (onAppendLog) {
        onAppendLog(
          "设备管理",
          `新增设备 [所属收费站: ${formStation}] [设备ID: ${cleanedId}] [AI交互: ${
            formInteractEnabled ? "开启" : "关闭"
          }] [状态: ${formStatus}]`
        );
      }
      alert("设备创建成功，已建立对应AI检测信道！");
    } else {
      setDevices((prev) =>
        prev.map((dev) =>
          dev.id === originalDeviceId
            ? {
                ...dev,
                id: cleanedId,
                station: formStation,
                interactEnabled: formInteractEnabled,
                status: formStatus,
              }
            : dev
        )
      );

      if (onAppendLog) {
        onAppendLog(
          "设备管理",
          `修改设备 [原ID: ${originalDeviceId}] -> [新ID: ${cleanedId}] [所属收费站: ${formStation}] [AI交互: ${
            formInteractEnabled ? "开启" : "关闭"
          }] [状态: ${formStatus}]`
        );
      }
      alert("设备信息更新成功！");
    }

    // Reset Form fields
    setFormStation("");
    setFormDeviceId("");
    setFormInteractEnabled(false);
    setFormStatus("正常");
    setShowAddPanel(false);
  };

  return (
    <div className="flex-1 p-0 flex flex-col relative text-[13px] font-sans antialiased text-gray-800">
      
      {/* 1. Header Title */}
      <div className="pb-3 mb-5 border-b border-gray-150 flex items-center justify-between" id="device-view-title-bar">
        <div className="text-[13px] text-gray-400 select-none flex items-center gap-1.5">
          <span>设备管理</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium font-sans">屏幕管理</span>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-5 rounded border border-gray-200 mb-6" id="device-filter-card">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          
          {/* Filter 1: 所属收费站 */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">所属收费站</span>
            <div className="relative w-28">
              <button
                type="button"
                onClick={() => {
                  setOpenStationDrop(!openStationDrop);
                  setOpenStatusDrop(false);
                  setOpenInteractDrop(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
              >
                <span className="truncate">{searchStation}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {openStationDrop && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-48 overflow-y-auto w-36">
                  <div
                    onClick={() => {
                      setSearchStation("全部");
                      setOpenStationDrop(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700"
                  >
                    全部
                  </div>
                  {availableStations.map((st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setSearchStation(st);
                        setOpenStationDrop(false);
                      }}
                      className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center justify-between"
                    >
                      <span className="truncate">{st}</span>
                      {searchStation === st && <Check className="w-3 h-3 text-blue-550 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter 2: 设备状态 */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">设备状态</span>
            <div className="relative w-20">
              <button
                type="button"
                onClick={() => {
                  setOpenStatusDrop(!openStatusDrop);
                  setOpenStationDrop(false);
                  setOpenInteractDrop(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
              >
                <span className="truncate">{searchStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {openStatusDrop && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 w-24">
                  {["全部", "正常", "离线"].map((st) => (
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

          {/* Filter 3: 数字人问答交互 */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">数字人问答交互</span>
            <div className="relative w-20">
              <button
                type="button"
                onClick={() => {
                  setOpenInteractDrop(!openInteractDrop);
                  setOpenStationDrop(false);
                  setOpenStatusDrop(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
              >
                <span className="truncate">{searchInteract}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {openInteractDrop && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 w-24">
                  {["全部", "开启", "关闭"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSearchInteract(opt);
                        setOpenInteractDrop(false);
                      }}
                      className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      {searchInteract === opt && <Check className="w-3 h-3 text-blue-550 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter 4: 创建时间 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium whitespace-nowrap">创建时间</span>
            <div className="relative w-56 flex items-center">
              <input
                type="text"
                value={searchCreatedTime}
                onChange={(e) => setSearchCreatedTime(e.target.value)}
                placeholder="开始—结束 (年月日时分秒)"
                className="w-full bg-white border border-gray-300 rounded pl-3 pr-8 py-1.5 text-xs outline-none focus:border-blue-500 h-8"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* ACTION BUTTONS (Aligned right) */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleSearch}
              className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-white hover:bg-gray-50 text-[#1890ff] border border-blue-200 rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
            <button
              onClick={() => {
                setModalMode("add");
                setFormStation("");
                setFormDeviceId("");
                setFormInteractEnabled(false);
                setShowAddPanel(true);
              }}
              className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Main Data Grid Panel */}
      <div className="bg-white rounded border border-gray-200 p-0 overflow-visible relative mb-8" id="device-table-card">
        <div className="overflow-x-visible relative">
          <table className="w-full text-center text-xs border-collapse relative">
            <thead>
              <tr className="bg-[#f5f5f5] text-gray-700 font-semibold border-b border-gray-200">
                <th className="py-3 px-4 border-r border-gray-200 font-semibold w-16 text-gray-600">序号</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold w-48 text-gray-600">设备ID</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">所属收费站</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">设备状态</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">最后心跳时间</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">数字人问答交互</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">创建时间</th>
                <th className="py-3 px-4 font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200 bg-white">
              {paginatedDevices.map((dev, idx) => {
                const isOffline = dev.status === "离线";
                const serialNum = (activePage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={dev.id} className="hover:bg-gray-50 transition duration-150 relative">
                    {/* Serial Number */}
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono text-gray-500">
                      {serialNum}
                    </td>

                    {/* Device ID */}
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono font-medium text-gray-700">
                      {dev.id}
                    </td>

                    {/* School/Station Location */}
                    <td className="py-3.5 px-4 border-r border-gray-200 font-sans text-gray-800">
                      {dev.station}
                    </td>

                    {/* Status Badge with connection underline */}
                    <td className="py-3.5 px-4 border-r border-gray-200">
                      {isOffline ? (
                        <div className="flex justify-center items-center">
                          <span className="text-[#fa8c16] font-bold text-xs" id={`status-${dev.id}`}>
                            离线
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => handleViewStatusLogs(dev.id)}
                            className="text-[#1890ff] font-medium hover:text-blue-700 underline underline-offset-2 cursor-pointer"
                            title="查看链路自检详情"
                          >
                            正常
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Last heartbeat time */}
                    <td className="py-3.5 px-4 border-r border-gray-200 text-gray-500 font-mono">
                      {dev.lastHeartbeat}
                    </td>

                    {/* Interact Switch toggle */}
                    <td className="py-3.5 px-4 border-r border-gray-200">
                      <div className="flex justify-center items-center">
                        <button
                          type="button"
                          onClick={() => handleToggleInteract(dev.id, dev.interactEnabled)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            dev.interactEnabled ? "bg-blue-500" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                              dev.interactEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Creation Time */}
                    <td className="py-3.5 px-4 text-gray-500 font-mono border-r border-gray-200">
                      {dev.createdTime}
                    </td>

                    {/* Operations: Edit and Delete */}
                    <td className="py-3.5 px-4 text-center select-none">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditDeviceClick(dev)}
                          className="text-[#1890ff] hover:text-blue-700 font-semibold hover:underline cursor-pointer transition text-[12px]"
                          title="编辑修改此机电设备配置"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(dev.id)}
                          className="text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer transition text-[12px]"
                          title="注销移除此机电设备"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    没有搜索到符合筛选方案的智能机电设备。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* -------------------- CALLOUT ANNOTATIONS PINS OVERLAY -------------------- */}
        {showAnnotations && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
            
            {/* CALLOUT 14: 离线：根据心跳检测... (Pointed to yongchuan24 row status column) */}
            <div
              className="absolute left-[36%] top-[108px] w-64 border border-yellow-400 rounded-lg overflow-hidden shadow-md bg-white pointer-events-auto animate-fadeIn"
              style={{ animationDelay: "100ms" }}
            >
              {/* Yellow header bar with number 14 */}
              <div className="bg-yellow-400 text-white px-3 py-1 text-xs font-bold flex justify-between items-center">
                <span className="font-mono text-[10px] bg-yellow-500/60 text-white w-4 h-4 rounded-full flex items-center justify-center">
                  14
                </span>
              </div>
              {/* Content box */}
              <div className="p-3 bg-white text-xs text-gray-700 space-y-2 leading-relaxed">
                <p className="font-bold text-gray-905">离线：根据心跳检测，n分钟没有收到消息则为离线（具体指标后端定义）</p>
                <p className="text-right text-yellow-600 font-bold text-[10px] pt-1">
                  漂亮小狗💛
                </p>
              </div>
              {/* Connector pin and vertical line upward to yongchuan24 status cel */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none select-none flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                <div className="w-[1.5px] h-10 bg-yellow-400"></div>
              </div>
            </div>

            {/* CALLOUT 15: 升级要纳入操作日志 (Pointed to the date column aligned with row yongchuan24) */}
            <div
              className="absolute right-[1%] top-[110px] w-56 border border-yellow-400 rounded-lg overflow-hidden shadow-md bg-white pointer-events-auto animate-fadeIn"
              style={{ animationDelay: "200ms" }}
            >
              <div className="bg-yellow-400 text-white px-3 py-1 text-xs font-bold flex justify-between items-center">
                <span className="font-mono text-[10px] bg-yellow-500/60 text-white w-4 h-4 rounded-full flex items-center justify-center">
                  15
                </span>
              </div>
              <div className="p-3 bg-white text-xs text-gray-700 space-y-2 leading-relaxed">
                <p className="font-bold text-gray-905">升级要纳入操作日志</p>
                <p className="text-right text-yellow-600 font-bold text-[10px] pt-1">
                  漂亮小狗💛
                </p>
              </div>
              {/* Connector line extending upward vertically */}
              <div className="absolute -top-12 left-[90%] pointer-events-none select-none flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                <div className="w-[1.5px] h-10 bg-yellow-400"></div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 4. Bottom Row Container: ADD DEVICE CARD & PAGINATION PANEL */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mt-4 select-none relative" id="device-footer-and-add-card">
        
        {/* LEFT SECTION: 新增设备 PANEL */}
        {showAddPanel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn" id="add-device-modal-overlay">
            <div
              id="add-device-panel"
              className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800"
            >
              <button
                type="button"
                onClick={() => {
                  setFormStation("");
                  setFormDeviceId("");
                  setFormInteractEnabled(false);
                  setFormStatus("正常");
                  setShowAddPanel(false);
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-[13px] font-bold text-gray-800 mb-5 pb-1 block border-b border-gray-50">
                {modalMode === "edit" ? "编辑设备" : "新增设备"}
              </h3>
              
              <form onSubmit={handleAddDevice} className="space-y-4">
                
                {/* Field 1: 所属收费站 */}
                <div className="flex items-start">
                  <label className="w-24 text-right pr-3 pt-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                    所属收费站
                  </label>
                  
                  <div className="flex-1 relative" id="form-station-select-container">
                    <button
                      type="button"
                      onClick={() => setOpenFormStationDrop(!openFormStationDrop)}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
                    >
                      <span className={formStation ? "text-gray-800" : "text-gray-400"}>
                        {formStation || "请选择"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </button>

                    {openFormStationDrop && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-md z-30 max-h-40 overflow-y-auto">
                        {availableStations.map((st) => (
                          <div
                            key={st}
                            onClick={() => {
                              setFormStation(st);
                              setOpenFormStationDrop(false);
                            }}
                            className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-750 font-normal"
                          >
                            {st}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 2: 设备ID */}
                <div className="flex items-start">
                  <label className="w-24 text-right pr-3 pt-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                    设备ID
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formDeviceId}
                      onChange={(e) => setFormDeviceId(e.target.value)}
                      placeholder="请输入"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 h-8"
                      required
                    />
                  </div>
                </div>

                {/* Field 4: 设备状态 check box panel */}
                <div className="flex items-center">
                  <span className="w-24 text-right pr-3 text-xs text-gray-600 font-medium whitespace-nowrap font-sans">
                    状态
                  </span>
                  <div className="flex items-center gap-4 text-xs select-none">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={formStatus === "正常"}
                        onChange={() => setFormStatus("正常")}
                        name="formStatus"
                        className="w-3.5 h-3.5 text-blue-500 border-gray-300 focus:ring-blue-400 cursor-pointer"
                      />
                      <span className="text-gray-700">启用</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={formStatus === "离线"}
                        onChange={() => setFormStatus("离线")}
                        name="formStatus"
                        className="w-3.5 h-3.5 text-blue-500 border-gray-300 focus:ring-blue-400 cursor-pointer"
                      />
                      <span className="text-gray-700">禁用</span>
                    </label>
                  </div>
                </div>

                {/* Form actions: 确定 / 取消 */}
                <div className="flex justify-start gap-2 pt-3 pl-24">
                  <button
                    type="submit"
                    className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-6 py-1.5 font-medium cursor-pointer transition shadow-xs"
                  >
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormStation("");
                      setFormDeviceId("");
                      setFormInteractEnabled(false);
                      setFormStatus("正常");
                      setShowAddPanel(false);
                    }}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs px-6 py-1.5 font-medium cursor-pointer transition"
                  >
                    取消
                  </button>
                </div>

              </form>

              {/* CALLOUT ANNOTATION 13 PINNED RIGHT OF FORM STATION */}
              {showAnnotations && (
                <div
                  className="absolute left-[97%] ml-6 top-[28px] w-64 border border-yellow-400 rounded-lg overflow-hidden shadow-md bg-white pointer-events-auto z-40 animate-fadeIn"
                  style={{ animationDelay: "150ms" }}
                >
                  {/* Yellow header bar with number 13 */}
                  <div className="bg-yellow-400 text-white px-3 py-1 text-xs font-bold flex justify-between items-center">
                    <span className="font-mono text-[10px] bg-yellow-500/60 text-white w-4 h-4 rounded-full flex items-center justify-center">
                      13
                    </span>
                  </div>
                  {/* Content box */}
                  <div className="p-3 bg-white text-xs text-gray-800 space-y-2 leading-relaxed">
                    <p className="font-bold text-gray-900">只能选择开启的收费站</p>
                    <p className="font-bold text-gray-900">编号唯一</p>
                    <p className="font-bold text-gray-900">语音默认是关闭</p>
                    <p className="text-right text-yellow-600 font-bold text-[10px] pt-1">
                      漂亮小狗💛
                    </p>
                  </div>
                  {/* Connecting line and dot pointing back to Form Station input */}
                  <div className="absolute -left-6 top-6 flex items-center pointer-events-none select-none">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-[16px] h-[1.5px] bg-yellow-400"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex-1" />

        {/* RIGHT SECTION: PAGINATION CONTROLS MATCHING SCREENSHOT */}
        <div className="flex justify-end items-center mt-auto ml-auto select-none" id="device-pagination">
          <div className="flex items-center space-x-1.5 text-xs text-gray-700 font-sans">
            
            {/* Left arrow trigger */}
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination page numbers */}
            {displayPages.map((pageNum) => {
              const isActive = pageNum === currentPage;
              const hasActualData = pageNum <= totalPages;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center border rounded font-sans transition-colors ${
                    isActive
                      ? "border-[#1890ff] text-[#1890ff] bg-blue-50/50 font-bold cursor-pointer"
                      : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-[#1890ff] cursor-pointer"
                  } ${!hasActualData ? "opacity-50" : ""}`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Right arrow trigger */}
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
          </div>
        </div>

      </div>

      {deleteTargetId !== null && (() => {
        const target = devices.find(d => d.id === deleteTargetId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[999] animate-fadeIn">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800 text-[13px]">
              <h3 className="text-sm font-bold text-gray-800 mb-3 block">确认移除智能显示终端</h3>
              <p className="text-gray-500 mb-5 leading-normal">
                确定要移除屏幕显示设备 (设备ID: <strong className="text-gray-800 font-mono">{target.id}</strong>，所属收费站: <strong className="text-gray-800">{target.station}</strong>) 吗？一旦移除，该站点的显示与 AI 交互检测将关闭。
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition font-medium text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDevices((prev) => prev.filter((d) => d.id !== deleteTargetId));
                    if (onAppendLog) {
                      onAppendLog("设备管理", `【屏幕管理】移除了屏幕设备: [设备ID: ${target.id}]`);
                    }
                    setDeleteTargetId(null);
                  }}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition font-medium text-xs cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
