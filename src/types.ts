export enum EventType {
  Pedestrian = "行人安全监控",
  TwoWheeler = "两轮车安全监控",
  TwoPassenger = "客车禁行时段管控",
  OneHazard = "危险品车辆禁行时段管控",
  StaffAlert = "工作人员进入安全提示",
  BarrierNormal = "栏杆异常",
}

export enum EventStatus {
  Pending = "待处理",
  Processed = "已处理",
  NoState = "--",
}

export enum HandlerAction {
  Normal = "办结-正常",
  Canceled = "办结-劝阻无效",
  Misreport = "误报",
  None = "--",
}

export interface TollStationEvent {
  id: string;
  type: EventType;
  station: string;
  snapshotUrl?: string;
  alarmTime: string;
  status: EventStatus;
  handlerAction: HandlerAction;
  handlerTime: string;
  handlerOpinion: string;
  handlerName?: string;
}

export interface TollStation {
  id: string;
  name: string;
  status: "启用" | "禁用";
  createdTime: string;
}

export interface PermissionRole {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  authorizedMenus: string[]; // List of menu resource keys
}

export interface OperationLog {
  id: string;
  loginIp: string;
  operator: string;
  module: string;
  action: string;
  time: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  lane: string;
  type: "摄像机" | "自动栏杆机" | "车道指示牌" | "费显器";
  status: "在线" | "离线";
  lastCheckTime: string;
}

export function getEventTypeName(type: EventType): string {
  const t = type as any;
  const saved = typeof window !== 'undefined' ? localStorage.getItem("toll_sys_ai_event_types") : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        let key = "";
        if (t === EventType.Pedestrian || t === "行人安全监控" || t === "行人安全管控" || t === "pedestrian_intrusion") key = "pedestrian_intrusion";
        else if (t === EventType.TwoWheeler || t === "两轮车安全监控" || t === "两轮车安全管控" || t === "motorcycle_intrusion") key = "motorcycle_intrusion";
        else if (t === EventType.TwoPassenger || t === "客车禁行时段管控" || t === "两客禁行时段管控" || t === "forbidden_bus") key = "forbidden_bus";
        else if (t === EventType.OneHazard || t === "危险品车辆禁行时段管控" || t === "一危禁行时段管控" || t === "forbidden_hazardous") key = "forbidden_hazardous";
        else if (t === EventType.StaffAlert || t === "工作人员进入安全提示" || t === "staff_unattended") key = "staff_unattended";
        else if (t === EventType.BarrierNormal || t === "栏杆异常" || t === "barrier_anomaly") key = "barrier_anomaly";
        
        const found = parsed.find((e: any) => e.key === key);
        if (found) return found.name;
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  // Clean fallback mapping directly matching the newly updated names
  if (t === "行人安全管控" || t === "行人安全监控") return "行人安全监控";
  if (t === "两轮车安全管控" || t === "两轮车安全监控") return "两轮车安全监控";
  if (t === "两客禁行时段管控" || t === "客车禁行时段管控") return "客车禁行时段管控";
  if (t === "一危禁行时段管控" || t === "危险品车辆禁行时段管控") return "危险品车辆禁行时段管控";
  return type;
}
