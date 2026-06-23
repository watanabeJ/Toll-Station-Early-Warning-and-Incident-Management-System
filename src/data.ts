import { EventType, EventStatus, HandlerAction, TollStationEvent, TollStation, PermissionRole, OperationLog, DeviceItem } from "./types";

export const INITIAL_STATIONS: TollStation[] = [
  { id: "1", name: "永川南收费站", status: "启用", createdTime: "2024-10-21 10:45:22" },
  { id: "2", name: "永川西收费站", status: "启用", createdTime: "2024-10-21 10:45:22" },
  { id: "3", name: "永川东收费站", status: "禁用", createdTime: "2024-10-22 09:12:15" },
  { id: "4", name: "荣昌东收费站", status: "启用", createdTime: "2024-10-22 14:30:11" },
];

export const INITIAL_EVENTS: TollStationEvent[] = [
  {
    id: "9709708022",
    type: EventType.Pedestrian,
    station: "永川西收费站",
    alarmTime: "2024-10-21 10:45:22",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60" // simulated busy toll lane image
  },
  {
    id: "7989798",
    type: EventType.TwoWheeler,
    station: "永川西收费站",
    alarmTime: "2024-08-17 17:56:21",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989797",
    type: EventType.TwoPassenger,
    station: "永川南收费站",
    alarmTime: "2024-08-15 17:56:21",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Normal,
    handlerTime: "2024-08-15 17:56:21",
    handlerOpinion: "车辆劝返，已核实正常驶离",
    handlerName: "李华",
    snapshotUrl: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989796",
    type: EventType.StaffAlert,
    station: "永川东收费站",
    alarmTime: "2024-08-14 17:56:21",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989795",
    type: EventType.OneHazard,
    station: "荣昌东收费站",
    alarmTime: "2024-08-15 17:56:21",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Canceled,
    handlerTime: "2024-08-15 17:56:21",
    handlerOpinion: "拒不清障劝解，已上报路政配合处理部门设卡排查",
    handlerName: "张建国",
    snapshotUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989794",
    type: EventType.BarrierNormal,
    station: "永川西收费站",
    alarmTime: "2024-08-15 17:56:21",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Normal,
    handlerTime: "2024-08-15 17:56:21",
    handlerOpinion: "栏杆阻档线异常脱离，设备科王工已现场进行物理复位并重新加电",
    handlerName: "王伟",
    snapshotUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989793",
    type: EventType.Pedestrian,
    station: "永川南收费站",
    alarmTime: "2024-10-20 16:30:12",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989792",
    type: EventType.BarrierNormal,
    station: "永川西收费站",
    alarmTime: "2024-10-19 11:24:55",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Misreport,
    handlerTime: "2024-10-19 11:32:00",
    handlerOpinion: "大风导致栏杆微颤触发传感器误报，系统灵敏度已在后台做微调过滤",
    handlerName: "李华",
    snapshotUrl: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989791",
    type: EventType.TwoWheeler,
    station: "荣昌东收费站",
    alarmTime: "2024-10-21 16:12:00",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989790",
    type: EventType.Pedestrian,
    station: "永川南收费站",
    alarmTime: "2024-10-22 08:31:45",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989789",
    type: EventType.TwoPassenger,
    station: "永川西收费站",
    alarmTime: "2024-10-22 23:15:30",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989788",
    type: EventType.StaffAlert,
    station: "永川南收费站",
    alarmTime: "2024-10-23 10:20:11",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Normal,
    handlerTime: "2024-10-23 10:24:15",
    handlerOpinion: "收费人员短时离开交接，已核对确认无岗中违规",
    handlerName: "张建国",
    snapshotUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989787",
    type: EventType.BarrierNormal,
    station: "荣昌东收费站",
    alarmTime: "2024-10-23 14:05:00",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989786",
    type: EventType.Pedestrian,
    station: "永川西收费站",
    alarmTime: "2024-10-24 15:40:22",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Canceled,
    handlerTime: "2024-10-24 15:45:00",
    handlerOpinion: "行人在匝道外游荡拒不离开，已紧急增派站内治保人员进行驱离",
    handlerName: "李华",
    snapshotUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989785",
    type: EventType.TwoWheeler,
    station: "永川南收费站",
    alarmTime: "2024-10-25 09:11:33",
    status: EventStatus.Processed,
    handlerAction: HandlerAction.Normal,
    handlerTime: "2024-10-25 09:15:00",
    handlerOpinion: "误入摩托车，收费员通过IP对讲喊话引导其就地掉头驶离",
    handlerName: "张建国",
    snapshotUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "7989784",
    type: EventType.BarrierNormal,
    station: "永川东收费站",
    alarmTime: "2024-10-25 18:22:10",
    status: EventStatus.Pending,
    handlerAction: HandlerAction.None,
    handlerTime: "--",
    handlerOpinion: "",
    snapshotUrl: "https://images.unsplash.com/photo-1549449641-f10710a316a6?w=800&auto=format&fit=crop&q=60"
  }
];

