import React, { useState, useEffect } from "react";

// Predefined AI Event Type Schema
interface AIEventType {
  key: string;
  name: string;
  category: "交通安全" | "机电工况" | "运营秩序";
  level: "DANGER" | "WARNING" | "INFO";
  enabled: boolean;
  captureCount: number;
  description: string;
}

const INITIAL_EVENT_TYPES: AIEventType[] = [
  {
    key: "pedestrian_intrusion",
    name: "行人安全监控",
    category: "交通安全",
    level: "DANGER",
    enabled: true,
    captureCount: 142,
    description: "行人闯入收费站车道、广场、匝道等高速公路禁行危险区域进行穿行或逗留"
  },
  {
    key: "motorcycle_intrusion",
    name: "两轮车安全监控",
    category: "交通安全",
    level: "DANGER",
    enabled: true,
    captureCount: 89,
    description: "两轮摩托车、电动车、自行车等非机动车辆违规驶入收费站广场或车道"
  },
  {
    key: "forbidden_bus",
    name: "客车禁行时段管控",
    category: "运营秩序",
    level: "WARNING",
    enabled: true,
    captureCount: 18,
    description: "班线客车、包车客车等高风险客运车辆在管制限行时间段内强行进入收费车道"
  },
  {
    key: "forbidden_hazardous",
    name: "危险品车辆禁行时段管控",
    category: "运营秩序",
    level: "DANGER",
    enabled: true,
    captureCount: 13,
    description: "危险货物运输车辆在禁行时段或禁行区域内强行驶入收费车道或广场"
  },
  {
    key: "staff_unattended",
    name: "工作人员进入安全提示",
    category: "运营秩序",
    level: "INFO",
    enabled: true,
    captureCount: 18,
    description: "正在执勤的收费人员在规定工作时间内，擅自离开收费亭且离岗超过设定时长"
  },
  {
    key: "barrier_anomaly",
    name: "栏杆异常",
    category: "机电工况",
    level: "WARNING",
    enabled: true,
    captureCount: 45,
    description: "起落杆道闸发生异常快速反弹回落、栏杆未能正常抬起导致轿车撞栏、或长挂车砸杆故障"
  }
];

interface EventTypeManagementViewProps {
  onAppendLog?: (module: string, action: string) => void;
}

export default function EventTypeManagementView({ onAppendLog }: EventTypeManagementViewProps) {
  // Sync in LocalStorage for high durability
  const [eventTypes, setEventTypes] = useState<AIEventType[]>(() => {
    const saved = localStorage.getItem("toll_sys_ai_event_types");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if we need to migrate from forbidden_truck
          const hasOld = parsed.some(x => x.key === "forbidden_truck");
          const hasNew = parsed.some(x => x.key === "forbidden_bus");
          let baseList = parsed;
          if (hasOld && !hasNew) {
            const oldItem = parsed.find(x => x.key === "forbidden_truck");
            const oldEnabled = oldItem ? oldItem.enabled : true;
            const filtered = parsed.filter(x => x.key !== "forbidden_truck");
            
            const newBus = INITIAL_EVENT_TYPES.find(x => x.key === "forbidden_bus")!;
            const newHaz = INITIAL_EVENT_TYPES.find(x => x.key === "forbidden_hazardous")!;
            
            filtered.push({ ...newBus, enabled: oldEnabled });
            filtered.push({ ...newHaz, enabled: oldEnabled });
            baseList = filtered;
          }
          
          // Re-align key settings dynamically with predefined parameters
          const merged: AIEventType[] = [];
          INITIAL_EVENT_TYPES.forEach((initial) => {
            const userItem = baseList.find(x => x.key === initial.key);
            if (userItem) {
              merged.push({
                ...initial,
                enabled: userItem.enabled,
                captureCount: typeof userItem.captureCount === 'number' ? userItem.captureCount : initial.captureCount
              });
            } else {
              merged.push(initial);
            }
          });
          return merged;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EVENT_TYPES;
  });

  useEffect(() => {
    localStorage.setItem("toll_sys_ai_event_types", JSON.stringify(eventTypes));
  }, [eventTypes]);

  // Toggle state
  const handleToggleEvent = (key: string) => {
    setEventTypes(prev => {
      const updated = prev.map(evt => {
        if (evt.key === key) {
          const nextState = !evt.enabled;
          if (onAppendLog) {
            onAppendLog("事件类型管理", `${nextState ? "一键开启" : "一键关闭停用"}事件分析: ${evt.name}`);
          }
          return { ...evt, enabled: nextState };
        }
        return evt;
      });
      return updated;
    });
  };

  return (
    <div className="flex-1 flex flex-col space-y-4.5 relative min-h-0 select-text font-sans bg-gray-50/10" id="event-type-management-view">
      
      {/* 1. Breadcrumbs */}
      <div className="text-[13px] text-gray-400 select-none animate-fadeIn pl-1">
        <span className="text-gray-600 font-medium">事件类型管理</span>
      </div>

      {/* 2. Main Large White Panel Card containing table layout without filter or editor */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[13.5px] border-collapse bg-white">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 select-none bg-white">
                <th className="pl-8 py-5 font-normal text-gray-400 text-[13px] w-[35%]">事件名称</th>
                <th className="py-5 font-normal text-gray-400 text-[13px] w-[45%]">事件说明</th>
                <th className="pr-8 py-5 font-normal text-gray-400 text-[13px] text-center w-[20%]">启用状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 font-sans">
              {eventTypes.map((evt) => {
                const isItemEnabled = evt.enabled;
                return (
                  <tr 
                    key={evt.key}
                    className={`transition-colors duration-150 ${
                      isItemEnabled 
                        ? "text-gray-800 hover:bg-gray-50/30" 
                        : "text-gray-300 hover:bg-gray-50/15"
                    }`}
                  >
                    {/* Event Name */}
                    <td className="pl-8 py-6.5 align-middle">
                      <span className={`font-semibold text-[14px] ${
                        isItemEnabled ? "text-gray-800" : "text-gray-300"
                      }`}>
                        {evt.name}
                      </span>
                    </td>

                    {/* Rule Description */}
                    <td className="py-6.5 align-middle leading-relaxed pr-8">
                      <span className={`font-normal ${isItemEnabled ? "text-gray-500" : "text-gray-300"}`}>
                        {evt.description}
                      </span>
                    </td>

                    {/* Enabled status toggler */}
                    <td className="pr-8 py-6.5 align-middle text-center">
                      <div className="inline-flex justify-center items-center">
                        <button
                          type="button"
                          onClick={() => handleToggleEvent(evt.key)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isItemEnabled ? "bg-blue-500" : "bg-gray-200"
                          }`}
                          title={isItemEnabled ? "点击一键关停停用" : "一键启用分析"}
                        >
                          <span
                            className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                              isItemEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {eventTypes.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 font-normal">
                    没有找到任何智能事件诊断项
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
