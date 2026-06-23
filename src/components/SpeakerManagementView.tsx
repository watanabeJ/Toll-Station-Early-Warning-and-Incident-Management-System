import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Calendar, Search, RotateCcw, X, ChevronLeft, ChevronRight, Volume2, Mic, Settings, Plus } from "lucide-react";
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
  ip: string;
  ttsVoice: string;
  volume: number;
  ttsPitch: string;
  ttsSpeed: string;
  playInterval: string;
  sleepTime: string;
  playEventTypes: string[];
}

interface DeviceItem {
  id: string;          // 设备ID (Link to screen device)
  name: string;        // 音响名称
  station: string;     // 所属收费站
  status: "正常" | "离线"; // 设备状态
  lastHeartbeat: string; // 最后心跳时间
  interactEnabled: boolean; // 数字人问答交互
  staffBroadcastEnabled?: boolean; // 工作人员播报开关
  createdTime: string;   // 创建时间
  params?: SpeakerParamsGroup; // Parameter configurations for speaker
  associatedCameraName?: string;
  associatedCameraId?: string; // Associated Camera unique ID
  customParamsEnabled?: boolean;
}

interface SpeakerManagementViewProps {
  showAnnotations?: boolean;
  onAppendLog?: (module: string, action: string) => void;
  stations?: TollStation[];
  allowedStations?: string[];
}

