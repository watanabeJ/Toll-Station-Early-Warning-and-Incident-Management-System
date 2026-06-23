import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Calendar, Search, RotateCcw, Plus, X, ChevronLeft, ChevronRight, Bell, Heart, ShieldAlert, Wifi, Battery, Smartphone } from "lucide-react";
import { TollStation } from "../types";

export interface WatchItem {
  id: string;             // 手表UUID
  station: string;        // 所属收费站
  wearer: string;         // 佩戴人员
  roleName: string;       // 岗位角色
  status: "正常" | "离线";  // 手表状态
  battery: number;        // 电量百分比
  pushEnabled: boolean;   // 报警推送开关
  bindTime: string;       // 绑定时间
  lastHeartbeat: string;  // 最后心跳时间
}

export interface SosLogItem {
  id: string;
  wearer: string;
  station: string;
  time: string;
  location: string;
  status: "待处理" | "已协助";
}

interface WatchManagementViewProps {
  showAnnotations?: boolean;
  onAppendLog?: (module: string, action: string) => void;
  stations?: TollStation[];
  allowedStations?: string[];
}

const STATION_STAFF_MAP: Record<string, { name: string; role: string }[]> = {
  "永川西收费站": [
    { name: "王珊", role: "超级管理员" },
    { name: "李敏", role: "值班站长" },
    { name: "吴超", role: "前台收费员" },
    { name: "周杰", role: "前台收费员" },
  ],
  "永川南收费站": [
    { name: "张伟", role: "前台收费员" },
    { name: "赵磊", role: "值班站长" },
    { name: "孙涛", role: "前台收费员" },
  ],
  "永川东收费站": [
    { name: "刘洋", role: "值班站长" },
    { name: "徐静", role: "值班站长" },
  ],
  "荣昌东收费站": [
    { name: "陈洁", role: "前台收费员" },
    { name: "黄婷", role: "前台收费员" },
    { name: "朱红", role: "前台收费员" },
  ],
};