export const INITIAL_ROLES: PermissionRole[] = [
  {
    id: "role_1",
    name: "超级管理员",
    description: "所有权限",
    enabled: true,
    authorizedMenus: [
      "workstation",
      "realtime",
      "eventList",
      "station",
      "permission",
      "account",
      "operation_log",
      "device_parent",
      "device",
      "device_speaker",
      "camera",
      "device_watch",
      "event_type",
      "upgrade_parent",
      "upgrade_outdoor",
      "upgrade_server"
    ],
  },
  {
    id: "role_2",
    name: "值班站长",
    description: "具备工作台实时查看、事件处理及部分日常管理操作权限",
    enabled: true,
    authorizedMenus: [
      "workstation",
      "realtime",
      "eventList",
      "station",
      "operation_log",
      "device_parent",
      "device",
      "device_speaker",
      "camera",
      "device_watch"
    ],
  },
  {
    id: "role_3",
    name: "前台收费员",
    description: "仅实时监控查看及事件紧急上报通知专属权限",
    enabled: true,
    authorizedMenus: [
      "workstation",
      "realtime",
      "eventList"
    ]
  }
];

export const INITIAL_LOGS: OperationLog[] = [
  { id: "log_1", loginIp: "112.351.78.85", operator: "admin", module: "权限管理", action: "新增", time: "2024-10-21 10:45:22" },
  { id: "log_2", loginIp: "112.351.78.85", operator: "admin", module: "权限管理", action: "编辑", time: "2024-10-21 11:15:30" },
  { id: "log_3", loginIp: "112.351.78.96", operator: "李华", module: "事件管理", action: "办结-正常", time: "2024-10-21 12:20:05" },
  { id: "log_4", loginIp: "111.45.162.203", operator: "张建国", module: "事件管理", action: "办结-劝阻无效", time: "2024-08-15 17:56:21" },
  { id: "log_5", loginIp: "112.351.78.85", operator: "admin", module: "收费站管理", action: "禁用 永川西收费站", time: "2024-10-22 09:30:12" },
  { id: "log_6", loginIp: "112.351.78.85", operator: "admin", module: "收费站管理", action: "启用 永川南收费站", time: "2024-10-22 09:31:00" },
  { id: "log_7", loginIp: "112.351.78.85", operator: "admin", module: "权限管理", action: "修改密码", time: "2024-10-25 10:36:22" }
];

export const INITIAL_DEVICES: DeviceItem[] = [
  { id: "dev_1", name: "超速抓拍高清球机-01", lane: "车道01-入口", type: "摄像机", status: "在线", lastCheckTime: "2026-06-17 15:00:00" },
  { id: "dev_2", name: "自动栏杆快速阻挡闸-01", lane: "车道01-入口", type: "自动栏杆机", status: "在线", lastCheckTime: "2026-06-17 15:02:10" },
  { id: "dev_3", name: "全彩红绿诱导屏-01", lane: "车道01-入口", type: "车道指示牌", status: "在线", lastCheckTime: "2026-06-17 14:55:00" },
  { id: "dev_4", name: "费数字信号显示屏-01", lane: "车道01-入口", type: "费显器", status: "离线", lastCheckTime: "2026-06-17 12:00:00" },
  { id: "dev_5", name: "车牌识别辅助相机制-02", lane: "车道02-出口", type: "摄像机", status: "在线", lastCheckTime: "2026-06-17 15:01:45" },
  { id: "dev_6", name: "栏杆抬杠力矩阻力器-02", lane: "车道02-出口", type: "自动栏杆机", status: "在线", lastCheckTime: "2026-06-17 15:01:00" }
];