export default function SpeakerManagementView({
  showAnnotations = true,
  onAppendLog,
  stations = [],
  allowedStations = [],
}: SpeakerManagementViewProps) {
  const STORAGE_KEY = "highway_devices_list_db";

  // Pre-seeded device list with speaker configuration parameters
  const initialParamsForDevice = (id: string): SpeakerParamsGroup => {
    if (id === "yongchuan23") {
      return {
        ip: "192.168.1.108",
        ttsVoice: "晓峰 (xiaofeng)",
        volume: 95,
        ttsPitch: "50",
        ttsSpeed: "50",
        playInterval: "1",
        sleepTime: "4",
        playEventTypes: ["行人", "二轮车"]
      };
    } else if (id === "yongchuan24") {
      return {
        ip: "192.168.1.112",
        ttsVoice: "晓梅 (xiaomei)",
        volume: 85,
        ttsPitch: "50",
        ttsSpeed: "45",
        playInterval: "2",
        sleepTime: "6",
        playEventTypes: ["超高车", "违停车"]
      };
    } else {
      return {
        ip: "192.168.1.120",
        ttsVoice: "晓杰 (xiaojie)",
        volume: 90,
        ttsPitch: "50",
        ttsSpeed: "50",
        playInterval: "1",
        sleepTime: "2",
        playEventTypes: ["行人"]
      };
    }
  };

  const initialData: DeviceItem[] = [
    {
      id: "yongchuan23",
      name: "永川西入口1号音响",
      station: "永川西收费站",
      status: "正常",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: true,
      staffBroadcastEnabled: true,
      createdTime: "2024/02/26 17:23:21",
      associatedCameraName: "永川西入口前置抓拍高清1号机"
    },
    {
      id: "yongchuan24",
      name: "永川南2号音响",
      station: "永川南收费站",
      status: "正常",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: true,
      staffBroadcastEnabled: false,
      createdTime: "2024/02/26 17:23:21",
      associatedCameraName: "永川西出口ETC车道快速抓拍辅助相机"
    },
    {
      id: "yongchuan25",
      name: "永川南3号音响",
      station: "永川南收费站",
      status: "离线",
      lastHeartbeat: "2024/02/26 17:23:21",
      interactEnabled: false,
      staffBroadcastEnabled: true,
      createdTime: "2024/02/26 17:23:21",
      associatedCameraName: ""
    },
  ];

  // Load from local storage or pre-seeded data using identical key
  const [devices, setDevices] = useState<DeviceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: any) => {
            const rawParams = d.params || initialParamsForDevice(d.id);
            if (!d.name) {
              if (d.id === "yongchuan23") d.name = "永川西入口1号音响";
              else if (d.id === "yongchuan24") d.name = "永川南2号音响";
              else if (d.id === "yongchuan25") d.name = "永川南3号音响";
              else d.name = "未命名音响_" + d.id;
            }
            if (d.associatedCameraName === undefined) {
              if (d.id === "yongchuan23") d.associatedCameraName = "永川西入口前置抓拍高清1号机";
              else if (d.id === "yongchuan24") d.associatedCameraName = "永川西出口ETC车道快速抓拍辅助相机";
              else d.associatedCameraName = "";
            }
            if (d.staffBroadcastEnabled === undefined) {
              d.staffBroadcastEnabled = d.id === "yongchuan23" || d.id === "yongchuan25";
            }

            // Safe flat migration helper:
            let flat: SpeakerParamsGroup;
            if (rawParams && typeof rawParams === "object" && "front" in rawParams) {
              const front = (rawParams as any).front;
              flat = {
                ip: front?.ip || "192.168.1.108",
                ttsVoice: front?.ttsVoice || "晓峰 (xiaofeng)",
                volume: typeof front?.volume === 'number' ? front.volume : 80,
                ttsPitch: front?.ttsPitch || "50",
                ttsSpeed: front?.ttsSpeed || "50",
                playInterval: front?.playInterval || "1",
                sleepTime: front?.sleepTime || "4",
                playEventTypes: Array.isArray(front?.playEventTypes) ? front?.playEventTypes : ["行人"]
              };
            } else {
              flat = {
                ip: rawParams?.ip || "192.168.1.108",
                ttsVoice: rawParams?.ttsVoice || "晓峰 (xiaofeng)",
                volume: typeof rawParams?.volume === 'number' ? rawParams.volume : 80,
                ttsPitch: rawParams?.ttsPitch || "50",
                ttsSpeed: rawParams?.ttsSpeed || "50",
                playInterval: rawParams?.playInterval || "1",
                sleepTime: rawParams?.sleepTime || "4",
                playEventTypes: Array.isArray(rawParams?.playEventTypes) ? rawParams.playEventTypes : ["行人"]
              };
            }

            d.params = flat;
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

  // Dynamic sync of bound camera names from localStorage camera database
  useEffect(() => {
    const camerasSaved = localStorage.getItem("toll_sys_cameras");
    if (camerasSaved) {
      try {
        const camerasList = JSON.parse(camerasSaved);
        if (Array.isArray(camerasList)) {
          setDevices((prevDevices) => {
            let changed = false;
            const updated = prevDevices.map((dev) => {
              const boundCam = camerasList.find((cam: any) => {
                const ids = cam.boundSpeakerIds || (cam.boundSpeakerId ? [cam.boundSpeakerId] : []);
                return ids.includes(dev.id);
              });
              const targetName = boundCam ? boundCam.name : "";
              const targetId = boundCam ? boundCam.id : "";
              if (dev.associatedCameraName !== targetName || dev.associatedCameraId !== targetId) {
                changed = true;
                return { ...dev, associatedCameraName: targetName, associatedCameraId: targetId };
              }
              return dev;
            });
            return changed ? updated : prevDevices;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Search Filter form states
  const [searchStation, setSearchStation] = useState("全部");
  const [searchStatus, setSearchStatus] = useState("全部");
  const [searchDeviceId, setSearchDeviceId] = useState("");
  const [searchName, setSearchName] = useState("");

  const [openStationDrop, setOpenStationDrop] = useState(false);
  const [openStatusDrop, setOpenStatusDrop] = useState(false);

  // Pagination page state
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Parameter editing states
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [selectedDeviceForParams, setSelectedDeviceForParams] = useState<DeviceItem | null>(null);
  const [editingParams, setEditingParams] = useState<SpeakerParamsGroup | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [showAddTagPopover, setShowAddTagPopover] = useState<boolean>(false);
  const [availableTagOptions] = useState<string[]>([
    "行人", 
    "二轮车", 
    "非机动车", 
    "违停车", 
    "超高车", 
    "逆行车", 
    "抛洒物"
  ]);

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

  // --- New Speaker Creation States & Submit Handler ---
  const [isAddSpeakerModalOpen, setIsAddSpeakerModalOpen] = useState(false);
  const [newSpkId, setNewSpkId] = useState("");
  const [newSpkName, setNewSpkName] = useState("");
  const [newSpkStation, setNewSpkStation] = useState(() => {
    const list = getStationsList();
    return list[0] || "永川西收费站";
  });
  const [newSpkStatus, setNewSpkStatus] = useState<"正常" | "离线">("正常");
  const [newSpkIp, setNewSpkIp] = useState("192.168.1.120");
  const [newSpkTtsVoice, setNewSpkTtsVoice] = useState("晓峰 (xiaofeng)");
  const [newSpkVolume, setNewSpkVolume] = useState(85);
  const [newSpkTtsPitch, setNewSpkTtsPitch] = useState("50");
  const [newSpkTtsSpeed, setNewSpkTtsSpeed] = useState("50");
  const [newSpkPlayInterval, setNewSpkPlayInterval] = useState("1");
  const [newSpkSleepTime, setNewSpkSleepTime] = useState("4");
  
  // Trigger belonging station selection for editing existing speaker
  const [editingStationVal, setEditingStationVal] = useState<string>("");
  const [editingStatusVal, setEditingStatusVal] = useState<"正常" | "离线">("正常");
  const [customParamsEnabled, setCustomParamsEnabled] = useState(false);

  const handleAddNewSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpkId.trim() || !newSpkName.trim()) {
      alert("请填写完整的设备编号与音响名称！");
      return;
    }

    if (devices.some(d => d.id.trim().toLowerCase() === newSpkId.trim().toLowerCase())) {
      alert("该设备编号已存在，请换一个编号！");
      return;
    }

    const newDevice: DeviceItem = {
      id: newSpkId.trim(),
      name: newSpkName.trim(),
      station: newSpkStation,
      status: newSpkStatus,
      lastHeartbeat: new Date().toISOString().replace("T", " ").substring(0, 19),
      interactEnabled: true,
      staffBroadcastEnabled: true,
      createdTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      associatedCameraName: "", // empty as requested for new speaker!
      params: {
        ip: newSpkIp.trim(),
        ttsVoice: newSpkTtsVoice,
        volume: newSpkVolume,
        ttsPitch: newSpkTtsPitch,
        ttsSpeed: newSpkTtsSpeed,
        playInterval: newSpkPlayInterval,
        sleepTime: newSpkSleepTime,
        playEventTypes: ["行人"],
      }
    };

    setDevices(prev => [newDevice, ...prev]);

    if (onAppendLog) {
      onAppendLog("音响管理", `新增音响设备: [${newSpkName.trim()}] (设备编号: ${newSpkId.trim()})`);
    }

    // Reset values
    setNewSpkId("");
    setNewSpkName("");
    setNewSpkStation(availableStations[0] || "永川西收费站");
    setNewSpkStatus("正常");
    setNewSpkIp("192.168.1.120");
    setNewSpkTtsVoice("晓峰 (xiaofeng)");
    setNewSpkVolume(85);
    setNewSpkTtsPitch("50");
    setNewSpkTtsSpeed("50");
    setNewSpkPlayInterval("1");
    setNewSpkSleepTime("4");

    setIsAddSpeakerModalOpen(false);
  };

  // Search filters trigger (still useful for custom page resets and appending logs)
  const handleSearch = () => {
    setCurrentPage(1);
    if (onAppendLog) {
      onAppendLog("音响管理", `按条件搜索音频设备: [收费站:${searchStation}]、[状态:${searchStatus}]、[音响名称:${searchName || "全部"}]`);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchStation("全部");
    setSearchStatus("全部");
    setSearchDeviceId("");
    setSearchName("");
    setCurrentPage(1);
    if (onAppendLog) {
      onAppendLog("音响管理", "重置音响参数查询条件");
    }
  };

  // Apply filters to display items dynamically
  const filteredDevices = devices.filter((dev) => {
    if (allowedStations && allowedStations.length > 0 && !allowedStations.includes(dev.station)) {
      return false;
    }
    if (searchStation !== "全部" && dev.station !== searchStation) {
      return false;
    }
    if (searchStatus !== "全部" && dev.status !== searchStatus) {
      return false;
    }
    if (
      searchName.trim() &&
      !dev.name.toLowerCase().includes(searchName.trim().toLowerCase())
    ) {
      return false;
    }
    if (
      searchDeviceId.trim() &&
      !dev.id.toLowerCase().includes(searchDeviceId.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const displayPages = Array.from({ length: Math.max(totalPages, 3) }, (_, i) => i + 1);

  const paginatedDevices = filteredDevices.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const getDefaultBroadcastParams = () => {
    const storedVoice = localStorage.getItem("toll_sys_tts_voice_name") || "xiaomei";
    let voiceDisplay = "晓梅 (xiaomei)";
    if (storedVoice === "xiaofeng") {
      voiceDisplay = "晓峰 (xiaofeng)";
    } else if (storedVoice === "xiaoyan") {
      voiceDisplay = "晓燕 (xiaoyan)";
    } else if (storedVoice === "xiaojie") {
      voiceDisplay = "晓杰 (xiaojie)";
    } else if (storedVoice === "xiaomei") {
      voiceDisplay = "晓梅 (xiaomei)";
    } else {
      if (storedVoice.includes("xiaofeng") || storedVoice.includes("晓峰")) {
        voiceDisplay = "晓峰 (xiaofeng)";
      } else if (storedVoice.includes("xiaoyan") || storedVoice.includes("晓燕")) {
        voiceDisplay = "晓燕 (xiaoyan)";
      } else if (storedVoice.includes("xiaojie") || storedVoice.includes("晓杰")) {
        voiceDisplay = "晓杰 (xiaojie)";
      } else if (storedVoice.includes("xiaomei") || storedVoice.includes("晓梅")) {
        voiceDisplay = "晓梅 (xiaomei)";
      } else {
        voiceDisplay = storedVoice;
      }
    }

    const pitch = localStorage.getItem("toll_sys_tts_pitch") || "50";
    const speed = localStorage.getItem("toll_sys_tts_speed") || "45";
    const playInterval = localStorage.getItem("toll_sys_play_interval") || "2";
    const sleepTime = localStorage.getItem("toll_sys_sleep_time") || "6";

    return {
      ttsVoice: voiceDisplay,
      ttsPitch: pitch,
      ttsSpeed: speed,
      playInterval: playInterval,
      sleepTime: sleepTime,
    };
  };

  // Open modal with cloned params for a specific device
  const handleOpenParamsModal = (dev: DeviceItem) => {
    setSelectedDeviceForParams(dev);
    const rawParams = dev.params || initialParamsForDevice(dev.id);
    const defaults = getDefaultBroadcastParams();
    
    // Merge general default setting values if custom details are disabled
    const finalParams = {
      ...rawParams,
      ...(dev.customParamsEnabled ? {} : {
        ttsVoice: defaults.ttsVoice,
        ttsPitch: defaults.ttsPitch,
        ttsSpeed: defaults.ttsSpeed,
        playInterval: defaults.playInterval,
        sleepTime: defaults.sleepTime,
      })
    };

    setEditingParams(JSON.parse(JSON.stringify(finalParams)));
    setEditingName(dev.name || "");
    setEditingStationVal(dev.station || "");
    setEditingStatusVal(dev.status || "正常");
    setCustomParamsEnabled(dev.customParamsEnabled || false);
    setIsParamsModalOpen(true);
    setShowAddTagPopover(false);
  };

  // Save parameters to devices
  const handleSaveParams = (e: React.FormEvent) => {
    if (!selectedDeviceForParams || !editingParams) return;

    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === selectedDeviceForParams.id) {
          return {
            ...dev,
            name: editingName,
            station: editingStationVal,
            status: editingStatusVal,
            params: editingParams,
            customParamsEnabled: customParamsEnabled,
          };
        }
        return dev;
      })
    );

    if (onAppendLog) {
      onAppendLog("音响管理", `修改了设备 [${selectedDeviceForParams.id}] 的扬声器配置、音响名称: [${editingName}]、业务状态: [${editingStatusVal}] 及所属收费站: [${editingStationVal}]`);
    }

    setIsParamsModalOpen(false);
    setSelectedDeviceForParams(null);
    setEditingParams(null);
    setEditingName("");
    setEditingStationVal("");
    setEditingStatusVal("正常");
  };

  const handleDeleteSpeaker = (id: string, name: string) => {
    setDeleteTargetId(id);
  };

  // Add/remove play events tags
  const handleRemoveEventTag = (idx: number) => {
    if (!editingParams) return;
    const currentEvents = editingParams.playEventTypes || [];
    const updatedEvents = currentEvents.filter((_, i) => i !== idx);
    setEditingParams({
      ...editingParams,
      playEventTypes: updatedEvents,
    });
  };

  const handleAddEventTag = (tag: string) => {
    if (!editingParams) return;
    const currentEvents = editingParams.playEventTypes || [];
    if (currentEvents.includes(tag)) {
      setShowAddTagPopover(false);
      return;
    }
    const updatedEvents = [...currentEvents, tag];
    setEditingParams({
      ...editingParams,
      playEventTypes: updatedEvents,
    });
    setShowAddTagPopover(false);
  };

  return (
    <div className="flex-1 p-0 flex flex-col relative text-[13px] font-sans antialiased text-gray-800">
      
      {/* 1. Header Title */}
      <div className="pb-3 mb-5 border-b border-gray-150 flex items-center justify-between" id="speaker-view-title-bar">
        <div className="text-[13px] text-gray-400 select-none flex items-center gap-1.5">
          <span>设备管理</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium font-sans">音响管理</span>
        </div>
      </div>



      {/* 3. Search Filters for Speaker */}
      <div className="bg-white p-5 rounded border border-gray-200 mb-6" id="speaker-filter-card">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          
          {/* Station selector */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">所属收费站</span>
            <div className="relative w-40">
              <button
                type="button"
                onClick={() => {
                  setOpenStationDrop(!openStationDrop);
                  setOpenStatusDrop(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
              >
                <span className="truncate">{searchStation}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {openStationDrop && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-48 overflow-y-auto">
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
                      <span>{st}</span>
                      {searchStation === st && <Check className="w-3 h-3 text-blue-550 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Device Status selector */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">音响状态</span>
            <div className="relative w-28">
              <button
                type="button"
                onClick={() => {
                  setOpenStatusDrop(!openStatusDrop);
                  setOpenStationDrop(false);
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
              >
                <span>{searchStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {openStatusDrop && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30">
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

          {/* Speaker Name search */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium whitespace-nowrap">音响名称</span>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="请输入名称"
              className="w-36 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 h-8 font-sans"
            />
          </div>

          {/* Action buttons */}
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
              type="button"
              onClick={() => setIsAddSpeakerModalOpen(true)}
              className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. Table Grid representing Speaker Params */}
      <div className="bg-white rounded border border-gray-200 p-0 overflow-visible relative mb-6" id="speaker-table-card">
        <div className="overflow-x-auto relative">
          <table className="w-full text-center text-xs border-collapse relative">
            <thead>
              <tr className="bg-[#f5f5f5] text-gray-700 font-semibold border-b border-gray-200">
                <th className="py-3 px-4 border-r border-gray-200 font-semibold w-20 text-gray-600 text-center">序号</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600 w-36 text-center">音响名称</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600 w-32 text-center">所属收费站</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600 w-44 text-center">IP地址</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600 text-center">关联摄像头</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600 w-32 text-center">设备状态</th>
                <th className="py-3 px-4 font-semibold text-gray-600 w-32 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200 bg-white">
              {paginatedDevices.map((dev, index) => {
                const rawParams = dev.params || initialParamsForDevice(dev.id);
                let params: SpeakerParamsGroup;
                if (rawParams && typeof rawParams === "object" && "front" in rawParams) {
                  const front = (rawParams as any).front;
                  params = {
                    ip: front?.ip || "192.168.1.108",
                    ttsVoice: front?.ttsVoice || "晓峰 (xiaofeng)",
                    volume: typeof front?.volume === 'number' ? front.volume : 80,
                    ttsPitch: front?.ttsPitch || "50",
                    ttsSpeed: front?.ttsSpeed || "50",
                    playInterval: front?.playInterval || "1",
                    sleepTime: front?.sleepTime || "4",
                    playEventTypes: Array.isArray(front?.playEventTypes) ? front?.playEventTypes : ["行人"]
                  };
                } else {
                  params = {
                    ip: rawParams?.ip || "192.168.1.108",
                    ttsVoice: rawParams?.ttsVoice || "晓峰 (xiaofeng)",
                    volume: typeof rawParams?.volume === 'number' ? rawParams.volume : 80,
                    ttsPitch: rawParams?.ttsPitch || "50",
                    ttsSpeed: rawParams?.ttsSpeed || "50",
                    playInterval: rawParams?.playInterval || "1",
                    sleepTime: rawParams?.sleepTime || "4",
                    playEventTypes: Array.isArray(rawParams?.playEventTypes) ? rawParams.playEventTypes : ["行人"]
                  };
                }
                const isOnline = dev.status === "正常";
                const serialNum = (activePage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={dev.id} className="hover:bg-gray-50 transition duration-150 relative">
                    {/* Row Serial Number */}
                    <td className="py-4 px-4 border-r border-gray-200 font-sans font-medium text-gray-800 text-center">
                      {serialNum}
                    </td>

                    {/* Speaker name */}
                    <td className="py-4 px-4 border-r border-gray-200 font-sans text-gray-800 text-center font-medium">
                      {dev.name || `音响设备 (${dev.id})`}
                    </td>

                    {/* Belonging Toll Station */}
                    <td className="py-4 px-4 border-r border-gray-200 font-sans text-gray-800 text-center font-medium text-blue-650">
                      {dev.station || "未分配"}
                    </td>

                    {/* IP Address */}
                    <td className="py-4 px-4 border-r border-gray-200 font-mono text-gray-700 text-center select-all">
                      {params.ip}
                    </td>

                    {/* Associated Camera name */}
                    <td className="py-4 px-4 border-r border-gray-200 text-center font-sans text-gray-800 font-medium select-none">
                      {dev.associatedCameraName || ""}
                    </td>

                    {/* Connection Status badge */}
                    <td className="py-4 px-4 border-r border-gray-200 text-center">
                      {isOnline ? (
                        <span className="text-emerald-600 font-medium font-sans">
                          在线
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium font-sans">
                          离线
                        </span>
                      )}
                    </td>

                    {/* Operations parameter config button */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenParamsModal(dev)}
                          className="text-[#1890ff] hover:text-blue-700 font-semibold font-sans hover:underline cursor-pointer transition"
                          title="点击配置该音响的工作及语音参数"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSpeaker(dev.id, dev.name)}
                          className="text-red-500 hover:text-red-700 font-medium font-sans hover:underline cursor-pointer transition"
                          title="删除注销此音响设备"
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
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    没有搜索到对应的车道扬声器/音响设备。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pagination */}
      <div className="flex justify-end items-center mt-2.5 mb-14" id="speaker-pagination">
        <div className="flex items-center space-x-1.5 text-xs text-gray-700 select-none">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

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

      {/* -------------------- 6. CONSOLIDATED SINGLE COLUMN PARAMETERS MODAL -------------------- */}
      {isParamsModalOpen && editingParams && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-[110] select-none p-4 animate-fadeIn">
          <form 
            onSubmit={handleSaveParams}
            className="bg-white border border-gray-150 rounded-[4px] w-full max-w-[500px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-white">
              <span className="font-semibold text-gray-800 text-[15px] select-none">
                编辑音响参数 ({selectedDeviceForParams?.id})
              </span>
              <button 
                type="button"
                onClick={() => setIsParamsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-650 transition cursor-pointer p-1 rounded-full hover:bg-gray-50 animate-fadeIn"
                title="关闭"
              >
                <X className="w-5 h-5 font-light" />
              </button>
            </div>

            {/* Scrollable Container (Consolidated single list) */}
            <div className="p-6 text-[12.5px] text-gray-700 bg-white max-h-[70vh] overflow-y-auto space-y-4">
              
              {/* Speaker Name Input */}
              <div className="space-y-1 text-left">
                <label className="text-gray-500 font-medium text-[11px] select-none">音响名称</label>
                <input
                  type="text"
                  required
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-[#f7f8f9] text-gray-800 font-sans font-medium"
                />
                <span className="block text-[11px] text-gray-400 select-none">输入设备在当前收费站区域的直观友好名称。</span>
              </div>

              {/* Station Selection */}
              <div className="space-y-1 text-left">
                <label className="text-gray-500 font-medium text-[11px] select-none">所属收费站</label>
                <div className="relative">
                  <select
                    value={editingStationVal}
                    onChange={(e) => setEditingStationVal(e.target.value)}
                    className="w-full appearance-none border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 cursor-pointer pr-7 hover:border-gray-300 transition duration-150 animate-fadeIn"
                  >
                    {availableStations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="block text-[11px] text-gray-400 select-none">指定此音响所属的官方站区，关联收费站后此所属站内对应的摄像头可选择关联并进行联动广播。</span>
              </div>

              {/* IP Input */}
              <div className="space-y-1 text-left">
                <label className="text-gray-500 font-medium text-[11px] select-none">IP地址</label>
                <input
                  type="text"
                  required
                  value={editingParams.ip}
                  onChange={(e) => setEditingParams({
                    ...editingParams,
                    ip: e.target.value
                  })}
                  className="w-full border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-[#f7f8f9] text-gray-800 font-sans"
                />
                <span className="block text-[11px] text-gray-400 select-none">音响在站区网络中的固定IP，需与实际组网地址一致。</span>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between text-[11px] select-none">
                  <span className="text-gray-500 font-medium">播报音量</span>
                  <span className="text-[#1890ff] font-bold text-[11.5px]">{editingParams.volume}%</span>
                </div>
                <div className="flex items-center w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingParams.volume}
                    onChange={(e) => setEditingParams({
                      ...editingParams,
                      volume: parseInt(e.target.value, 10)
                    })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1890ff] focus:outline-none py-1"
                  />
                </div>
                <span className="block text-[11px] text-gray-400 select-none">扬声器的物理音量大小，最高设定为 100%。</span>
              </div>

              {/* Detailed Broadcast Settings Section */}
              <div className="border-t border-gray-100 pt-4 mt-6 space-y-1">
                <div className="flex items-center justify-between pr-0.5">
                  <span className="font-sans font-semibold text-gray-800 text-[12.5px] select-none">详细播报参数设置</span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !customParamsEnabled;
                      setCustomParamsEnabled(nextVal);
                      if (nextVal) {
                        const defaults = getDefaultBroadcastParams();
                        if (editingParams) {
                          setEditingParams({
                            ...editingParams,
                            ttsVoice: defaults.ttsVoice,
                            ttsPitch: defaults.ttsPitch,
                            ttsSpeed: defaults.ttsSpeed,
                            playInterval: defaults.playInterval,
                            sleepTime: defaults.sleepTime,
                          });
                        }
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      customParamsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        customParamsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {!customParamsEnabled ? (
                  <span className="block text-[11px] text-gray-400 select-none pb-1">当前正在使用默认播报设置</span>
                ) : (
                  /* Custom config cards box shown in image 2 */
                  <div className="border border-gray-200 rounded-xl p-4.5 space-y-4 bg-white shadow-xs text-left mt-2.5">
                    {/* TTS Voice Name Selection */}
                    <div className="space-y-1 text-left">
                      <label className="text-gray-700 font-medium text-[12px] select-none">TTS 语音名称</label>
                      <div className="relative">
                        <select
                          value={editingParams?.ttsVoice || "晓梅 (xiaomei)"}
                          onChange={(e) => editingParams && setEditingParams({
                            ...editingParams,
                            ttsVoice: e.target.value
                          })}
                          className="w-full appearance-none border border-gray-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 bg-[#f7f8f9] text-gray-800 cursor-pointer pr-10 hover:border-gray-300 transition duration-150 font-medium"
                        >
                          <option value="晓梅 (xiaomei)">晓梅 (xiaomei)</option>
                          <option value="晓峰 (xiaofeng)">晓峰 (xiaofeng)</option>
                          <option value="晓燕 (xiaoyan)">晓燕 (xiaoyan)</option>
                          <option value="晓杰 (xiaojie)">晓杰 (xiaojie)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="block text-[11px] text-gray-400 leading-normal select-none">语音合成特征，可选选择不同性别的播报角色音色。</span>
                    </div>

                    {/* Split Pitch and Speed Inputs */}
                    <div className="grid grid-cols-2 border border-gray-200 rounded-xl divide-x divide-gray-150 overflow-hidden bg-white/10">
                      {/* TTS Pitch column */}
                      <div className="p-3.5 space-y-1 text-left">
                        <label className="text-gray-700 font-medium text-[11px] select-none block">TTS 音调</label>
                        <input
                          type="text"
                          value={editingParams?.ttsPitch || "50"}
                          onChange={(e) => editingParams && setEditingParams({
                            ...editingParams,
                            ttsPitch: e.target.value
                          })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-[#f7f8f9] text-gray-800 font-medium font-sans"
                        />
                        <span className="block text-[10.5px] text-gray-400 leading-snug select-none">声调高低，默认值为 50。</span>
                      </div>

                      {/* TTS Speed column */}
                      <div className="p-3.5 space-y-1 text-left">
                        <label className="text-gray-700 font-medium text-[11px] select-none block">TTS 语速</label>
                        <input
                          type="text"
                          value={editingParams?.ttsSpeed || "50"}
                          onChange={(e) => editingParams && setEditingParams({
                            ...editingParams,
                            ttsSpeed: e.target.value
                          })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-[#f7f8f9] text-gray-800 font-medium font-sans"
                        />
                        <span className="block text-[10.5px] text-gray-400 leading-snug select-none">发音快慢，默认值为 50。</span>
                      </div>
                    </div>

                    {/* 播放间隔 */}
                    <div className="flex items-center justify-between border-t border-gray-105 pt-4 text-left">
                      <div className="flex-1 space-y-0.5">
                        <span className="text-gray-700 font-medium text-[12px] block">播放间隔</span>
                        <span className="block text-[11px] text-gray-400 leading-normal select-none">相同类型事件连续触发的防刷语冷却时间。</span>
                      </div>
                      <div className="flex items-center gap-2 select-none shrink-0 ml-4 pb-[2px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingParams) return;
                            const val = Math.max(1, parseInt(editingParams.playInterval || "1", 10) - 1);
                            setEditingParams({ ...editingParams, playInterval: String(val) });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#f1f3f5] hover:bg-[#e9ecef] text-gray-600 font-bold transition text-xs shrink-0 select-none cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-gray-800 w-12 text-center font-sans tracking-tight">
                          {editingParams?.playInterval || "2"} 秒
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingParams) return;
                            const val = parseInt(editingParams.playInterval || "1", 10) + 1;
                            setEditingParams({ ...editingParams, playInterval: String(val) });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#f1f3f5] hover:bg-[#e9ecef] text-gray-600 font-bold transition text-xs shrink-0 select-none cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 调用播放接口后的等待秒数 */}
                    <div className="flex items-center justify-between border-t border-gray-105 pt-4 text-left">
                      <div className="flex-1 space-y-0.5">
                        <span className="text-gray-700 font-medium text-[12px] block">调用播放接口后的等待秒数</span>
                        <span className="block text-[11px] text-gray-400 leading-normal select-none">语音播报调用播放接口后的等待延迟时间（数字人/音响底层交互组件）。</span>
                      </div>
                      <div className="flex items-center gap-2 select-none shrink-0 ml-4 pb-[2px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingParams) return;
                            const val = Math.max(1, parseInt(editingParams.sleepTime || "1", 10) - 1);
                            setEditingParams({ ...editingParams, sleepTime: String(val) });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#f1f3f5] hover:bg-[#e9ecef] text-gray-600 font-bold transition text-xs shrink-0 select-none cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-gray-800 w-12 text-center font-sans tracking-tight">
                          {editingParams?.sleepTime || "6"} 秒
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingParams) return;
                            const val = parseInt(editingParams.sleepTime || "1", 10) + 1;
                            setEditingParams({ ...editingParams, sleepTime: String(val) });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#f1f3f5] hover:bg-[#e9ecef] text-gray-600 font-bold transition text-xs shrink-0 select-none cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Status Selection */}
              <div className="space-y-1 text-left">
                <label className="text-gray-500 font-medium text-[11px] select-none font-sans">状态</label>
                <div className="flex items-center gap-6 text-xs select-none py-1.5">
                  {/* Enable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="editingStatus" 
                      checked={editingStatusVal === "正常"} 
                      onChange={() => setEditingStatusVal("正常")}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                      editingStatusVal === "正常" 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {editingStatusVal === "正常" && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-[13px] text-gray-700 font-sans">启用</span>
                  </label>
                  
                  {/* Disable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="editingStatus" 
                      checked={editingStatusVal === "离线"} 
                      onChange={() => setEditingStatusVal("离线")}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                      editingStatusVal === "离线" 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {editingStatusVal === "离线" && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-[13px] text-gray-700 font-sans">禁用</span>
                  </label>
                </div>
                <span className="block text-[11px] text-gray-400 select-none">指定此音响的运行状态。</span>
              </div>



            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 select-none bg-[#fcfcfc]">
              <button
                type="button"
                onClick={() => setIsParamsModalOpen(false)}
                className="px-4.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white rounded-[2px] text-[13px] transition font-normal cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4.5 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white border border-[#1890ff] rounded-[2px] text-[13px] transition font-normal cursor-pointer"
              >
                保存配置
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Add Speaker Modal */}
      {isAddSpeakerModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-[110] select-none p-4">
          <form 
            onSubmit={handleAddNewSpeaker}
            className="bg-white border border-gray-150 rounded-[4px] w-full max-w-[500px] shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-white">
              <span className="font-semibold text-gray-800 text-[15px] select-none">
                新增音响设备
              </span>
              <button 
                type="button"
                onClick={() => setIsAddSpeakerModalOpen(false)} 
                className="text-gray-400 hover:text-gray-650 transition cursor-pointer p-1 rounded-full hover:bg-gray-50"
              >
                <X className="w-5 h-5 font-light" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="p-6 text-[12.5px] text-gray-700 bg-white max-h-[70vh] overflow-y-auto space-y-4">
              
              {/* Row 1: Speaker ID & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-gray-500 font-medium text-[11px] select-none">设备编号 *</label>
                  <input
                    type="text"
                    required
                    value={newSpkId}
                    onChange={(e) => setNewSpkId(e.target.value)}
                    placeholder="例如: yongchuan26"
                    className="w-full border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 font-sans"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-gray-500 font-medium text-[11px] select-none">音响名称 *</label>
                  <input
                    type="text"
                    required
                    value={newSpkName}
                    onChange={(e) => setNewSpkName(e.target.value)}
                    placeholder="例如: 永川西3号音响"
                    className="w-full border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 font-sans font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Station & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-gray-500 font-medium text-[11px] select-none">所属收费站</label>
                  <div className="relative">
                    <select
                      value={newSpkStation}
                      onChange={(e) => setNewSpkStation(e.target.value)}
                      className="w-full appearance-none border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 cursor-pointer pr-7 hover:border-gray-300 transition duration-150 animate-fadeIn"
                    >
                      {availableStations.map(station => (
                        <option key={station} value={station}>{station}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-gray-500 font-medium text-[11px] select-none font-sans">状态</label>
                  <div className="relative">
                    <select
                      value={newSpkStatus}
                      onChange={(e) => setNewSpkStatus(e.target.value as any)}
                      className="w-full appearance-none border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 cursor-pointer pr-7 hover:border-gray-300 transition duration-150 animate-fadeIn"
                    >
                      <option value="正常">启用</option>
                      <option value="离线">禁用</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: IP Address */}
              <div className="space-y-1 text-left">
                <label className="text-gray-500 font-medium text-[11px] select-none">IP地址 *</label>
                <input
                  type="text"
                  required
                  value={newSpkIp}
                  onChange={(e) => setNewSpkIp(e.target.value)}
                  placeholder="192.168.1.120"
                  className="w-full border border-gray-250 rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-800 font-sans"
                />
              </div>

              {/* Row 4: Volume Input */}
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between text-[11px] select-none">
                  <span className="text-gray-500 font-medium">播报音量</span>
                  <span className="text-[#1890ff] font-bold text-[11.5px]">{newSpkVolume}%</span>
                </div>
                <div className="flex items-center w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSpkVolume}
                    onChange={(e) => setNewSpkVolume(Number(e.target.value))}
                    className="flex-1 accent-[#1890ff] h-1 bg-gray-250 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 select-none bg-[#fcfcfc]">
              <button
                type="button"
                onClick={() => setIsAddSpeakerModalOpen(false)}
                className="px-4.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white rounded-[2px] text-[13px] transition font-normal cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4.5 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white border border-[#1890ff] rounded-[2px] text-[13px] transition font-semibold cursor-pointer"
              >
                新增音响
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTargetId !== null && (() => {
        const target = devices.find(dev => dev.id === deleteTargetId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[999] animate-fadeIn">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800 text-[13px]">
              <h3 className="text-sm font-bold text-gray-800 mb-3 block">确认移除音响设备</h3>
              <p className="text-gray-500 mb-5 leading-normal">
                确定要移除音响设备 <strong className="text-gray-800">【{target.name}】</strong> (设备ID: <span className="font-mono">{target.id}</span>) 吗？
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
                    setDevices(prev => prev.filter(dev => dev.id !== deleteTargetId));
                    if (onAppendLog) {
                      onAppendLog("音响管理", `【音响管理】移除了音响设备: [${target.name}] (设备ID: ${target.id})`);
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