export default function WatchManagementView({
  showAnnotations = true,
  onAppendLog,
  stations = [],
  allowedStations = [],
}: WatchManagementViewProps) {
  const STORAGE_KEY = "highway_watches_list_db";
  const SOS_STORAGE_KEY = "highway_watches_sos_db";

  // Pre-seeded watch list
  const initialWatches: WatchItem[] = [
    {
      id: "W_YCW_001",
      station: "永川西收费站",
      wearer: "李敏",
      roleName: "值班站长",
      status: "正常",
      battery: 92,
      pushEnabled: true,
      bindTime: "2024/02/15 08:30:00",
      lastHeartbeat: "2024/02/26 17:23:10",
    },
    {
      id: "W_YCW_002",
      station: "永川西收费站",
      wearer: "吴超",
      roleName: "前台收费员",
      status: "正常",
      battery: 18, // low battery for indicator testing
      pushEnabled: true,
      bindTime: "2024/02/15 09:15:24",
      lastHeartbeat: "2024/02/26 17:22:45",
    },
    {
      id: "W_YCN_001",
      station: "永川南收费站",
      wearer: "张伟",
      roleName: "前台收费员",
      status: "离线",
      battery: 0,
      pushEnabled: false,
      bindTime: "2024/02/18 14:00:12",
      lastHeartbeat: "2024/02/25 18:40:11",
    }
  ];

  const initialSosLogs: SosLogItem[] = [
    {
      id: "sos_1",
      wearer: "吴超",
      station: "永川西收费站",
      time: "2024/02/26 16:15:00",
      location: "ETC车道02号车道",
      status: "已协助",
    },
    {
      id: "sos_2",
      wearer: "李敏",
      station: "永川西收费站",
      time: "2024/02/26 17:05:12",
      location: "入口混合01车道",
      status: "已协助",
    }
  ];

  const [watches, setWatches] = useState<WatchItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let list = initialWatches;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (e) {}
    }
    // Now, synchronize roleName with actual accounts to prevent "应急协助员" from popping up
    const savedAcc = localStorage.getItem("sub_accounts_db");
    if (savedAcc) {
      try {
        const accounts = JSON.parse(savedAcc);
        if (Array.isArray(accounts)) {
          list = list.map(w => {
            const match = accounts.find((acc: any) => acc.contact === w.wearer || acc.username === w.wearer);
            if (match) {
              return {
                ...w,
                roleName: match.role || "值班站长"
              };
            }
            if (w.roleName === "应急协助员" || w.roleName === "收费班长" || w.roleName === "路巡维护员") {
              return { ...w, roleName: "值班站长" };
            }
            return w;
          });
        }
      } catch (e) {}
    }
    return list;
  });

  const [sosLogs, setSosLogs] = useState<SosLogItem[]>(() => {
    const saved = localStorage.getItem(SOS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialSosLogs;
  });

  // Save database states
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
  }, [watches]);

  useEffect(() => {
    localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(sosLogs));
  }, [sosLogs]);

  // Search/Filters states
  const [searchStation, setSearchStation] = useState("全部");
  const [searchStatus, setSearchStatus] = useState("全部");
  const [searchWearer, setSearchWearer] = useState("");

  const [openStationDrop, setOpenStationDrop] = useState(false);
  const [openStatusDrop, setOpenStatusDrop] = useState(false);

  // Pagination page state
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New Watch modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWatch, setEditingWatch] = useState<WatchItem | null>(null);
  const [formStation, setFormStation] = useState("");
  const [formWatchId, setFormWatchId] = useState("");
  const [formWearer, setFormWearer] = useState("");
  const [formRole, setFormRole] = useState("值班站长");
  const [formPushEnabled, setFormPushEnabled] = useState(true);
  const [formBattery, setFormBattery] = useState(100);
  const [formStatus, setFormStatus] = useState<"正常" | "离线">("正常");

  const [openFormStationDrop, setOpenFormStationDrop] = useState(false);

  const handleEditClick = (w: WatchItem) => {
    setEditingWatch(w);
    setFormStation(w.station);
    setFormWatchId(w.id);
    setFormWearer(w.wearer);
    setFormRole(w.roleName);
    setFormPushEnabled(w.pushEnabled);
    setFormBattery(w.battery);
    setFormStatus(w.status);
    setShowAddModal(true);
  };

  // State for dynamic roles loaded from Account / Permission Management
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

  // Synchronize staff list into sub_accounts_db on mount to ensure closed data loop (数据闭环)
  useEffect(() => {
    const savedAcc = localStorage.getItem("sub_accounts_db");
    let currentAccounts: any[] = [];
    if (savedAcc) {
      try {
        currentAccounts = JSON.parse(savedAcc);
      } catch (e) {}
    }

    const savedRoles = localStorage.getItem("toll_sys_roles");
    let activeRoles: any[] = [];
    if (savedRoles) {
      try {
        activeRoles = JSON.parse(savedRoles);
      } catch (e) {}
    }
    const activeRoleNames = activeRoles.map((r: any) => r.name);
    if (activeRoleNames.length === 0) {
      activeRoleNames.push("超级管理员", "值班站长", "前台收费员");
    }

    const usernameMap: Record<string, string> = {
      "王珊": "wangshan",
      "李敏": "limin",
      "吴超": "wuchao",
      "周杰": "zhoujie",
      "张伟": "zhangwei",
      "赵磊": "zhaolei",
      "孙涛": "suntao",
      "刘洋": "liuyang",
      "徐静": "xujing",
      "陈洁": "chenjie",
      "黄婷": "huangting",
      "朱红": "zhuhong",
    };

    const getTargetRoleName = (wearerRole: string): string => {
      if (activeRoleNames.includes(wearerRole)) {
        return wearerRole;
      }
      if (activeRoleNames.includes("值班站长")) return "值班站长";
      if (activeRoleNames.includes("前台收费员")) return "前台收费员";
      return activeRoleNames[0] || "超级管理员";
    };

    let changed = false;

    // Collect all unique people from STATION_STAFF_MAP and watches
    const allCandidates: { name: string; role: string; station: string }[] = [];
    
    // Add watches wearers
    watches.forEach(w => {
      if (!allCandidates.some(c => c.name === w.wearer)) {
        allCandidates.push({ name: w.wearer, role: w.roleName, station: w.station });
      }
    });

    // Add STATION_STAFF_MAP entries
    Object.entries(STATION_STAFF_MAP).forEach(([stName, staffList]) => {
      staffList.forEach(item => {
        if (!allCandidates.some(c => c.name === item.name)) {
          allCandidates.push({ name: item.name, role: item.role, station: stName });
        }
      });
    });

    allCandidates.forEach(cand => {
      // Find matches in existing accounts by contact name or username
      const match = currentAccounts.find(acc => acc.contact === cand.name || acc.username === cand.name);
      const targetRole = getTargetRoleName(cand.role);
      if (!match) {
        // Generate credentials to ensure closed loop
        const userPin = usernameMap[cand.name] || `user_${Math.random().toString(36).substring(2, 7)}`;
        const phonePrefix = ["136", "139", "137", "188", "150"][Math.floor(Math.random() * 5)];
        const phoneSuf = Math.floor(10000000 + Math.random() * 90000000);
        const mockPhone = `${phonePrefix}${phoneSuf}`;

        const newAccountItem = {
          id: "acc_sync_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
          username: userPin,
          contact: cand.name,
          phone: mockPhone,
          role: targetRole,
          station: cand.station,
          enabled: true,
        };
        currentAccounts.push(newAccountItem);
        changed = true;
      } else {
        // Ensure its role is in the active list (data closed loop with permissions roles)
        if (!activeRoleNames.includes(match.role)) {
          match.role = targetRole;
          changed = true;
        }

        // Ensure its station contains this candidate's station
        const stationsList = match.station
          ? match.station.split(/、|,|，\s*/).map((s: string) => s.trim())
          : [];
        if (!stationsList.includes(cand.station)) {
          stationsList.push(cand.station);
          match.station = stationsList.join("、");
          changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem("sub_accounts_db", JSON.stringify(currentAccounts));
    }
  }, [watches]);

  // Load actual personnel belonging to the selected station from sub_accounts_db
  const getStaffListByStation = (stationName: string): { name: string; role: string }[] => {
    const savedAcc = localStorage.getItem("sub_accounts_db");
    let accountItems: any[] = [];
    if (savedAcc) {
      try {
        accountItems = JSON.parse(savedAcc);
      } catch (e) {}
    }

    const filteredAccounts = accountItems.filter(acc => {
      if (!acc.station) return false;
      const stationsList = acc.station.split(/、|,|，\s*/).map((s: string) => s.trim());
      return stationsList.includes(stationName);
    });

    const systemToDeviceRole = (sysRole: string): string => {
      return sysRole || "值班站长";
    };

    if (filteredAccounts.length > 0) {
      return filteredAccounts.map(acc => ({
        name: acc.contact || acc.username,
        role: systemToDeviceRole(acc.role)
      }));
    }

    return STATION_STAFF_MAP[stationName] || [
      { name: `${stationName}站长`, role: "值班站长" },
      { name: `${stationName}收费员`, role: "前台收费员" }
    ];
  };

  const handleStationChange = (st: string) => {
    setFormStation(st);
    const list = getStaffListByStation(st);
    if (list.length > 0) {
      setFormWearer(list[0].name);
      setFormRole(list[0].role);
    } else {
      setFormWearer("");
      setFormRole("值班站长");
    }
  };

  // Get active stations list from props, fallback to normal default list
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
        } catch (e) {}
      }
      if (result.length === 0) {
        result = ["永川西收费站", "永川南收费站", "永川东收费站", "荣昌东收费站"];
      }
    }
    if (allowedStations && allowedStations.length > 0) {
      result = result.filter(name => allowedStations.includes(name));
    }
    return result;
  };

  const availableStations = getStationsList();

  const currentStaffList = getStaffListByStation(formStation || "永川西收费站");

  const handleSearch = () => {
    setCurrentPage(1);
    if (onAppendLog) {
      onAppendLog("智能手表管理", `触发条件搜索: [收费站:${searchStation}]、[状态:${searchStatus}]、[佩戴人员/ID:${searchWearer || "全部"}]`);
    }
  };

  const handleResetFilters = () => {
    setSearchStation("全部");
    setSearchStatus("全部");
    setSearchWearer("");
    setCurrentPage(1);
    if (onAppendLog) {
      onAppendLog("智能手表管理", "重置智能手表查询条件");
    }
  };

  // Filter watches list
  const filteredWatches = watches.filter((w) => {
    if (allowedStations && allowedStations.length > 0 && !allowedStations.includes(w.station)) {
      return false;
    }
    if (searchStation !== "全部" && w.station !== searchStation) {
      return false;
    }
    if (searchStatus !== "全部" && w.status !== searchStatus) {
      return false;
    }
    if (searchWearer.trim()) {
      const keyword = searchWearer.trim().toLowerCase();
      const matchWearer = w.wearer.toLowerCase().includes(keyword);
      const matchId = w.id.toLowerCase().includes(keyword);
      if (!matchWearer && !matchId) return false;
    }
    return true;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredWatches.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  
  const paginatedWatches = filteredWatches.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const displayPages = Array.from({ length: Math.max(totalPages, 5) }, (_, i) => i + 1);

  // Toggle push alert state
  const handleTogglePush = (id: string, currentVal: boolean) => {
    const updatedVal = !currentVal;
    setWatches((prev) =>
      prev.map((w) => (w.id === id ? { ...w, pushEnabled: updatedVal } : w))
    );
    if (onAppendLog) {
      const target = watches.find(w => w.id === id);
      onAppendLog("智能手表管理", `修改 [${target?.wearer || "未知"}] 手表特情报警接收状态为 [${updatedVal ? "接收" : "屏蔽"}]`);
    }
  };

  // Send a vibration pulse command
  const handleTestCall = (w: WatchItem) => {
    if (onAppendLog) {
      onAppendLog("智能手表管理", `呼叫自检手表并发送测试震动信号: [${w.wearer}] (设备ID: ${w.id})`);
    }
    alert(`发出呼叫检测成功！\n已对 ${w.wearer} 的智能手表触发 “高频震动/弹窗测试” 握手。系统反馈链路包时延：12ms，运行状况极佳。`);
  };

  // Add Watch submit handler
  const handleAddWatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStation) {
      alert("请选择所属收费站");
      return;
    }
    if (!formWatchId.trim()) {
      alert("请输入手表设备ID");
      return;
    }
    if (!formWearer.trim()) {
      alert("请输入佩戴人姓名");
      return;
    }

    const cleanedId = formWatchId.trim().toUpperCase();

    // ID uniqueness constraint
    if (watches.some(w => w.id.toLowerCase() === cleanedId.toLowerCase() && (!editingWatch || w.id !== editingWatch.id))) {
      alert("设备ID编号已存在！设备编码需全球唯一，请重新键入。");
      return;
    }

    if (editingWatch) {
      setWatches(prev => prev.map(w => w.id === editingWatch.id ? {
        ...w,
        id: cleanedId,
        station: formStation,
        wearer: formWearer.trim(),
        roleName: formRole,
        pushEnabled: formPushEnabled,
        status: formStatus,
      } : w));

      if (onAppendLog) {
        onAppendLog("智能手表管理", `更新智能手表 [收费站: ${formStation}] [佩戴人: ${formWearer.trim()}] [角色: ${formRole}] [原ID: ${editingWatch.id}] [新ID: ${cleanedId}] [状态: ${formStatus}]`);
      }

      // Reset Form
      setFormStation("");
      setFormWatchId("");
      setFormWearer("");
      setFormPushEnabled(true);
      setFormBattery(100);
      setFormStatus("正常");
      setEditingWatch(null);
      setShowAddModal(false);
      alert("智能手表信息更新成功！");
    } else {
      const now = new Date();
      const formattedTime = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const newWatch: WatchItem = {
        id: cleanedId,
        station: formStation,
        wearer: formWearer.trim(),
        roleName: formRole,
        status: formStatus,
        battery: formBattery,
        pushEnabled: formPushEnabled,
        bindTime: formattedTime,
        lastHeartbeat: formattedTime,
      };

      setWatches(prev => [newWatch, ...prev]);

      if (onAppendLog) {
        onAppendLog("智能手表管理", `绑定新智能手表 [收费站: ${formStation}] [佩戴人: ${formWearer.trim()}] [角色: ${formRole}] [ID: ${cleanedId}] [状态: ${formStatus}]`);
      }

      // Reset Form
      setFormStation("");
      setFormWatchId("");
      setFormWearer("");
      setFormPushEnabled(true);
      setFormBattery(100);
      setFormStatus("正常");
      setShowAddModal(false);
      alert("智能手表绑定并激活成功！已纳入现场协助派单网络中。");
    }
  };

  // Delete/Unbind watch
  const handleUnbindWatch = (id: string) => {
    setDeleteTargetId(id);
  };

  // Simulate throwing an SOS alarm to live log (for interactivity)
  const triggerSimulatedSos = (w: WatchItem) => {
    const sosId = "sim_sos_" + Date.now();
    const now = new Date();
    const formattedTime = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    const locations = ["ETC车道01号车道", "超宽混合大货车道", "收费所大厅西侧", "亭外车道岗亭前部", "车道应急人行道"];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];

    const newSos: SosLogItem = {
      id: sosId,
      wearer: w.wearer,
      station: w.station,
      time: formattedTime,
      location: randomLoc,
      status: "待处理",
    };

    setSosLogs(prev => [newSos, ...prev]);

    if (onAppendLog) {
      onAppendLog("智能手表管理", `设备端触发一键求助(SOS) [佩戴人: ${w.wearer}] [位置: ${randomLoc}]`);
    }
    alert(`【紧急求助通知】\n已成功触发 ${w.wearer} 的手表一键SOS仿真指令！请留意底部一键求助历史记录状态，该求助已同步上报大盘。`);
  };

  // Batch process all SOS to processed state
  const handleResolveSos = (id: string) => {
    setSosLogs(prev => prev.map(log => log.id === id ? { ...log, status: "已协助" } : log));
    const target = sosLogs.find(l => l.id === id);
    if (onAppendLog && target) {
      onAppendLog("智能手表管理", `处理闭环一键求助: [${target.wearer}] 报告求助已就地协助并解除`);
    }
  };

  return (
    <div className="flex-1 p-0 flex flex-col relative text-[13px] font-sans antialiased text-gray-800">
      
      {/* 1. Header Title */}
      <div className="pb-3 mb-5 border-b border-gray-150 flex items-center justify-between" id="watch-view-title-bar">
        <div className="text-[13px] text-gray-400 select-none flex items-center gap-1.5">
          <span>设备管理</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium font-sans">智能手表管理</span>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-5 rounded border border-gray-200 mb-6" id="watch-filter-card">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          
          {/* Filter 1: 所属收费站 */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">所属收费站</span>
            <div className="relative w-36">
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

          {/* Filter 2: 手表状态 */}
          <div className="flex items-center gap-2 relative">
            <span className="text-gray-600 font-medium whitespace-nowrap">手表状态</span>
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

          {/* Filter 4: 模糊检索 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium whitespace-nowrap">检索</span>
            <input
              type="text"
              value={searchWearer}
              onChange={(e) => setSearchWearer(e.target.value)}
              placeholder="佩戴人员姓名 / 手表设备ID"
              className="w-56 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 h-8"
            />
          </div>

          {/* ACTION BUTTONS */}
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
                const defaultStation = availableStations[0] || "永川西收费站";
                setFormStation(defaultStation);
                const list = getStaffListByStation(defaultStation);
                if (list.length > 0) {
                  setFormWearer(list[0].name);
                  setFormRole(list[0].role);
                } else {
                  setFormWearer("");
                  setFormRole("值班站长");
                }
                setFormWatchId("");
                setFormPushEnabled(true);
                setFormBattery(100);
                setEditingWatch(null);
                setShowAddModal(true);
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
      <div className="bg-white rounded border border-gray-200 p-0 overflow-visible relative mb-6" id="watch-table-card">
        <div className="overflow-x-visible relative">
          <table className="w-full text-center text-xs border-collapse relative">
            <thead>
              <tr className="bg-[#f5f5f5] text-gray-700 font-semibold border-b border-gray-200">
                <th className="py-3 px-4 border-r border-gray-200 font-semibold w-16 text-gray-600">序号</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold w-36 text-gray-600">手表设备ID</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">佩戴人员</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">所属收费站</th>
                <th className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-600">手表状态</th>
                <th className="py-3 px-4 font-semibold text-gray-600 w-32">操作</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200 bg-white">
              {paginatedWatches.map((w, idx) => {
                const isOffline = w.status === "离线";
                const serialNum = (activePage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={w.id} className="hover:bg-gray-50 transition duration-150 relative">
                    {/* Serial Number */}
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-500">
                      {serialNum}
                    </td>

                    {/* Device ID */}
                    <td className="py-3 px-4 border-r border-gray-200 font-mono font-medium text-gray-700">
                      {w.id}
                    </td>

                    {/* Wearer info */}
                    <td className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-800">
                      {w.wearer}
                    </td>

                    {/* Belonging Station */}
                    <td className="py-3 px-4 border-r border-gray-200 font-sans text-gray-800">
                      {w.station}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      {isOffline ? (
                        <span className="text-gray-400 font-medium font-sans">
                          离线
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium font-sans">
                          正常
                        </span>
                      )}
                    </td>

                    {/* Device Interactive Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => handleEditClick(w)}
                          className="text-[#1890ff] hover:text-blue-700 transition cursor-pointer font-medium text-[12px] hover:underline"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnbindWatch(w.id)}
                          className="text-red-500 hover:text-red-700 transition cursor-pointer font-medium text-[12px] hover:underline"
                          title="删除注销此智能手表设备"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredWatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    没有搜索到符合筛选方案的可定位智能手表或穿戴设备。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>



      {/* 5. Pagination indicator */}
      <div className="flex justify-end items-center mt-2.5 mb-6 text-xs text-gray-600 font-sans select-none fill-current">
        <div className="flex items-center space-x-1.5">
          
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

      {/* 6. MODAL dialog for Addition / Editing */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn" id="add-watch-modal-overlay">
          <div
            id="add-watch-panel"
            className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800 text-[13px]"
          >
            <button
              type="button"
              onClick={() => {
                setFormStation("");
                setFormWatchId("");
                setFormWearer("");
                setFormPushEnabled(true);
                setEditingWatch(null);
                setShowAddModal(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-[13px] font-bold text-gray-800 mb-5 pb-1 block border-b border-gray-50">
              {editingWatch ? "编辑智能手表设备" : "添加智能手表设备"}
            </h3>
            
            <form onSubmit={handleAddWatch} className="space-y-4">
              
              {/* Field 1: 所属收费站 */}
              <div className="flex items-start">
                <label className="w-24 text-right pr-3 pt-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                   所属收费站
                </label>
                
                <div className="flex-1 relative" id="form-station-select-container">
                  <button
                    type="button"
                    onClick={() => handleStationChange(availableStations[0] || "永川西收费站")}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none focus:border-blue-500 h-8 text-left"
                  >
                    <span className="text-gray-800">
                      {formStation || (availableStations[0] || "永川西收费站")}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </button>
                  {/* Since simple clicks work on input overlays, we set it straight or fallback to quick select */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {availableStations.map(st => (
                      <span
                        key={st}
                        onClick={() => {
                          handleStationChange(st);
                          setOpenFormStationDrop(false);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded cursor-pointer border ${formStation === st ? "bg-blue-50 border-blue-400 text-blue-600 font-medium" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 2: 手表设备ID */}
              <div className="flex items-start">
                <label className="w-24 text-right pr-3 pt-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                  手表设备ID
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formWatchId}
                    onChange={(e) => setFormWatchId(e.target.value)}
                    placeholder="W_YCW_005 或全球专属码"
                    className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 h-8"
                    required
                  />
                </div>
              </div>

              {/* Field 3: 佩戴人员 */}
              <div className="flex items-start">
                <label className="w-24 text-right pr-3 pt-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                  佩戴人姓名
                </label>
                <div className="flex-1 relative">
                  <select
                    value={formWearer}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setFormWearer(selectedName);
                      // Auto-match role
                      const matched = currentStaffList.find(item => item.name === selectedName);
                      if (matched) {
                        setFormRole(matched.role);
                      }
                    }}
                    className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 h-8 cursor-pointer"
                    required
                  >
                    {!formWearer && <option value="">请选择人员</option>}
                    {currentStaffList.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Field 6: 状态 check box panel */}
              <div className="flex items-center">
                <span className="w-24 text-right pr-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                  状态
                </span>
                <div className="flex items-center gap-6 text-xs select-none">
                  {/* Enable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="formStatus" 
                      checked={formStatus === "正常"} 
                      onChange={() => setFormStatus("正常")}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                      formStatus === "正常" 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {formStatus === "正常" && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-gray-700 font-sans text-xs">启用</span>
                  </label>
                  
                  {/* Disable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="formStatus" 
                      checked={formStatus === "离线"} 
                      onChange={() => setFormStatus("离线")}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex flex-row items-center justify-center transition-all ${
                      formStatus === "离线" 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {formStatus === "离线" && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-gray-700 font-sans text-xs">禁用</span>
                  </label>
                </div>
              </div>

              {/* Form actions: 确定 / 取消 */}
              <div className="flex justify-start gap-2 pt-3 pl-24 font-sans">
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
                    setFormWatchId("");
                    setFormWearer("");
                    setFormPushEnabled(true);
                    setFormStatus("正常");
                    setEditingWatch(null);
                    setShowAddModal(false);
                  }}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs px-6 py-1.5 font-medium cursor-pointer transition"
                >
                  取消
                </button>
              </div>

            </form>


          </div>
        </div>
      )}

      {deleteTargetId !== null && (() => {
        const target = watches.find(w => w.id === deleteTargetId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[999] animate-fadeIn">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800 text-[13px]">
              <h3 className="text-sm font-bold text-gray-800 mb-3 block">确认注销并删除设备</h3>
              <p className="text-gray-500 mb-5 leading-normal">
                确认要注销并删除佩戴人 <strong className="text-gray-800">【{target.wearer}】</strong> 的手表编号 <strong className="text-gray-800">[{target.id}]</strong> 绑定关系吗？
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
                    setWatches((prev) => prev.filter((w) => w.id !== deleteTargetId));
                    if (onAppendLog) {
                      onAppendLog("智能手表管理", `解除手表绑定关系: 佩戴人 [${target.wearer}] 设备ID [${target.id}]`);
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
