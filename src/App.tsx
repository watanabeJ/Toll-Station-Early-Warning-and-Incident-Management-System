import React, { useState, useEffect } from "react";
import {
  Layers,
  Monitor,
  List,
  Building2,
  Lock,
  User,
  FileText,
  Cpu,
  ArrowUpCircle,
  HelpCircle,
  ChevronDown,
  LogOut,
  KeyRound,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import {
  INITIAL_EVENTS,
  INITIAL_STATIONS,
  INITIAL_ROLES,
  INITIAL_LOGS,
  INITIAL_DEVICES,
} from "./data";
import {
  TollStationEvent,
  TollStation,
  PermissionRole,
  OperationLog,
  EventStatus,
  HandlerAction,
  EventType,
} from "./types";

// Component imports
import LoginView from "./components/LoginView";
import RealTimeView from "./components/RealTimeView";
import EventListView from "./components/EventListView";
import StationManagementView from "./components/StationManagementView";
import PermissionManagementView from "./components/PermissionManagementView";
import AccountManagementView from "./components/AccountManagementView";
import OperationLogView from "./components/OperationLogView";
import DeviceManagementView from "./components/DeviceManagementView";
import SpeakerManagementView from "./components/SpeakerManagementView";
import WatchManagementView from "./components/WatchManagementView";
import UpgradeView from "./components/UpgradeView";
import CameraManagementView from "./components/CameraManagementView";
import EventTypeManagementView from "./components/EventTypeManagementView";
import GeneralConfigView from "./components/GeneralConfigView";

type ActiveMenu =
  | "workstation_realtime"
  | "workstation_eventlist"
  | "station"
  | "permission"
  | "account"
  | "operation_log"
  | "general_config"
  | "device"
  | "device_speaker"
  | "camera"
  | "device_watch"
  | "event_type"
  | "upgrade_outdoor"
  | "upgrade_server";

export default function App() {
  // Global Session state
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("toll_sys_user") || null;
  });

  // Database States (Restored from LocalStorage if available, otherwise seeded)
  const [events, setEvents] = useState<TollStationEvent[]>(() => {
    const saved = localStorage.getItem("toll_sys_events");
    
    const migrateEventTypes = (list: TollStationEvent[]): TollStationEvent[] => {
      return list.map(e => {
        const t = e.type as any;
        let mappedType = e.type;
        if (t === "行人安全管控") mappedType = EventType.Pedestrian;
        else if (t === "两轮车安全管控") mappedType = EventType.TwoWheeler;
        else if (t === "两客禁行时段管控") mappedType = EventType.TwoPassenger;
        else if (t === "一危禁行时段管控") mappedType = EventType.OneHazard;
        return {
          ...e,
          type: mappedType
        };
      });
    };

    if (saved) {
      try {
        const parsed: TollStationEvent[] = JSON.parse(saved);
        const migratedParsed = migrateEventTypes(parsed);
        const existingIds = new Set(migratedParsed.map(e => e.id));
        const newPresets = migrateEventTypes(INITIAL_EVENTS).filter(e => !existingIds.has(e.id));
        if (newPresets.length > 0) {
          const merged = [...migratedParsed, ...newPresets];
          localStorage.setItem("toll_sys_events", JSON.stringify(merged));
          return merged;
        }
        localStorage.setItem("toll_sys_events", JSON.stringify(migratedParsed));
        return migratedParsed;
      } catch (e) {
        return migrateEventTypes(INITIAL_EVENTS);
      }
    }
    return migrateEventTypes(INITIAL_EVENTS);
  });

  const [stations, setStations] = useState<TollStation[]>(() => {
    const saved = localStorage.getItem("toll_sys_stations");
    return saved ? JSON.parse(saved) : INITIAL_STATIONS;
  });

  const [roles, setRoles] = useState<PermissionRole[]>(() => {
    const saved = localStorage.getItem("toll_sys_roles");
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [logs, setLogs] = useState<OperationLog[]>(() => {
    const saved = localStorage.getItem("toll_sys_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentStation, setCurrentStation] = useState<string>("永川西收费站");
  const [currentMenu, setCurrentMenu] = useState<ActiveMenu>("workstation_realtime");
  const [initialSelectedEvent, setInitialSelectedEvent] = useState<any | null>(null);
  
  // Custom annotation reviews display state (Interactive Floating Reviews)
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  
  // Header User Dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Sidebar collapsible section states
  const [workstationExpanded, setWorkstationExpanded] = useState(true);
  const [deviceExpanded, setDeviceExpanded] = useState(true);
  const [upgradeExpanded, setUpgradeExpanded] = useState(true);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("toll_sys_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("toll_sys_stations", JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem("toll_sys_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("toll_sys_logs", JSON.stringify(logs));
  }, [logs]);

  // Live clock state in header
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper: Append Operation Audit Logs
  const appendAuditLog = (module: string, action: string) => {
    const newLog: OperationLog = {
      id: "log_" + Date.now(),
      loginIp: "112.351.78.85", // Simulated fixed toll LAN gateway IP
      operator: currentUser || "admin",
      module,
      action,
      time: currentTimeStr || new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Actions
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("toll_sys_user", username);
    
    // Append audit trace
    appendAuditLog("安全会话", "登录系统");
    setCurrentMenu("workstation_realtime");
  };

  const handleLogout = () => {
    appendAuditLog("安全会话", "登出系统");
    setCurrentUser(null);
    localStorage.removeItem("toll_sys_user");
    setShowUserDropdown(false);
  };

  // 1. Submit Event Handling Process
  const handleProcessSubmit = (eventId: string, action: HandlerAction | "误报", opinion: string) => {
    const currentTime = currentTimeStr || new Date().toISOString().replace('T', ' ').substring(0, 19);
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            status: EventStatus.Processed,
            handlerAction: action === "误报" ? HandlerAction.Misreport : action,
            handlerTime: currentTime,
            handlerOpinion: opinion,
            handlerName: currentUser || "admin",
          };
        }
        return e;
      })
    );
    appendAuditLog("事件管理", `${action} (事件ID #${eventId})`);
  };

  // Closing staff indicator directly
  const handleCloseEventDirectly = (eventId: string) => {
    const currentTime = currentTimeStr || new Date().toISOString().replace('T', ' ').substring(0, 19);
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            status: EventStatus.Processed,
            handlerAction: HandlerAction.Normal,
            handlerTime: currentTime,
            handlerOpinion: "工作人员已手动关闭警诫提示",
            handlerName: currentUser || "admin",
          };
        }
        return e;
      })
    );
    appendAuditLog("事件管理", `一键静默关闭 (事件ID #${eventId})`);
  };

  // 2. Add Toll Station
  const handleAddStation = (name: string, status: "启用" | "禁用") => {
    const newStation: TollStation = {
      id: String(Date.now()),
      name,
      status,
      createdTime: currentTimeStr || new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setStations((prev) => [newStation, ...prev]);
    appendAuditLog("收费站管理", `新增站点: ${name}`);
  };

  // 3. Edit Toll Station name
  const handleEditStation = (id: string, name: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
    appendAuditLog("收费站管理", `编辑名称: ${name}`);
  };

  // 4. Change Status Toll Station
  const handleChangeStationStatus = (id: string, newStatus: "启用" | "禁用") => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    const target = stations.find((s) => s.id === id);
    appendAuditLog("收费站管理", `${newStatus === "启用" ? "启用" : "禁用"}站点: ${target?.name || "未知"}`);
  };

  // 5. Delete Toll Station record
  const handleDeleteStation = (id: string) => {
    const target = stations.find((s) => s.id === id);
    setStations((prev) => prev.filter((s) => s.id !== id));
    appendAuditLog("收费站管理", `删除站点: ${target?.name || "未知"}`);
  };

  // 6. Add Role configuration
  const handleAddRole = (name: string, description: string, enabled: boolean, menus: string[]) => {
    const newRole: PermissionRole = {
      id: "role_" + Date.now(),
      name,
      description,
      enabled,
      authorizedMenus: menus,
    };
    setRoles((prev) => [...prev, newRole]);
    appendAuditLog("权限管理", `新增权限角色: ${name}`);
  };

  // 7. Edit Role configuration
  const handleEditRole = (id: string, name: string, description: string, enabled: boolean, menus: string[]) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, name, description, enabled, authorizedMenus: menus } : r
      )
    );
    appendAuditLog("权限管理", `修改权限角色: ${name}`);
  };

  // 8. Delete Role
  const handleDeleteRole = (id: string) => {
    const target = roles.find((r) => r.id === id);
    setRoles((prev) => prev.filter((r) => r.id !== id));
    appendAuditLog("权限管理", `废弃权限角色: ${target?.name || "未知"}`);
  };

  // Session handler if password matches rule checklist modified (Screen 4 re-login spec)
  const handlePasswordChangedSuccess = () => {
    appendAuditLog("安全会话", "自主修改登录密码 - 强行登出");
    setCurrentUser(null);
    localStorage.removeItem("toll_sys_user");
    setShowUserDropdown(false);
  };

  // Find current user's allowed station list based on Account Management setup
  const getUserAllowedStations = React.useCallback((): string[] => {
    if (!currentUser) return [];
    
    const saved = localStorage.getItem("sub_accounts_db");
    let accountsList: any[] = [];
    if (saved) {
      try {
        accountsList = JSON.parse(saved);
      } catch (e) {}
    }
    
    // Find matched account
    const matched = accountsList.find((acc) => acc.username === currentUser);
    if (matched) {
      if (!matched.station) return [];
      return matched.station.split(/、|,|，\s*/).map((s: string) => s.trim()).filter(Boolean);
    }
    
    // Fallback if not found (e.g. default admin during first run)
    if (currentUser === "admin") {
      return ["永川西收费站"];
    }
    
    return [];
  }, [currentUser]);

  const userAllowedStations = React.useMemo(() => {
    return getUserAllowedStations();
  }, [getUserAllowedStations]);

  // Filter events by the current user's authorized toll stations
  const filteredUserEvents = React.useMemo(() => {
    if (userAllowedStations.length === 0) return events;
    return events.filter(e => userAllowedStations.includes(e.station));
  }, [events, userAllowedStations]);

  // Filter stations by user allowed stations
  const filteredUserStations = React.useMemo(() => {
    if (userAllowedStations.length === 0) return stations;
    return stations.filter(s => userAllowedStations.includes(s.name));
  }, [stations, userAllowedStations]);

  // Filter operation logs so that only logs of people who share the allowed stations are viewed
  const filteredUserLogs = React.useMemo(() => {
    if (userAllowedStations.length === 0) return logs;
    
    // Load accounts to find operators' stations
    const saved = localStorage.getItem("sub_accounts_db");
    let accountsList: any[] = [];
    if (saved) {
      try {
        accountsList = JSON.parse(saved);
      } catch (e) {}
    }
    
    return logs.filter((log) => {
      const op = log.operator;
      if (op === "admin" || op === currentUser) {
        return true;
      }
      const matched = accountsList.find((acc) => acc.username === op);
      if (matched && matched.station) {
        const opStations = matched.station.split(/、|,|，\s*/).map((s: string) => s.trim()).filter(Boolean);
        return opStations.some((st: string) => userAllowedStations.includes(st));
      }
      return true;
    });
  }, [logs, userAllowedStations, currentUser]);

  // Render view selector
  const renderMainContent = () => {
    switch (currentMenu) {
      case "workstation_realtime":
        // Opened proces model on realtime feed click opens event modal on EventListView instead or direct
        return (
          <RealTimeView
            events={filteredUserEvents}
            onOpenProcessModal={(ev) => {
              setInitialSelectedEvent(ev);
              setCurrentMenu("workstation_eventlist");
            }}
            onCloseEventDirectly={handleCloseEventDirectly}
            showAnnotations={showAnnotations}
          />
        );
      case "workstation_eventlist":
        return (
          <EventListView
            events={filteredUserEvents}
            onSubmitProcess={handleProcessSubmit}
            showAnnotations={showAnnotations}
            initialSelectedEvent={initialSelectedEvent}
            onClearInitialSelectedEvent={() => setInitialSelectedEvent(null)}
          />
        );
      case "station":
        return (
          <StationManagementView
            stations={filteredUserStations}
            onAddStation={handleAddStation}
            onEditStation={handleEditStation}
            onChangeStatus={handleChangeStationStatus}
            onDeleteStation={handleDeleteStation}
          />
        );
      case "permission":
        return (
          <PermissionManagementView
            roles={roles}
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            showAnnotations={showAnnotations}
          />
        );
      case "account":
        return (
          <AccountManagementView
            onPasswordChanged={handlePasswordChangedSuccess}
            showAnnotations={showAnnotations}
          />
        );
      case "operation_log":
        return <OperationLogView logs={filteredUserLogs} />;
      case "general_config":
        return (
          <GeneralConfigView
            onAppendLog={appendAuditLog}
            showAnnotations={showAnnotations}
          />
        );
      case "device":
        return (
          <DeviceManagementView
            showAnnotations={showAnnotations}
            onAppendLog={appendAuditLog}
            stations={filteredUserStations}
            allowedStations={userAllowedStations}
          />
        );
      case "device_speaker":
        return (
          <SpeakerManagementView
            showAnnotations={showAnnotations}
            onAppendLog={appendAuditLog}
            stations={filteredUserStations}
            allowedStations={userAllowedStations}
          />
        );
      case "camera":
        return (
          <CameraManagementView
            showAnnotations={showAnnotations}
            onAppendLog={appendAuditLog}
            allowedStations={userAllowedStations}
          />
        );
      case "device_watch":
        return (
          <WatchManagementView
            showAnnotations={showAnnotations}
            onAppendLog={appendAuditLog}
            stations={filteredUserStations}
            allowedStations={userAllowedStations}
          />
        );
      case "event_type":
        return (
          <EventTypeManagementView
            onAppendLog={appendAuditLog}
          />
        );
      case "upgrade_outdoor":
        return <UpgradeView category="outdoor" onAppendLog={appendAuditLog} />;
      case "upgrade_server":
        return <UpgradeView category="server" onAppendLog={appendAuditLog} />;
      default:
        return <RealTimeView events={events} onOpenProcessModal={() => {}} onCloseEventDirectly={handleCloseEventDirectly} showAnnotations={showAnnotations} />;
    }
  };

  // Safe checks: If not logged in, render beautiful full Login view
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased font-sans">
        {/* Top Header Block */}
        <header className="w-full bg-white border-b border-gray-100 py-3.5 px-8 flex items-center justify-between shadow-xs shrink-0 select-none">
          <h1 className="text-gray-800 font-extrabold text-lg select-none tracking-tight">
            收费站车道特情事件管理系统
          </h1>
          {/* Toggle Annotation Button */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 hover:bg-yellow-250 text-yellow-800 rounded border border-yellow-200 text-xs font-semibold transition cursor-pointer"
            title="点击切换界面中黄色产品功能建议卡批注的显示状态"
          >
            <HelpCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
            <span>{showAnnotations ? "隐藏产品批注" : "展开产品批注"}</span>
          </button>
        </header>

        {/* View Component */}
        <LoginView onLoginSuccess={handleLogin} showAnnotations={showAnnotations} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] text-gray-700 antialiased font-sans overflow-hidden h-screen">
      {/* GLOBAL HEADER (Screen 2 Header structure) */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shrink-0 z-40 select-none">
        <div className="flex items-center space-x-6">
          <h1 className="text-[15px] font-bold text-gray-800 select-none tracking-tight">
            收费站车道特情事件管理
          </h1>
          

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-850 rounded border border-yellow-200 text-[10px] font-bold transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
            <span>{showAnnotations ? "隐藏批注" : "显示黄色批注"}</span>
          </button>
        </div>

        {/* Clock & Profile section */}
        <div className="flex items-center space-x-6 text-xs text-gray-500 select-none">
          {/* Clock String */}
          <span className="font-mono bg-gray-50 px-2 py-0.5 border border-gray-150 rounded">{currentTimeStr}</span>

          {/* admin profile action */}
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
              className="flex items-center space-x-2 focus:outline-none hover:text-gray-900 transition-colors cursor-pointer text-xs font-semibold text-gray-700"
            >
              <span>{currentUser}</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-extrabold shadow-sm border border-blue-100">
                {currentUser ? currentUser.charAt(0).toUpperCase() : "A"}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Profile dropdown dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-gray-800 text-white rounded shadow-xl py-1.5 z-50 text-[11px] animate-fadeIn">
                <button
                  onClick={() => setCurrentMenu("account")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 font-medium flex items-center gap-2 cursor-pointer border-b border-gray-750"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  修改密码
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-900 font-medium flex items-center gap-2 text-red-400 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* VIEW SPLIT ROW */}
      <div className="flex flex-1 overflow-hidden h-full">
        
        {/* LEFT SIDEBAR (Screen 2 Sidebar) */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto shrink-0 select-none">
          <nav className="flex-1 py-3 text-xs space-y-1">
            
            {/* Nav Menu: 工作台 (Collapsible Header with speedometer/chevron) */}
            <div className="relative">
              <button
                onClick={() => setWorkstationExpanded(!workstationExpanded)}
                className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center justify-between font-medium text-gray-700"
              >
                <div className="flex items-center gap-2.5">
                  {/* Speedometer/Gauge Icon */}
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.07 4.93a10 10 0 00-14.14 0" />
                    <path d="M12 12l3-3" />
                  </svg>
                  <span className="text-[13px] text-gray-800 font-medium font-sans">工作台</span>
                </div>
                {/* Chevron direction indicator */}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${workstationExpanded ? "transform rotate-180" : ""}`} />
              </button>

              {/* Submenus of 工作台 (Indented, only shown when expanded) */}
              {workstationExpanded && (
                <ul className="bg-gray-50/50 py-0.5 transition duration-150">
                  <li>
                    <button
                      onClick={() => {
                        setCurrentMenu("workstation_realtime");
                      }}
                      className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                        currentMenu === "workstation_realtime"
                          ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      <span>实时监控</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCurrentMenu("workstation_eventlist");
                      }}
                      className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                        currentMenu === "workstation_eventlist"
                          ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      <span>事件列表</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 my-2 mx-4" />

            {/* Flat Menu categories */}
            <div className="space-y-0.5">
              
              {/* Category: 收费站管理 */}
              <button
                onClick={() => setCurrentMenu("station")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "station"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* Custom Roadway / Toll Pillars Gate Icon */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16" />
                  <path d="M6 6v14" />
                  <path d="M12 6v14" />
                  <path d="M18 6v14" />
                  <path d="M3 10h18" />
                </svg>
                <span className="text-[13px]">收费站管理</span>
              </button>

              {/* Category: 权限管理 */}
              <button
                onClick={() => setCurrentMenu("permission")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "permission"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* Checklist Outline Icon */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" />
                </svg>
                <span className="text-[13px]">权限管理</span>
              </button>

              {/* Category: 账号管理 */}
              <button
                onClick={() => setCurrentMenu("account")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "account"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* User contour on left + sound wave signals representing connection registry */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M19 11a3 3 0 010 6m2.5-9a6 6 0 010 12" />
                </svg>
                <span className="text-[13px]">账号管理</span>
              </button>

              {/* Category: 操作日志 */}
              <button
                onClick={() => setCurrentMenu("operation_log")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "operation_log"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* Folder notes outline icon */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8" />
                </svg>
                <span className="text-[13px]">操作日志</span>
              </button>

              {/* Category: 通用参数配置 */}
              <button
                onClick={() => setCurrentMenu("general_config")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "general_config"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* Mechanical settings gear icon */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-[13px]">通用参数配置</span>
              </button>

              {/* Nav Menu: 设备管理 (Collapsible Header with visualizer/chevron) */}
              <div className="relative">
                <button
                  onClick={() => setDeviceExpanded(!deviceExpanded)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center justify-between font-medium text-gray-750"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Screen station visualizer icon */}
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    <span className="text-[13px] text-gray-800 font-medium font-sans">设备管理</span>
                  </div>
                  {/* Chevron direction indicator */}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${deviceExpanded ? "transform rotate-180" : ""}`} />
                </button>

                {/* Submenus of 设备管理 */}
                {deviceExpanded && (
                  <ul className="bg-gray-50/50 py-0.5 transition duration-150">
                    <li>
                      <button
                        onClick={() => setCurrentMenu("device")}
                        className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                          currentMenu === "device"
                            ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                            : "text-gray-650"
                        }`}
                      >
                        <span>屏幕管理</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setCurrentMenu("device_speaker")}
                        className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                          currentMenu === "device_speaker"
                            ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                            : "text-gray-650"
                        }`}
                      >
                        <span>音响管理</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setCurrentMenu("camera")}
                        className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                          currentMenu === "camera"
                            ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                            : "text-gray-650"
                        }`}
                      >
                        <span>摄像头管理</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setCurrentMenu("device_watch")}
                        className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                          currentMenu === "device_watch"
                            ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                            : "text-gray-650"
                        }`}
                      >
                        <span>智能手表管理</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* Category: 事件类型管理 */}
              <button
                onClick={() => setCurrentMenu("event_type")}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                  currentMenu === "event_type"
                    ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {/* Folder checkmark checkbook style icon */}
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <path d="M12 11l2 2 4-4" />
                </svg>
                <span className="text-[13px]">事件类型管理</span>
              </button>
            </div>

            <div className="border-t border-gray-100 my-2 mx-4" />

            {/* Nav Menu: 升级包升级 (Collapsible list containing Server/Screen at bottom) */}
            <div className="relative">
              <button
                onClick={() => setUpgradeExpanded(!upgradeExpanded)}
                className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition cursor-pointer flex items-center justify-between font-medium text-gray-750"
              >
                <div className="flex items-center gap-2.5">
                  {/* Code Tags custom SVG representing </> upgrade package */}
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 9l-4 4 4 4m8 0l4-4-4-4" />
                  </svg>
                  <span className="text-[13px] text-gray-800 font-medium font-sans">升级包升级</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${upgradeExpanded ? "transform rotate-180" : ""}`} />
              </button>

              {/* Submenus of 升级包升级 */}
              {upgradeExpanded && (
                <ul className="bg-gray-50/50 py-0.5 transition duration-150">
                  <li>
                    <button
                      onClick={() => {
                        setCurrentMenu("upgrade_outdoor");
                      }}
                      className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                        currentMenu === "upgrade_outdoor"
                          ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                          : "text-gray-650"
                      }`}
                    >
                      <span>户外屏</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCurrentMenu("upgrade_server");
                      }}
                      className={`w-full text-left pl-12 pr-4 py-2.5 hover:bg-gray-100/60 transition cursor-pointer flex items-center gap-2.5 font-sans relative ${
                        currentMenu === "upgrade_server"
                          ? "bg-blue-50/65 text-blue-600 border-r-4 border-blue-600 font-semibold"
                          : "text-gray-650"
                      }`}
                    >
                      <span>服务端</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>

          </nav>

          {/* Simple branding at bottom of rail */}
          <div className="p-4 border-t border-gray-150 text-[10px] text-gray-300 font-mono text-center shrink-0 tracking-widest bg-gray-50/50">
            PLATFORM ST-V4
          </div>
        </aside>

        {/* MAIN DISPLAY PORT */}
        <main className="flex-1 overflow-y-auto p-5 relative min-w-0 flex flex-col bg-gray-50">
          {renderMainContent()}
        </main>

      </div>
    </div>
  );
}
