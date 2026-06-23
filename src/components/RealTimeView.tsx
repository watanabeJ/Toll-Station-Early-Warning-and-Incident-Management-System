import React, { useEffect, useState } from "react";
import { Play, ShieldAlert, CheckCircle, Smartphone, AlertTriangle, RefreshCw } from "lucide-react";
import { TollStationEvent, EventType, EventStatus, HandlerAction, getEventTypeName } from "../types";

interface RealTimeViewProps {
  events: TollStationEvent[];
  onOpenProcessModal: (event: TollStationEvent) => void;
  onCloseEventDirectly: (eventId: string) => void;
  showAnnotations: boolean;
}

export default function RealTimeView({
  events,
  onOpenProcessModal,
  onCloseEventDirectly,
  showAnnotations,
}: RealTimeViewProps) {
  // Filter for only Pending events, sorted closest time first (as specified by Annotation 9: "只展示未处理事件，告警时间越近越靠前")
  const pendingEvents = events
    .filter((e) => e.status === EventStatus.Pending)
    .sort((a, b) => new Date(b.alarmTime).getTime() - new Date(a.alarmTime).getTime());

  // 6 specific categories shown in the prototype mockup drawing
  const CATEGORIES = [
    { key: "pedestrian", name: "行人安全监控", color: "#0091ff" },
    { key: "twowheeler", name: "两轮车安全监控", color: "#00c1ff" },
    { key: "passenger_bus", name: "客车禁行时段管控", color: "#00a2c1" },
    { key: "hazardous_vehicle", name: "危险品车辆禁行时段管控", color: "#00bda0" },
    { key: "staff_alert", name: "工作人员进入安全提示", color: "#00d1ff" },
    { key: "barrier_anomaly", name: "栏杆异常", color: "#00df91" },
  ];

  // Helper mapping from event to category name
  const getCategoryOfEvent = (e: TollStationEvent): string => {
    const t = e.type as any;
    if (t === EventType.Pedestrian || t === "行人安全监控" || t === "行人安全管控") return "行人安全监控";
    if (t === EventType.TwoWheeler || t === "两轮车安全监控" || t === "两轮车安全管控") return "两轮车安全监控";
    if (t === EventType.TwoPassenger || t === "客车禁行时段管控" || t === "两客禁行时段管控") return "客车禁行时段管控";
    if (t === EventType.OneHazard || t === "危险品车辆禁行时段管控" || t === "一危禁行时段管控") return "危险品车辆禁行时段管控";
    // Fallback support for old enum value
    if (t === "TwoPassengerOneHazard" || t === "两客一危禁行时段管控") {
      if (e.id === "7989795") return "危险品车辆禁行时段管控";
      return "客车禁行时段管控";
    }
    if (t === EventType.StaffAlert || t === "工作人员进入安全提示") return "工作人员进入安全提示";
    if (t === EventType.BarrierNormal || t === "栏杆异常") return "栏杆异常";
    return "";
  };

  // Dynamically count distribution of all events based on current database
  const getCategoryCount = (key: string): number => {
    if (key === "pedestrian") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.Pedestrian || t === "行人安全监控" || t === "行人安全管控";
      }).length;
    }
    if (key === "twowheeler") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.TwoWheeler || t === "两轮车安全监控" || t === "两轮车安全管控";
      }).length;
    }
    if (key === "passenger_bus") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.TwoPassenger || 
               t === "客车禁行时段管控" ||
               t === "两客禁行时段管控" || 
               ((t === "TwoPassengerOneHazard" || t === "两客一危禁行时段管控") && e.id !== "7989795");
      }).length;
    }
    if (key === "hazardous_vehicle") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.OneHazard || 
               t === "危险品车辆禁行时段管控" ||
               t === "一危禁行时段管控" || 
               ((t === "TwoPassengerOneHazard" || t === "两客一危禁行时段管控") && e.id === "7989795");
      }).length;
    }
    if (key === "staff_alert") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.StaffAlert || t === "工作人员进入安全提示";
      }).length;
    }
    if (key === "barrier_anomaly") {
      return events.filter(e => {
        const t = e.type as any;
        return t === EventType.BarrierNormal || t === "栏杆异常";
      }).length;
    }
    return 0;
  };

  const totalTodayCounts = CATEGORIES.reduce((sum, cat) => sum + getCategoryCount(cat.key), 0);

  // Category filter state. When activated, only events of this category are displayed
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<{ key: string; name: string; color: string } | null>(null);

  // Filter display events dynamically
  const displayPendingEvents = pendingEvents.filter((e) => {
    if (!selectedCategory) return true;
    return getCategoryOfEvent(e) === selectedCategory;
  });

  // 30s auto refresh countdown (Annotation 9: "列表30s自动刷新一次")
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reset timer and simulate list refresh
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col space-y-4 h-full">
      {/* Top Title Section */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 text-sm">
            实时监控
          </span>
        </div>
      </div>

      <div className="flex flex-1 space-x-4 overflow-hidden h-full">
        {/* Left Side: Stats and Pending List */}
        <div className="w-[38%] flex flex-col space-y-4 h-full overflow-y-auto pr-1">
          {/* Today Statistics Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm shrink-0">
            <h3 className="text-sm font-bold text-gray-800 mb-4">今日事件</h3>
            <div className="flex items-center justify-between gap-4">
              {/* Legends list with interactive click highlights */}
              <div className="space-y-1.5 text-xs text-gray-700 flex-1">
                {CATEGORIES.map((cat) => {
                  const count = getCategoryCount(cat.key);
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        if (selectedCategory === cat.name) {
                          setSelectedCategory(null);
                        } else {
                          setSelectedCategory(cat.name);
                        }
                      }}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`w-full flex items-center justify-between p-1 px-2 rounded-md transition-all duration-150 text-left cursor-pointer group ${
                        isSelected 
                          ? "bg-blue-50 text-blue-600 font-semibold ring-1 ring-blue-200/50" 
                          : "hover:bg-gray-50 text-gray-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded shrink-0 transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <span className="truncate text-[11px]">{cat.name}</span>
                      </div>
                      <span className={`text-[10px] ml-2 px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? "bg-blue-100 text-blue-700 animate-pulse" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic segmented SVG Donut Chart */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" fill="transparent" r="40" stroke="#f3f4f6" strokeWidth="11" />
                  {/* Render segments */}
                  {(() => {
                    let currentOffset = 0;
                    const r = 40;
                    const circumference = 2 * Math.PI * r; // ~251.327
                    
                    return CATEGORIES.map((cat) => {
                      const count = getCategoryCount(cat.key);
                      // If totalTodayCounts is 0, draw equal sections to simulate a preview, matching image mockup look
                      const ratio = totalTodayCounts > 0 
                        ? count / totalTodayCounts 
                        : 1 / CATEGORIES.length;
                      
                      const strokeLength = ratio * circumference;
                      const strokeOffset = -currentOffset;
                      currentOffset += strokeLength;

                      const isSelected = selectedCategory === cat.name;
                      const isHovered = hoveredCategory?.name === cat.name;
                      const strokeWidthVal = isSelected || isHovered ? 15 : 11;

                      if (totalTodayCounts > 0 && count === 0) return null;

                      return (
                        <circle
                          key={cat.key}
                          cx="56"
                          cy="56"
                          r={r}
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth={strokeWidthVal}
                          strokeDasharray={`${strokeLength} ${circumference}`}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 cursor-pointer hover:stroke-[13px] origin-center"
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => {
                            if (selectedCategory === cat.name) {
                              setSelectedCategory(null);
                            } else {
                              setSelectedCategory(cat.name);
                            }
                          }}
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center text of physical donut chart (restricted to inner hole area of donut to avoid blocking circle clicks) */}
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center bg-transparent border-0 cursor-pointer group focus:outline-none z-10"
                  title="点击重置，查看全部"
                >
                  <span className={`text-xl font-black leading-none transition-transform group-hover:scale-105 ${
                    selectedCategory ? "text-blue-600" : "text-gray-800"
                  }`}>
                    {selectedCategory ? getCategoryCount(CATEGORIES.find(c => c.name === selectedCategory)?.key || "") : totalTodayCounts}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors font-medium">
                    {selectedCategory ? "已选类型" : "事件总数"}
                  </span>
                </button>

                {/* Dynamic Tooltip on Hover/Selection matching screenshot layout precisely */}
                {(() => {
                  const activeTooltipCat = hoveredCategory || (selectedCategory ? CATEGORIES.find(c => c.name === selectedCategory) : null);
                  if (!activeTooltipCat) return null;
                  const count = getCategoryCount(activeTooltipCat.key);
                  return (
                    <div 
                      className="absolute bottom-[-18px] right-[-20px] bg-white border border-[#38dbff] rounded shadow-lg p-1.5 px-3 flex items-center space-x-2 text-[11px] font-semibold z-20 transition-all duration-200 whitespace-nowrap"
                    >
                      {/* Triangle Pointer Accent pointing upwards to segment */}
                      <div className="absolute -top-1.5 right-[42px] w-2 h-2 bg-white border-t border-l border-[#38dbff] rotate-45" />
                      {/* Cyan Indicator Circle */}
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: activeTooltipCat.color }} 
                      />
                      <span className="text-gray-600 font-medium">{activeTooltipCat.name}</span>
                      <span className="text-gray-800 font-black text-[12px] ml-4">
                        {count}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Pending Alarms List Container */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden flex-grow min-h-[300px]">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                待处理特情列表 ({displayPendingEvents.length})
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer font-bold transition-all duration-150"
                >
                  清除：显示全部
                </button>
              )}
            </div>

            {/* Scrollable pending list */}
            {displayPendingEvents.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-gray-400 space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <span className="text-xs">
                  {selectedCategory ? `暂无 [${selectedCategory}] 待处理记录` : "当前暂无待处理特情，车道畅通中"}
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-blue-500 hover:underline cursor-pointer"
                  >
                    查看全部类型
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar max-h-[420px]">
                {displayPendingEvents.map((event) => {
                  const isStaffAlert = event.type === EventType.StaffAlert;
                  return (
                    <div
                      key={event.id}
                      className="border border-gray-100 hover:border-gray-300 rounded-md p-3 relative bg-white shadow-xs transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex space-x-3 pr-16">
                        {/* Event snapshot thumbnail */}
                        <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded overflow-hidden border border-gray-200 shrink-0">
                          {event.snapshotUrl ? (
                            <img
                              src={event.snapshotUrl}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="text-gray-900 font-medium">
                            <span className="font-bold text-gray-400">ID:</span> {event.id}
                          </p>
                          <p className="text-gray-800">
                            <span className="font-bold text-gray-400">类型:</span>{" "}
                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                              {getCategoryOfEvent(event)}
                            </span>
                          </p>
                          <p className="text-gray-500 text-[10px]">
                            <span className="font-bold text-gray-400">时间:</span> {event.alarmTime}
                          </p>
                        </div>
                      </div>

                      {/* Action Button: Staff Alerts show '关闭' while others show '去处理' */}
                      {isStaffAlert ? (
                        <button
                          onClick={() => onCloseEventDirectly(event.id)}
                          className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs rounded-bl-md font-medium transition-colors cursor-pointer"
                        >
                          关闭
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenProcessModal(event)}
                          className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 text-xs rounded-bl-md font-medium transition-colors cursor-pointer"
                        >
                          去处理
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Simple Pagination/Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 shrink-0">
              <span>共 {displayPendingEvents.length} 条待处理记录</span>
              <span>单页限5条记录显示</span>
            </div>
          </div>
        </div>

        {/* Right Side: Live Video Monitoring Chamber (Screen 6) */}
        <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden border border-gray-800 flex flex-col h-full shadow-inner">
          {/* Mock Camera video streams container */}
          <div className="absolute inset-0 flex items-center justify-center bg-radial-at-c from-gray-800 to-gray-950">
            {/* Grid of background scan lines to resemble CCTV screen */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-20 pointer-events-none" />

            {/* Video element representation */}
            <div className="text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center mx-auto transition-all cursor-pointer shadow-md group">
                <Play className="w-8 h-8 text-blue-500 pl-1 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="font-semibold tracking-wide text-gray-200">永川西车道入口-CCTV 01号实时流</p>
                <p className="text-xs text-gray-500 mt-1">25 FPS • 1080P • H.265 AI智能识别分析活跃中</p>
              </div>
            </div>
          </div>

          {/* CCTV Info Overlays */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded select-none flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <span>LIVE CAM ST-02-IN3</span>
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded select-none">
            永川西收费站
          </div>

          {/* Annotation 9: Instruction Box (Screen 6 overlay) */}
          {showAnnotations && (
            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-72 bg-amber-50 border border-amber-200 shadow-xl rounded-md p-4 z-20">
              <div className="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded absolute -top-2.5 left-2 font-bold shadow-xs">
                9
              </div>
              <ul className="text-[11px] text-gray-800 space-y-2 list-none p-0 m-0 leading-relaxed">
                <li className="flex items-start gap-1 pb-1 border-b border-amber-200/50">
                  <span className="text-amber-500 mr-0.5">●</span>
                  <span><strong>只展示未处理事件</strong>，此处处理后事件列表该事件状态同步更新</span>
                </li>
                <li className="flex items-start gap-1 pb-1 border-b border-amber-200/50">
                  <span className="text-amber-500 mr-0.5">●</span>
                  <span><strong>告警时间越近越靠前</strong></span>
                </li>
                <li className="flex items-start gap-1 pb-1 border-b border-amber-200/50">
                  <span className="text-amber-500 mr-0.5">●</span>
                  <span>工作人员提示类型按钮显示为<strong>【关闭】</strong></span>
                </li>
                <li className="flex items-start gap-1 pb-1 border-b border-amber-200/50">
                  <span className="text-amber-500 mr-0.5">●</span>
                  <span>列表<strong>30s自动刷新一次</strong></span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 mr-0.5">●</span>
                  <span>栏杆还是要处理，但是不播放</span>
                </li>
              </ul>
              <div className="mt-2 text-[10px] text-gray-400 text-right font-medium">
                浪花小狗 💛
              </div>
              {/* Reference Connector Line */}
              <div className="absolute -left-12 top-1/2 w-12 border-t-2 border-amber-400 flex items-center justify-end pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-amber-400 -mr-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
