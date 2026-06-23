import React, { useState } from "react";
import {
  Camera,
  Search,
  RotateCw,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Check,
  X,
  AlertCircle,
  Eye,
  Settings,
  Grid,
  MapPin,
  Move,
  Lock,
  ChevronDown,
  Volume2,
  Clock
} from "lucide-react";

interface CameraItem {
  id: string;
  name: string;
  station: string;
  ip: string;
  status: "在线" | "离线";
  laneImage: string;
  boundingBox: {
    x: number; // percentage from left
    y: number; // percentage from top
    w: number; // percentage width
    h: number; // percentage height
  };
  pointsLane?: { x: number; y: number }[]; // Camera overall lane calibration ROI vertices
  pointsLevel1?: { x: number; y: number }[]; // Level 1 freeform polygon vertices
  pointsLevel2?: { x: number; y: number }[]; // Level 2 freeform polygon vertices
  boundedLanes: string;
  lastActiveTime: string;
  assignedEvents?: string[]; // assigned event keys list
  description?: string;
  liveStreamUrl?: string;
  analysisPlayUrl?: string;
  direction?: "前 (front)" | "后 (back)" | "侧 (side)" | "全景 (panorama)";
  isEnabled?: boolean;
  boundSpeakerId?: string; // Bound Sound Speaker ID
  boundSpeakerIds?: string[]; // Bound Sound Speaker IDs (Supports Multiple)
  prohibitedTimeEnabled?: boolean; // Control whether forbidden time slots are enabled
  prohibitedTimeStart?: string; // e.g. "02:00"
  prohibitedTimeEnd?: string; // e.g. "06:00"
}

interface CameraManagementViewProps {
  showAnnotations?: boolean;
  onAppendLog?: (module: string, action: string) => void;
  allowedStations?: string[];
}

export default function CameraManagementView({
  showAnnotations = true,
  onAppendLog,
  allowedStations = []
}: CameraManagementViewProps) {
  // Mock Toll Stations filtered dynamically
  const stations = React.useMemo(() => {
    const raw = ["永川西收费站", "永川南收费站", "永川东收费站", "荣昌东收费站"];
    const filtered = allowedStations && allowedStations.length > 0
      ? raw.filter(st => allowedStations.includes(st))
      : raw;
    return ["全部收费站", ...filtered];
  }, [allowedStations]);

  // Available event selection
  const ALL_EVENTS_MAPPING = React.useMemo(() => {
    const saved = localStorage.getItem("toll_sys_ai_event_types");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: any) => ({ key: e.key, name: e.name }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    return [
      { key: "pedestrian_intrusion", name: "行人安全监控" },
      { key: "motorcycle_intrusion", name: "两轮车安全监控" },
      { key: "forbidden_bus", name: "客车禁行时段管控" },
      { key: "forbidden_hazardous", name: "危险品车辆禁行时段管控" },
      { key: "staff_unattended", name: "工作人员进入安全提示" },
      { key: "barrier_anomaly", name: "栏杆异常" },
      { key: "wrongway_driver", name: "车辆逆行及闯卡" }
    ];
  }, []);

  const INITIAL_CAMERAS: CameraItem[] = [
    {
      id: "cam_301",
      name: "永川西入口前置抓拍高清1号机",
      station: "永川西收费站",
      ip: "192.168.12.44",
      status: "在线",
      laneImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60",
      boundingBox: { x: 15, y: 35, w: 45, h: 42 },
      pointsLane: [
        { x: 15, y: 72 },
        { x: 30, y: 35 },
        { x: 60, y: 35 },
        { x: 75, y: 72 }
      ],
      pointsLevel1: [
        { x: 24, y: 53 },
        { x: 31, y: 36 },
        { x: 59, y: 36 },
        { x: 66, y: 53 }
      ],
      pointsLevel2: [
        { x: 16, y: 70 },
        { x: 25, y: 54 },
        { x: 65, y: 54 },
        { x: 73, y: 70 }
      ],
      boundedLanes: "车道01-入口, 车道02-入口",
      lastActiveTime: "2026-06-17 15:24:11",
      assignedEvents: ["pedestrian_intrusion", "motorcycle_intrusion", "forbidden_bus", "forbidden_hazardous", "wrongway_driver"],
      boundSpeakerId: "yongchuan23",
      boundSpeakerIds: ["yongchuan23"],
      prohibitedTimeEnabled: true,
      prohibitedTimeStart: "02:00",
      prohibitedTimeEnd: "06:00"
    },
    {
      id: "cam_302",
      name: "永川西出口ETC车道快速抓拍辅助相机",
      station: "永川西收费站",
      ip: "192.168.12.45",
      status: "在线",
      laneImage: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60",
      boundingBox: { x: 28, y: 15, w: 52, h: 50 },
      pointsLane: [
        { x: 28, y: 65 },
        { x: 42, y: 15 },
        { x: 70, y: 15 },
        { x: 80, y: 65 }
      ],
      pointsLevel1: [
        { x: 35, y: 40 },
        { x: 42, y: 16 },
        { x: 69, y: 16 },
        { x: 74, y: 40 }
      ],
      pointsLevel2: [
        { x: 29, y: 63 },
        { x: 36, y: 41 },
        { x: 73, y: 41 },
        { x: 78, y: 63 }
      ],
      boundedLanes: "车道03-出口(ETC)",
      lastActiveTime: "2026-06-17 15:23:44",
      assignedEvents: ["barrier_anomaly", "wrongway_driver"],
      boundSpeakerId: "yongchuan24",
      boundSpeakerIds: ["yongchuan24"],
      prohibitedTimeEnabled: true,
      prohibitedTimeStart: "22:00",
      prohibitedTimeEnd: "06:00"
    },
    {
      id: "cam_303",
      name: "永川南入口超宽特种车道检测摄像机",
      station: "永川南收费站",
      ip: "192.168.14.81",
      status: "在线",
      laneImage: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=60",
      boundingBox: { x: 20, y: 40, w: 60, h: 45 },
      pointsLane: [
        { x: 20, y: 85 },
        { x: 32, y: 40 },
        { x: 68, y: 40 },
        { x: 80, y: 85 }
      ],
      pointsLevel1: [
        { x: 26, y: 60 },
        { x: 33, y: 41 },
        { x: 67, y: 41 },
        { x: 74, y: 60 }
      ],
      pointsLevel2: [
        { x: 21, y: 82 },
        { x: 27, y: 61 },
        { x: 73, y: 61 },
        { x: 78, y: 82 }
      ],
      boundedLanes: "车道05-入口(超宽车道)",
      lastActiveTime: "2026-06-17 15:20:02",
      assignedEvents: ["pedestrian_intrusion", "forbidden_bus", "forbidden_hazardous", "barrier_anomaly"],
      boundSpeakerId: "",
      boundSpeakerIds: [],
      prohibitedTimeEnabled: false,
      prohibitedTimeStart: "02:00",
      prohibitedTimeEnd: "06:00"
    },
    {
      id: "cam_304",
      name: "荣昌东出口车牌防倒卡防漏扣球型高速机",
      station: "荣昌东收费站",
      ip: "192.168.16.12",
      status: "在线",
      laneImage: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=800&auto=format&fit=crop&q=60",
      boundingBox: { x: 10, y: 30, w: 75, h: 55 },
      pointsLane: [
        { x: 10, y: 85 },
        { x: 25, y: 30 },
        { x: 70, y: 30 },
        { x: 85, y: 85 }
      ],
      pointsLevel1: [
        { x: 18, y: 55 },
        { x: 26, y: 31 },
        { x: 69, y: 31 },
        { x: 76, y: 55 }
      ],
      pointsLevel2: [
        { x: 11, y: 82 },
        { x: 19, y: 56 },
        { x: 75, y: 56 },
        { x: 83, y: 82 }
      ],
      boundedLanes: "车道01-出口, 车道02-出口",
      lastActiveTime: "2026-06-17 15:18:19",
      assignedEvents: ["pedestrian_intrusion", "motorcycle_intrusion", "barrier_anomaly", "wrongway_driver"],
      boundSpeakerId: "",
      boundSpeakerIds: [],
      prohibitedTimeEnabled: false,
      prohibitedTimeStart: "02:00",
      prohibitedTimeEnd: "06:00"
    },
    {
      id: "cam_305",
      name: "永川东入口3号高怠速排气异常感温相机",
      station: "永川东收费站",
      ip: "192.168.11.39",
      status: "离线",
      laneImage: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=60",
      boundingBox: { x: 5, y: 50, w: 90, h: 35 },
      pointsLane: [
        { x: 5, y: 85 },
        { x: 20, y: 50 },
        { x: 80, y: 50 },
        { x: 95, y: 85 }
      ],
      pointsLevel1: [
        { x: 12, y: 66 },
        { x: 21, y: 51 },
        { x: 79, y: 51 },
        { x: 88, y: 66 }
      ],
      pointsLevel2: [
        { x: 6, y: 82 },
        { x: 13, y: 67 },
        { x: 87, y: 67 },
        { x: 93, y: 82 }
      ],
      boundedLanes: "车道04-入口",
      lastActiveTime: "2026-06-17T11:05:00",
      assignedEvents: ["staff_unattended", "barrier_anomaly"],
      boundSpeakerId: "",
      boundSpeakerIds: [],
      prohibitedTimeEnabled: false,
      prohibitedTimeStart: "02:00",
      prohibitedTimeEnd: "06:00"
    }
  ];

  // Pre-seed 6 typical highway surveillance cameras with localStorage persistence
  const [cameras, setCameras] = useState<CameraItem[]>(() => {
    const saved = localStorage.getItem("toll_sys_cameras");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cam: any) => {
            if (cam.pointsLane === undefined) {
              cam.pointsLane = cam.pointsLevel1 || [];
            }
            if (cam.boundSpeakerId === undefined) {
              if (cam.id === "cam_301") cam.boundSpeakerId = "yongchuan23";
              else if (cam.id === "cam_302") cam.boundSpeakerId = "yongchuan24";
              else cam.boundSpeakerId = "";
            }
            if (cam.boundSpeakerIds === undefined) {
              if (cam.boundSpeakerId) {
                cam.boundSpeakerIds = [cam.boundSpeakerId];
              } else {
                cam.boundSpeakerIds = [];
              }
            }
            if (cam.prohibitedTimeEnabled === undefined) {
              cam.prohibitedTimeEnabled = (cam.id === "cam_301" || cam.id === "cam_302");
            }
            if (cam.prohibitedTimeStart === undefined) {
              cam.prohibitedTimeStart = cam.id === "cam_302" ? "22:00" : "02:00";
            }
            if (cam.prohibitedTimeEnd === undefined) {
              cam.prohibitedTimeEnd = "06:00";
            }
            if (Array.isArray(cam.assignedEvents)) {
              if (cam.assignedEvents.includes("forbidden_truck")) {
                const filtered = cam.assignedEvents.filter((x: string) => x !== "forbidden_truck");
                if (!filtered.includes("forbidden_bus")) filtered.push("forbidden_bus");
                if (!filtered.includes("forbidden_hazardous")) filtered.push("forbidden_hazardous");
                cam.assignedEvents = filtered;
              }
            }
            return cam;
          });
        }
      } catch (err) {
        console.error("Failed to load cameras state", err);
      }
    }
    return INITIAL_CAMERAS;
  });

  // Automatically sync cameras list changes to localStorage
  React.useEffect(() => {
    localStorage.setItem("toll_sys_cameras", JSON.stringify(cameras));
  }, [cameras]);

  // Filters State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [filterStation, setFilterStation] = useState<string>("全部收费站");
  const [searchName, setSearchName] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Active Selected Camera for calibration and modal
  const [activeCam, setActiveCam] = useState<CameraItem | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<"level1" | "level2">("level1");
  const [tempPointsLevel1, setTempPointsLevel1] = useState<{ x: number; y: number }[]>([]);
  const [tempPointsLevel2, setTempPointsLevel2] = useState<{ x: number; y: number }[]>([]);
  const [calibrationHistory, setCalibrationHistory] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<{ level: "level1" | "level2"; index: number } | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [calibrationBox, setCalibrationBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 50,
    h: 50
  });

  // State to support full resolution lane snapshot viewing
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
    pointsLevel1?: { x: number; y: number }[];
    pointsLevel2?: { x: number; y: number }[];
  } | null>(null);

  // State for Level Calibration modal
  const [isLevelCalibrating, setIsLevelCalibrating] = useState<boolean>(false);
  const [activeLevelCam, setActiveLevelCam] = useState<CameraItem | null>(null);
  const [levelActiveTab, setLevelActiveTab] = useState<"level1" | "level2">("level1");
  const [levelTempPoints1, setLevelTempPoints1] = useState<{ x: number; y: number }[]>([]);
  const [levelTempPoints2, setLevelTempPoints2] = useState<{ x: number; y: number }[]>([]);
  const [levelHistory, setLevelHistory] = useState<string[]>([]);
  const [levelDraggedIndex, setLevelDraggedIndex] = useState<{ level: "level1" | "level2"; index: number } | null>(null);
  const levelCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Modal State for adding/editing camera
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Load speakers list to bind
  const [availableSpeakersList, setAvailableSpeakersList] = useState<{ id: string; name: string; station?: string, associatedCameraId?: string }[]>([]);

  const loadSpeakersFromStorage = () => {
    const saved = localStorage.getItem("highway_devices_list_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAvailableSpeakersList(parsed.map((d: any) => ({
            id: d.id,
            name: d.name || `音响设备 (${d.id})`,
            station: d.station,
            associatedCameraId: d.associatedCameraId
          })));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    loadSpeakersFromStorage();
  }, [isEditModalOpen]);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalCamera, setModalCamera] = useState<Partial<CameraItem>>({
    name: "",
    station: "永川收费站",
    ip: "192.168.110.234",
    status: "在线",
    boundedLanes: "",
    laneImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    assignedEvents: [],
    description: "",
    liveStreamUrl: "",
    analysisPlayUrl: "rtmp://192.168.110.234/live/livestream/livestream",
    direction: "后 (back)",
    isEnabled: true
  });

  // Event Assignment States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignCamera, setAssignCamera] = useState<CameraItem | null>(null);
  const [tempAssignedEvents, setTempAssignedEvents] = useState<string[]>([]);

  const handleOpenAssignEvents = (cam: CameraItem) => {
    setAssignCamera(cam);
    setTempAssignedEvents(cam.assignedEvents || []);
    setIsAssignModalOpen(true);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAssignModalOpen(false);
        setAssignCamera(null);
      }
    };
    if (isAssignModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAssignModalOpen]);

  const handleToggleAssignEvent = (key: string) => {
    if (!assignCamera) return;
    
    let updatedEvents: string[] = [];
    setTempAssignedEvents(prev => {
      const exists = prev.includes(key);
      if (exists) {
        updatedEvents = prev.filter(k => k !== key);
      } else {
        updatedEvents = [...prev, key];
      }
      return updatedEvents;
    });

    // Update state instantly so clicking saves immediately
    setCameras(prev => prev.map(c => {
      if (c.id === assignCamera!.id) {
        return {
          ...c,
          assignedEvents: updatedEvents
        };
      }
      return c;
    }));

    if (onAppendLog) {
      onAppendLog("设备管理", `【摄像头管理】修改了摄像头 [${assignCamera.name}] 的算法事件分配。当前分派: [${updatedEvents.map(k => ALL_EVENTS_MAPPING.find(em => em.key === k)?.name || k).join(", ")}]`);
    }
  };

  // visible cameras based on permissions
  const visibleCameras = React.useMemo(() => {
    if (allowedStations && allowedStations.length > 0) {
      return cameras.filter(cam => allowedStations.includes(cam.station));
    }
    return cameras;
  }, [cameras, allowedStations]);

  // Handle Search and Filter
  const filteredCameras = visibleCameras.filter((cam) => {
    const matchesStation = filterStation === "全部收费站" || cam.station === filterStation;
    const matchesName = !searchName.trim() || cam.name.toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesStatus = filterStatus === "全部" || cam.status === filterStatus;
    const matchesSearch =
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.ip.includes(searchQuery) ||
      cam.boundedLanes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesName && matchesStatus && matchesSearch;
  });

  // Pagination calculation
  const totalItems = filteredCameras.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCameras = filteredCameras.slice(startIndex, startIndex + itemsPerPage);

  // Trigger Log and State changes
  const handleDeleteCamera = (id: string, name: string) => {
    setDeleteTargetId(id);
  };

  const handleOpenEditModal = (cam?: CameraItem) => {
    if (cam) {
      setModalMode("edit");
      setModalCamera({
        ...cam,
        description: cam.description !== undefined ? cam.description : "本地推流测试",
        liveStreamUrl: cam.liveStreamUrl !== undefined ? cam.liveStreamUrl : "rtsp://...",
        analysisPlayUrl: cam.analysisPlayUrl !== undefined ? cam.analysisPlayUrl : "rtmp://192.168.110.234/live/livestream/livestream",
        direction: cam.direction || "后 (back)",
        isEnabled: cam.isEnabled !== undefined ? cam.isEnabled : (cam.status === "在线"),
        boundSpeakerId: cam.boundSpeakerId || "",
        boundSpeakerIds: cam.boundSpeakerIds || (cam.boundSpeakerId ? [cam.boundSpeakerId] : []),
        prohibitedTimeEnabled: cam.prohibitedTimeEnabled !== undefined ? cam.prohibitedTimeEnabled : false,
        prohibitedTimeStart: cam.prohibitedTimeStart || "02:00",
        prohibitedTimeEnd: cam.prohibitedTimeEnd || "06:00"
      });
    } else {
      setModalMode("add");
      setModalCamera({
        id: "cam_" + Date.now(),
        name: "",
        station: "永川收费站",
        ip: "192.168.12." + (20 + Math.floor(Math.random() * 80)),
        status: "在线",
        laneImage: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
        boundingBox: { x: 20, y: 20, w: 40, h: 40 },
        boundedLanes: "",
        lastActiveTime: "2026-06-17 15:20:00",
        description: "",
        liveStreamUrl: "",
        analysisPlayUrl: "rtmp://192.168.110.234/live/livestream/livestream",
        direction: "后 (back)",
        isEnabled: true,
        boundSpeakerId: "",
        boundSpeakerIds: [],
        prohibitedTimeEnabled: false,
        prohibitedTimeStart: "02:00",
        prohibitedTimeEnd: "06:00"
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCamera.name || !modalCamera.boundedLanes) {
      alert("请填写视频摄像头名称与车道！");
      return;
    }

    const isEnabled = modalCamera.isEnabled !== false;
    const finalCam = {
      ...modalCamera,
      ip: modalCamera.ip || "192.168.110.234",
      status: isEnabled ? "在线" : "离线",
    } as CameraItem;

    if (modalMode === "add") {
      setCameras(prev => [finalCam, ...prev]);
      if (onAppendLog) {
        onAppendLog("设备管理", `【摄像头管理】成功新增并接入摄像头 [${finalCam.name}] (车道: ${finalCam.boundedLanes})`);
      }
    } else {
      setCameras(prev => prev.map(c => c.id === finalCam.id ? finalCam : c));
      if (onAppendLog) {
        onAppendLog("设备管理", `【摄像头管理】修改了摄像头 [${finalCam.name}] 的配置`);
      }
    }

    // Sync to speakers database in localStorage
    const speakersSaved = localStorage.getItem("highway_devices_list_db");
    if (speakersSaved) {
      try {
        const speakers = JSON.parse(speakersSaved);
        if (Array.isArray(speakers)) {
          const updatedSpeakers = speakers.map((spk: any) => {
            const isBoundNow = finalCam.boundSpeakerIds?.includes(spk.id);
            // Case 1: This speaker is currently bound to this camera
            if (isBoundNow) {
              return {
                ...spk,
                associatedCameraName: finalCam.name,
                associatedCameraId: finalCam.id
              };
            }
            // Case 2: This speaker was previously bound to this camera, but now this camera doesn't bind it
            if (spk.associatedCameraId === finalCam.id && !isBoundNow) {
              return {
                ...spk,
                associatedCameraName: "",
                associatedCameraId: ""
              };
            }
            return spk;
          });
          localStorage.setItem("highway_devices_list_db", JSON.stringify(updatedSpeakers));
        }
      } catch (errSync) {
        console.error("Failed to sync speakers list after camera change", errSync);
      }
    }

    setIsEditModalOpen(false);
  };

  // Start freeform polygon Lane calibration view
  const handleStartCalibration = (cam: CameraItem) => {
    setActiveCam(cam);
    setTempPointsLevel1(cam.pointsLane || cam.pointsLevel1 || []);
    setTempPointsLevel2([]);
    setActiveLevel("level1");
    setCalibrationBox(cam.boundingBox);
    setCalibrationHistory([]);
    setDraggedIndex(null);
    setIsCalibrating(true);
  };

  const getBoundingBoxFromPoints = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return { x: 10, y: 10, w: 50, h: 50 };
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: Math.round(minX),
      y: Math.round(minY),
      w: Math.round(maxX - minX),
      h: Math.round(maxY - minY)
    };
  };

  const handleSaveCalibration = () => {
    if (!activeCam) return;
    const nextBox = tempPointsLevel1.length > 0 ? getBoundingBoxFromPoints(tempPointsLevel1) : activeCam.boundingBox;
    const updated: CameraItem = {
      ...activeCam,
      pointsLane: tempPointsLevel1,
      boundingBox: nextBox
    };
    setCameras(prev => prev.map(c => c.id === activeCam.id ? updated : c));
    setIsCalibrating(false);
    setActiveCam(null);
    
    if (onAppendLog) {
      onAppendLog("摄像头管理", `【车道框定】成功：确定了相机 [${updated.name}] 的智能图像框定识别区范围（包含控制点: ${tempPointsLevel1.length} 个）。外部无关范围已自动暗色处理过滤。`);
    }
    alert("🎉 车道识别范围/感知区框定保存成功！外部无关区域将自动显示为暗色，已注入感知引擎系统。");
  };

  // Start Level Calibration view
  const handleStartLevelCalibration = (cam: CameraItem) => {
    setActiveLevelCam(cam);
    setLevelTempPoints1(cam.pointsLevel1 || []);
    setLevelTempPoints2(cam.pointsLevel2 || []);
    setLevelActiveTab("level1");
    setLevelHistory([]);
    setLevelDraggedIndex(null);
    setIsLevelCalibrating(true);
  };

  const handleSaveLevelCalibration = () => {
    if (!activeLevelCam) return;
    const updated: CameraItem = {
      ...activeLevelCam,
      pointsLevel1: levelTempPoints1,
      pointsLevel2: levelTempPoints2
    };
    setCameras(prev => prev.map(c => c.id === activeLevelCam.id ? updated : c));
    setIsLevelCalibrating(false);
    setActiveLevelCam(null);
    
    if (onAppendLog) {
      onAppendLog("摄像头管理", `【级别框定】成功：确定了相机 [${updated.name}] 的 Level1 判定区（包含控制点: ${levelTempPoints1.length} 个）与 Level2 判定区（包含控制点: ${levelTempPoints2.length} 个）。`);
    }
    alert("🎉 级别坐标框定配置保存成功！已成功注入设备智能判定感知区。");
  };

  const pushLevelHistoryState = () => {
    const serialized = JSON.stringify({
      level1: levelTempPoints1,
      level2: levelTempPoints2
    });
    setLevelHistory(prev => [...prev, serialized]);
  };

  const levelHasDraggedRef = React.useRef<boolean>(false);

  const handleLevelMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = levelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 1100;
    const y = ((e.clientY - rect.top) / rect.height) * 620;

    const points = levelActiveTab === "level1" ? levelTempPoints1 : levelTempPoints2;
    let foundIndex = -1;

    points.forEach((p, index) => {
      const px = (p.x / 100) * 1100;
      const py = (p.y / 100) * 620;
      const dis = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dis < 15) {
        foundIndex = index;
      }
    });

    if (foundIndex !== -1) {
      pushLevelHistoryState();
      setLevelDraggedIndex({ level: levelActiveTab, index: foundIndex });
      levelHasDraggedRef.current = false;
    }
  };

  const handleLevelMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!levelDraggedIndex) return;
    const canvas = levelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, pctX));
    const clampedY = Math.max(0, Math.min(100, pctY));
    
    const roundedX = Math.round(clampedX * 10) / 10;
    const roundedY = Math.round(clampedY * 10) / 10;

    levelHasDraggedRef.current = true;

    if (levelDraggedIndex.level === "level1") {
      setLevelTempPoints1(prev => {
        const copy = [...prev];
        copy[levelDraggedIndex.index] = { x: roundedX, y: roundedY };
        return copy;
      });
    } else {
      setLevelTempPoints2(prev => {
        const copy = [...prev];
        copy[levelDraggedIndex.index] = { x: roundedX, y: roundedY };
        return copy;
      });
    }
  };

  const handleLevelMouseUp = () => {
    setLevelDraggedIndex(null);
  };

  const handleLevelCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (levelHasDraggedRef.current) {
      levelHasDraggedRef.current = false;
      return;
    }

    const canvas = levelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const points = levelActiveTab === "level1" ? levelTempPoints1 : levelTempPoints2;
    let clickedClose = false;
    points.forEach(p => {
      const px = (p.x / 100) * 1100;
      const py = (p.y / 100) * 620;
      const xPx = (pctX / 100) * 1100;
      const yPx = (pctY / 100) * 620;
      const dis = Math.sqrt((xPx - px) ** 2 + (yPx - py) ** 2);
      if (dis < 15) {
        clickedClose = true;
      }
    });

    if (clickedClose) return;

    pushLevelHistoryState();

    const roundedX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
    const roundedY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;

    if (levelActiveTab === "level1") {
      setLevelTempPoints1(prev => [...prev, { x: roundedX, y: roundedY }]);
    } else {
      setLevelTempPoints2(prev => [...prev, { x: roundedX, y: roundedY }]);
    }
  };

  const handleLevelClearPoints = () => {
    pushLevelHistoryState();
    if (levelActiveTab === "level1") {
      setLevelTempPoints1([]);
    } else {
      setLevelTempPoints2([]);
    }
  };

  const handleLevelUndoPoint = () => {
    if (levelHistory.length === 0) return;
    const previous = levelHistory[levelHistory.length - 1];
    setLevelHistory(prev => prev.slice(0, -1));
    try {
      const parsed = JSON.parse(previous);
      if (parsed.level1) setLevelTempPoints1(parsed.level1);
      if (parsed.level2) setLevelTempPoints2(parsed.level2);
    } catch (e) {
      console.error(e);
    }
  };

  const pushHistoryState = () => {
    const serialized = JSON.stringify({
      level1: tempPointsLevel1,
      level2: tempPointsLevel2
    });
    setCalibrationHistory(prev => [...prev, serialized]);
  };

  const hasDraggedRef = React.useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Pixel coordinates relative to canvas internal width (1100) and height (620)
    const x = ((e.clientX - rect.left) / rect.width) * 1100;
    const y = ((e.clientY - rect.top) / rect.height) * 620;

    const points = activeLevel === "level1" ? tempPointsLevel1 : tempPointsLevel2;
    let foundIndex = -1;

    points.forEach((p, index) => {
      const px = (p.x / 100) * 1100;
      const py = (p.y / 100) * 620;
      const dis = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dis < 15) { // pixel threshold radius for dragging
        foundIndex = index;
      }
    });

    if (foundIndex !== -1) {
      pushHistoryState();
      setDraggedIndex({ level: activeLevel, index: foundIndex });
      hasDraggedRef.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedIndex) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, pctX));
    const clampedY = Math.max(0, Math.min(100, pctY));
    
    const roundedX = Math.round(clampedX * 10) / 10;
    const roundedY = Math.round(clampedY * 10) / 10;

    hasDraggedRef.current = true;

    if (draggedIndex.level === "level1") {
      setTempPointsLevel1(prev => {
        const copy = [...prev];
        copy[draggedIndex.index] = { x: roundedX, y: roundedY };
        return copy;
      });
    } else {
      setTempPointsLevel2(prev => {
        const copy = [...prev];
        copy[draggedIndex.index] = { x: roundedX, y: roundedY };
        return copy;
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedIndex(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const points = activeLevel === "level1" ? tempPointsLevel1 : tempPointsLevel2;
    let clickedClose = false;
    points.forEach(p => {
      const px = (p.x / 100) * 1100;
      const py = (p.y / 100) * 620;
      const xPx = (pctX / 100) * 1100;
      const yPx = (pctY / 100) * 620;
      const dis = Math.sqrt((xPx - px) ** 2 + (yPx - py) ** 2);
      if (dis < 15) {
        clickedClose = true;
      }
    });

    if (clickedClose) return;

    pushHistoryState();

    const roundedX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
    const roundedY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;

    if (activeLevel === "level1") {
      setTempPointsLevel1(prev => [...prev, { x: roundedX, y: roundedY }]);
    } else {
      setTempPointsLevel2(prev => [...prev, { x: roundedX, y: roundedY }]);
    }
  };

  const handleClearPoints = () => {
    pushHistoryState();
    if (activeLevel === "level1") {
      setTempPointsLevel1([]);
    } else {
      setTempPointsLevel2([]);
    }
  };

  const handleUndoPoint = () => {
    if (calibrationHistory.length === 0) return;
    const previous = calibrationHistory[calibrationHistory.length - 1];
    setCalibrationHistory(prev => prev.slice(0, -1));
    try {
      const parsed = JSON.parse(previous);
      if (parsed.level1) setTempPointsLevel1(parsed.level1);
      if (parsed.level2) setTempPointsLevel2(parsed.level2);
    } catch (e) {
      console.error(e);
    }
  };

  // Canvas drawing useEffect
  React.useEffect(() => {
    if (!isCalibrating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear previous shapes
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bounding mask overlay: Auto-darken outside of Level 1 region (dim other areas to focus inside)
    if (tempPointsLevel1 && tempPointsLevel1.length > 2) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.72)"; // High-fidelity dark dimming overlay covering irrelevant area
      ctx.beginPath();
      // Outer rect covering the full canvas
      ctx.rect(0, 0, canvas.width, canvas.height);
      
      // Nested level 1 path
      const startX = (tempPointsLevel1[0].x / 100) * canvas.width;
      const startY = (tempPointsLevel1[0].y / 100) * canvas.height;
      ctx.moveTo(startX, startY);
      for (let i = 1; i < tempPointsLevel1.length; i++) {
        const px = (tempPointsLevel1[i].x / 100) * canvas.width;
        const py = (tempPointsLevel1[i].y / 100) * canvas.height;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      // evenodd fill option punches out the inner polygon (remains completely bright)
      ctx.fill("evenodd");
      ctx.restore();
    }

    // Draw the single lane calibration boundary / polygon block
    if (tempPointsLevel1 && tempPointsLevel1.length > 0) {
      ctx.beginPath();
      const startX = (tempPointsLevel1[0].x / 100) * 1100;
      const startY = (tempPointsLevel1[0].y / 100) * 620;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < tempPointsLevel1.length; i++) {
        const px = (tempPointsLevel1[i].x / 100) * 1100;
        const py = (tempPointsLevel1[i].y / 100) * 620;
        ctx.lineTo(px, py);
      }

      if (tempPointsLevel1.length > 2) {
        ctx.closePath();
        ctx.fillStyle = "rgba(250, 140, 22, 0.12)"; // Orange translucent fill
        ctx.fill();
      }

      ctx.strokeStyle = "#fa8c16"; // Bright vibrant neon-like orange boundary stroke
      ctx.lineWidth = 1; // Elegant thin boundary stroke to support accurate clicking alignment
      ctx.setLineDash([]);
      ctx.stroke();

      // Draw all control vertices/node handles
      tempPointsLevel1.forEach((p, index) => {
        const px = (p.x / 100) * 1100;
        const py = (p.y / 100) * 620;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fa8c16";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label first vertex for easier tracking
        if (index === 0) {
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#fa8c16";
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 3;
          ctx.fillText("起点", px + 10, py - 6);
          ctx.shadowBlur = 0;
        }
      });
    }

  }, [isCalibrating, tempPointsLevel1]);
 
  // Level Calibration canvas drawing useEffect
  React.useEffect(() => {
    if (!isLevelCalibrating || !levelCanvasRef.current) return;
    const canvas = levelCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    const drawRegion = (
      points: { x: number; y: number }[],
      fillColor: string,
      strokeColor: string,
      levelLabel: string
    ) => {
      if (points.length === 0) return;
 
      ctx.beginPath();
      const startX = (points[0].x / 100) * canvas.width;
      const startY = (points[0].y / 100) * canvas.height;
      ctx.moveTo(startX, startY);
 
      for (let i = 1; i < points.length; i++) {
        const px = (points[i].x / 100) * canvas.width;
        const py = (points[i].y / 100) * canvas.height;
        ctx.lineTo(px, py);
      }
 
      if (points.length > 2) {
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
 
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
 
      points.forEach((p, index) => {
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
 
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
 
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.fillText(
          (index + 1).toString(),
          px + 8,
          py - 8
        );
 
        if (index === 0) {
          ctx.fillStyle = strokeColor;
          ctx.font = "bold 12px Arial";
          ctx.fillText(levelLabel, px + 24, py - 8);
        }
      });
    };
 
    // Draw Level 1 (fill: rgba(0, 120, 255, 0.25), stroke: #ff4d4f)
    drawRegion(levelTempPoints1, "rgba(0, 120, 255, 0.25)", "#ff4d4f", "Level 1");
 
    // Draw Level 2 (fill: rgba(255, 170, 0, 0.25), stroke: #ffa500)
    drawRegion(levelTempPoints2, "rgba(255, 170, 0, 0.25)", "#ffa500", "Level 2");
 
  }, [isLevelCalibrating, levelTempPoints1, levelTempPoints2, levelActiveTab]);

  return (
    <div className="flex-1 flex flex-col space-y-4 relative min-h-0" id="camera-management-root">
      
      {/* 级别框定 & 自由拉线 Canvas Calibration Card Overlay */}
      {isCalibrating && activeCam && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-2xs flex items-center justify-center z-[100] p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-md border border-gray-200 w-[1160px] max-w-[95vw] shadow-2xl flex flex-col overflow-hidden max-h-[96vh] text-gray-900">
            
            {/* Header Dialog with Centered Title & Lucid Close Button */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-end items-center select-none relative h-14">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-base text-gray-950 tracking-wide font-sans">
                📷 车道识别范围/感知区框定
              </div>
              <button 
                onClick={() => setIsCalibrating(false)} 
                className="text-gray-400 hover:text-gray-700 transition duration-150 cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Custom Toolbar row with single-purpose guide for the single bounding box */}
            <div className="bg-white px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 text-orange-600 border border-orange-200 font-bold font-sans">
                    车道框定器
                  </span>
                  <span className="text-gray-500 font-sans font-medium text-xs">
                    提示：请使用鼠标在画面中依序点击绘制闭合的多边行（即判定边界），外部无关区域将自动显示为暗色并过滤。
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearPoints}
                  className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-sm text-xs font-medium cursor-pointer transition-colors"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={handleUndoPoint}
                  className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-sm text-xs font-medium cursor-pointer transition-colors"
                >
                  撤销
                </button>
              </div>
            </div>

            {/* Main Interactive Canvas Editor (No redundant sidebars to enable 100% spacious layout) */}
            <div className="p-0.5 bg-white flex flex-col items-center justify-center overflow-y-auto min-h-0">
              
              {/* Centered Canvas Container matching exactly 1100x620 view */}
              <div className="w-full flex justify-center items-center bg-white p-4">
                <div 
                  className="relative select-none border border-gray-300 bg-white overflow-hidden shadow-xs shrink-0"
                  style={{ width: "1100px", height: "620px" }}
                >
                  {/* Real high contrast lane/camera live background image */}
                  <img 
                    referrerPolicy="no-referrer"
                    src={activeCam.laneImage} 
                    alt="Lane Feed"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none block"
                  />

                  {/* High fidelity canvas calibration layer */}
                  <canvas
                    ref={canvasRef}
                    width={1100}
                    height={620}
                    className="absolute inset-0 cursor-crosshair z-10"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleCanvasClick}
                  />

                  {/* Watermark telemetry stats header details on overlay image */}
                  {activeCam.name && (
                    <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-3xs text-white/95 font-sans font-medium text-[15px] px-3 py-1.5 rounded-sm pointer-events-none select-none z-20">
                      {activeCam.name}检测
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer with Confirm/Cancel Buttons */}
            <div className="px-6 py-4.5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsCalibrating(false)}
                className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-sm text-xs font-semibold tracking-wide transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCalibration}
                className="px-6 py-2 bg-[#1890ff] hover:bg-blue-600 border border-[#1890ff] text-white rounded-sm text-xs font-semibold tracking-wide transition shadow-xs cursor-pointer"
              >
                配置
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 级别框定 Modal Overlay */}
      {isLevelCalibrating && activeLevelCam && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-2xs flex items-center justify-center z-[100] p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-md border border-gray-200 w-[1160px] max-w-[95vw] shadow-2xl flex flex-col overflow-hidden max-h-[96vh] text-gray-900">
            
            {/* Header Dialog */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center relative h-14">
              <span className="font-bold text-base text-gray-950 tracking-wide font-sans">
                级别框定 - {activeLevelCam.name}
              </span>
              <button 
                onClick={() => setIsLevelCalibrating(false)} 
                className="text-gray-400 hover:text-gray-700 transition duration-150 cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Custom Toolbar row in example HTML */}
            <div className="bg-white px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevelActiveTab("level1")}
                  className={`px-4 py-2 text-xs font-bold rounded border cursor-pointer transition ${
                    levelActiveTab === "level1"
                      ? "bg-[#1890ff] text-white border-[#1890ff]"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  框定Level1
                </button>
                <button
                  type="button"
                  onClick={() => setLevelActiveTab("level2")}
                  className={`px-4 py-2 text-xs font-bold rounded border cursor-pointer transition ${
                    levelActiveTab === "level2"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  框定Level2
                </button>
                <span className="text-gray-400 text-xs ml-2 font-sans font-medium">
                  提示：通过上方按钮切换激活级别。在画面中点击添加节点，直接拖拽节点可调整位置。
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLevelClearPoints}
                  className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-805 border border-gray-200 rounded-sm text-xs font-medium cursor-pointer transition-colors"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={handleLevelUndoPoint}
                  className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-805 border border-gray-200 rounded-sm text-xs font-medium cursor-pointer transition-colors"
                >
                  撤销
                </button>
              </div>
            </div>

            {/* Main Interactive Canvas Editor */}
            <div className="p-0.5 bg-white flex flex-col items-center justify-center overflow-y-auto min-h-0">
              <div className="w-full flex justify-center items-center bg-white p-4">
                <div 
                  className="relative select-none border border-gray-300 bg-white overflow-hidden shadow-xs shrink-0"
                  style={{ width: "1100px", height: "620px" }}
                >
                  {/* Background Live Camera Feed */}
                  <img 
                    referrerPolicy="no-referrer"
                    src={activeLevelCam.laneImage} 
                    alt="Level Lane Feed"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none block"
                  />

                  {/* Superimposed SVG polygon bounding with mask for dimming outside of Lane Calibration (pointsLane) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <mask id={`mask-lane-level-calib-${activeLevelCam.id}`}>
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        {((activeLevelCam.pointsLane || []).length > 1) && (
                          <polygon
                            points={(activeLevelCam.pointsLane || []).map(p => `${p.x},${p.y}`).join(" ")}
                            fill="black"
                          />
                        )}
                      </mask>
                    </defs>
                    
                    {((activeLevelCam.pointsLane || []).length > 1) ? (
                      <>
                        {/* Dim overlay everywhere EXCEPT inside the polygon */}
                        <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.72)" mask={`url(#mask-lane-level-calib-${activeLevelCam.id})`} />
                        {/* Highlight boundary - borderless with subtle overlay fill/dim contrast */}
                        <polygon
                          points={(activeLevelCam.pointsLane || []).map(p => `${p.x},${p.y}`).join(" ")}
                          fill="rgba(250, 140, 22, 0.05)"
                        />
                      </>
                    ) : (
                      /* Fully dim if no calibration points found */
                      <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.55)" />
                    )}
                  </svg>

                  {/* Level drawing canvas */}
                  <canvas
                    ref={levelCanvasRef}
                    width={1100}
                    height={620}
                    className="absolute inset-0 cursor-crosshair z-10"
                    onMouseDown={handleLevelMouseDown}
                    onMouseMove={handleLevelMouseMove}
                    onMouseUp={handleLevelMouseUp}
                    onMouseLeave={handleLevelMouseUp}
                    onClick={handleLevelCanvasClick}
                  />

                  {/* Top-left identification tag */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-3xs text-white/95 font-sans font-medium text-[15px] px-3 py-1.5 rounded-sm pointer-events-none select-none z-20">
                    {activeLevelCam.name}级别判定
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer with Confirm/Cancel Buttons */}
            <div className="px-6 py-4.5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsLevelCalibrating(false)}
                className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-sm text-xs font-semibold tracking-wide transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveLevelCalibration}
                className="px-6 py-2 bg-[#1890ff] hover:bg-blue-600 border border-[#1890ff] text-white rounded-sm text-xs font-semibold tracking-wide transition shadow-xs cursor-pointer"
              >
                配置
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1. Header Navigation Path Block */}
      <div className="flex flex-col space-y-1.5 select-none" id="camera-header-path">
        <div className="text-[12.5px] text-gray-400 flex items-center gap-1.5">
          <span>设备管理</span>
          <span>/</span>
          <span className="text-gray-700 font-medium font-sans">摄像头管理</span>
        </div>
      </div>

      {/* 2. Main Container Box matching the screenshot style exactly */}
      <div className="bg-white border border-gray-200 rounded p-6 shadow-xs flex flex-col space-y-5" id="camera-main-card">
        
        {/* 2.1 Filter Forms Area & Actions Bar merged into a single row */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-1 text-xs text-gray-700 border-b border-gray-100 pb-3" id="camera-filters-bar">
          
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Station filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium whitespace-nowrap text-xs">所属收费站</span>
              <select
                value={filterStation}
                onChange={(e) => {
                  setFilterStation(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-700 h-8 cursor-pointer font-sans"
              >
                {stations.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium whitespace-nowrap text-xs">设备状态</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-700 h-8 cursor-pointer font-sans"
              >
                <option value="全部">全部</option>
                <option value="在线">在线</option>
                <option value="离线">离线</option>
              </select>
            </div>

            {/* Name Search */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium whitespace-nowrap text-xs">摄像头名称</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="请输入名称"
                  value={searchName}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded pl-3 pr-8 py-1.5 text-xs outline-none focus:border-blue-500 w-44 h-8 font-sans text-gray-700"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

          </div>

          <button
            onClick={() => handleOpenEditModal()}
            className="bg-[#1890ff] hover:bg-blue-600 text-white hover:text-white rounded text-xs px-4 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8 shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" />
            添加摄像头
          </button>

        </div>

        {/* 2.2 Table View Replicating Sample Grid Header Styles and Content */}
        <div className="overflow-x-auto w-full select-text border border-gray-200 rounded" id="camera-table-container">
          <table className="w-full text-center border-collapse text-xs">
            
            <thead>
              <tr className="bg-[#f5f5f5] h-11 text-gray-800 font-bold select-none border-b border-gray-200">
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700 w-16">序号</th>
                <th className="border-r border-gray-200 px-4 font-bold text-gray-700 text-left">摄像头</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">所属收费站</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">已绑定音响</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">车道原图</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">车道框定</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">级别框定</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">覆盖车道</th>
                <th className="border-r border-gray-200 px-3 font-semibold text-gray-700">设备状态</th>
                <th className="px-3 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCameras.length > 0 ? (
                paginatedCameras.map((cam, idx) => {
                  const serialNum = startIndex + idx + 1;
                  return (
                    <tr key={cam.id} className="h-20 hover:bg-slate-50 border-b border-gray-200 transition text-gray-750">
                      
                      {/* Serial Number */}
                      <td className="border-r border-gray-200 px-3 font-mono text-gray-500 text-center">
                        {serialNum}
                      </td>

                      {/* Camera Name & details inside block */}
                      <td className="border-r border-gray-200 px-4 text-left">
                        <div className="flex items-center gap-2.5">
                          <div className="leading-tight font-sans">
                            <div className="font-bold text-gray-800 flex items-center gap-1.5">
                              {cam.name}
                            </div>
                          </div>
                        </div>
                      </td>

                    {/* Toll Station */}
                    <td className="border-r border-gray-200 px-3 font-sans font-medium text-gray-800 text-center text-blue-650">
                      {cam.station}
                    </td>

                    {/* Bound Speaker Column */}
                    <td className="border-r border-gray-200 px-3 font-sans font-medium text-gray-800 text-center">
                      {(() => {
                        const ids = cam.boundSpeakerIds || (cam.boundSpeakerId ? [cam.boundSpeakerId] : []);
                        const boundSpeakers = availableSpeakersList.filter(s => ids.includes(s.id));
                        if (boundSpeakers.length === 0) {
                          return <span className="text-gray-400 font-normal">-</span>;
                        }
                        return (
                          <div className="flex flex-col gap-0.5 items-center justify-center">
                            {boundSpeakers.map(spk => (
                              <div key={spk.id} className="text-gray-805" title={`${spk.name} (${spk.id})`}>
                                {spk.name}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>



                    {/* Lane Image: click to enlarge or full display */}
                    <td className="border-r border-gray-200 px-3 select-none">
                      <div className="flex justify-center">
                        <div 
                          className="relative w-16 h-10 rounded border border-gray-200 overflow-hidden shadow-2xs group cursor-pointer" 
                          title="点击查看车道高清原图" 
                          onClick={() => setPreviewImage({ src: cam.laneImage, title: `${cam.name} - 车道图片预览` })}
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={cam.laneImage} 
                            alt="Lane Mini"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bounding Box Image Preview - Detection Region */}
                    <td className="border-r border-gray-200 px-3 select-none">
                      <div className="flex justify-center">
                        <div 
                          className="relative w-16 h-10 rounded border border-gray-200 overflow-hidden bg-slate-900 cursor-pointer shadow-3xs group" 
                          onClick={() => handleStartCalibration(cam)} 
                          title="点击此预览直接进入车道识别范围框定与校准"
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={cam.laneImage} 
                            alt="Lane Bounded"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                          />
                          {/* Superimposed SVG polygon bounding with mask for dimming outside */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <mask id={`mask-lane-${cam.id}`}>
                                <rect x="0" y="0" width="100" height="100" fill="white" />
                                {((cam.pointsLane || []).length > 1) && (
                                  <polygon
                                    points={(cam.pointsLane || []).map(p => `${p.x},${p.y}`).join(" ")}
                                    fill="black"
                                  />
                                )}
                              </mask>
                            </defs>
                            
                            {((cam.pointsLane || []).length > 1) ? (
                              <>
                                {/* Dim overlay everywhere EXCEPT inside the polygon */}
                                <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.72)" mask={`url(#mask-lane-${cam.id})`} />
                                {/* Highlight boundary - borderless with subtle overlay fill/dim contrast */}
                                <polygon
                                  points={(cam.pointsLane || []).map(p => `${p.x},${p.y}`).join(" ")}
                                  fill="rgba(250, 140, 22, 0.08)"
                                />
                              </>
                            ) : (
                              /* Fully dim if no calibration points */
                              <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.55)" />
                            )}
                          </svg>
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Sliders className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute top-0 right-0 bg-[#fa8c16] text-white text-[7px] px-1 rounded-sm font-bold font-sans select-none">
                            ROI
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bounding Box Image Preview - Level Calibration Region */}
                    <td className="border-r border-gray-200 px-3 select-none">
                      <div className="flex justify-center">
                        <div 
                          className="relative w-16 h-10 rounded border border-gray-200 overflow-hidden bg-slate-900 cursor-pointer shadow-3xs group" 
                          onClick={() => handleStartLevelCalibration(cam)} 
                          title="点击此预览直接配置或修改该相机的级别区域（Level 1 & Level 2）"
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={cam.laneImage} 
                            alt="Level Bounded"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                          />
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <mask id={`mask-level-lane-${cam.id}`}>
                                <rect x="0" y="0" width="100" height="100" fill="white" />
                                {((cam.pointsLane || []).length > 1) && (
                                  <polygon
                                    points={(cam.pointsLane || []).map(p => `${p.x},${p.y}`).join(" ")}
                                    fill="black"
                                  />
                                )}
                              </mask>
                            </defs>

                            {/* Mask overlay outside pointsLane to make it slightly dim */}
                            {((cam.pointsLane || []).length > 1) ? (
                              <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.65)" mask={`url(#mask-level-lane-${cam.id})`} />
                            ) : (
                              <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.4)" />
                            )}

                            {/* Draw Level 1 if exists */}
                            {((cam.pointsLevel1 || []).length > 1) && (
                              <polygon
                                points={(cam.pointsLevel1 || []).map(p => `${p.x},${p.y}`).join(" ")}
                                fill="rgba(255, 77, 79, 0.15)"
                                stroke="#ff4d4f"
                                strokeWidth="1.5"
                              />
                            )}
                            {/* Draw Level 2 if exists */}
                            {((cam.pointsLevel2 || []).length > 1) && (
                              <polygon
                                points={(cam.pointsLevel2 || []).map(p => `${p.x},${p.y}`).join(" ")}
                                fill="rgba(255, 165, 0, 0.15)"
                                stroke="#ffa500"
                                strokeWidth="1.5"
                              />
                            )}
                          </svg>
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Grid className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-[7px] px-1 rounded-sm font-bold font-sans select-none">
                            LEVELS
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bounded Lane names */}
                    <td className="border-r border-gray-200 px-3 text-gray-700 font-semibold font-sans">
                      {cam.boundedLanes}
                    </td>

                    {/* Device Status Styled like Speaker Status */}
                    <td className="border-r border-gray-200 px-3 text-center">
                      {cam.status === "在线" ? (
                        <span className="text-emerald-600 font-medium font-sans">
                          在线
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium font-sans">
                          离线
                        </span>
                      )}
                    </td>

                    {/* Action controls */}
                    <td className="px-3 select-none">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenAssignEvents(cam)}
                          className="text-emerald-650 hover:text-emerald-850 font-semibold hover:underline cursor-pointer"
                          title="指定该摄像头单独参与对哪些AI事件类型的识别与报警推送"
                        >
                          <span>事件分配</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cam)}
                          className="text-gray-500 hover:text-gray-800 font-semibold hover:underline cursor-pointer"
                          title="修改摄像头基本通讯或属性"
                        >
                          <span>编辑</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCamera(cam.id, cam.name)}
                          className="text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer"
                          title="删除注销此工业相机"
                        >
                          <span>删除</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ); })
              ) : (
                <tr className="h-28">
                  <td colSpan={9} className="text-gray-400 text-center border-b border-gray-200">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <AlertCircle className="w-5 h-5 text-gray-350" />
                      <span>未查询到相匹配的摄像头或辅助相机记录</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* 2.3 Pagination block matching screen design */}
        <div className="flex justify-between items-center pt-1 select-none" id="camera-table-footer">
          
          <div className="text-[11px] text-gray-400">
            <span>当前展示第 <strong className="text-gray-700 font-extrabold">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> 台 / 共 <strong>{totalItems}</strong> 台智能图像摄像头资源</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            
            {/* Prev bracket */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                currentPage === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              &lt;
            </button>

            {/* Page buttons */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold transition cursor-pointer ${
                    currentPage === p
                      ? "border-[#1890ff] text-[#1890ff] bg-white font-extrabold"
                      : "border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 bg-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next bracket */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                currentPage === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              &gt;
            </button>

          </div>

        </div>

      </div>

      {/* 3. Aesthetic Annotation Card suggest tags */}
      {showAnnotations && (
        <div className="border border-yellow-200 bg-yellow-50 bg-opacity-70 p-4 rounded-lg flex gap-3 select-none text-[11px] leading-relaxed text-yellow-800 border-dashed">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-gray-900 block text-xs">摄像头及 AI 框定车道区说明</span>
            <p>• <strong>车道框定机制</strong>：直接点击列表中相应相机的<strong>“车道框定 (ROI)” 预览图</strong>，即可开启高精度的可视化 ROI（Region of Interest）校准。调校滑块对准物理车道起杆线。</p>
            <p>• <strong>联动智能检测</strong>：此处框定的感应范围完美联动“工作台-实时监控”的特情识别逻辑，可有效过滤背景行驶车辆而专注于入口非机动车/行人拦截通告。</p>
            <div className="flex justify-between text-[10px] text-yellow-700/80 pt-1 font-bold">
              <span>四川高速科技一站式检测中心</span>
              <span>漂亮小狗💛</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit/Add Camera Dialog Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-[110] select-none p-4">
          <form 
            onSubmit={handleSaveCamera}
            className="bg-white border border-gray-150 rounded-[4px] w-full max-w-[560px] shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4.5 flex justify-between items-center bg-white">
              <span className="font-semibold text-gray-800 text-[16px] select-none">
                {modalMode === "edit" ? "编辑摄像头" : "新增摄像头"}
              </span>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-full hover:bg-gray-50"
                title="关闭"
              >
                <X className="w-5 h-5 font-light" />
              </button>
            </div>

            {/* Inputs Body */}
            <div className="p-6.5 space-y-5 text-[13px] text-gray-700 bg-white max-h-[60vh] overflow-y-auto">
              
              {/* Row 1: Toll Station */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  <span className="text-red-500 mr-1">*</span>收费站：
                </label>
                <div className="flex-1 ml-4 relative">
                  <select
                    value={modalCamera.station || "永川收费站"}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, station: e.target.value }))}
                    className="w-full appearance-none border border-gray-200 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 cursor-pointer pr-10 hover:border-gray-300 transition duration-150"
                  >
                    {stations.filter(st => st !== "全部收费站").map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Row 2: Bounded Lanes */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  <span className="text-red-500 mr-1">*</span>车道：
                </label>
                <div className="flex-1 ml-4 text-left">
                  <input
                    type="text"
                    required
                    placeholder="如: 出口6"
                    value={modalCamera.boundedLanes || ""}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, boundedLanes: e.target.value }))}
                    className="w-full border border-gray-250 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition placeholder-gray-300 font-sans"
                  />
                  <div className="text-[12px] text-gray-400 leading-normal mt-1.5 flex flex-col font-normal">
                    <span>可从已有车道中选择，或直接输入新车道名称（系统会在该收费站下自动创建）</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Camera Name */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  <span className="text-red-500 mr-1">*</span>名称：
                </label>
                <div className="flex-1 ml-4 text-left">
                  <input
                    type="text"
                    required
                    placeholder="请输入测试摄像头名称"
                    value={modalCamera.name || ""}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-250 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  描述：
                </label>
                <div className="flex-1 ml-4 text-left">
                  <input
                    type="text"
                    placeholder="请输入对此摄像头的描述"
                    value={modalCamera.description || ""}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-250 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Row 5: Live Stream Feed */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  直播源地址：
                </label>
                <div className="flex-1 ml-4 text-left">
                  <input
                    type="text"
                    placeholder="rtsp://"
                    value={modalCamera.liveStreamUrl || ""}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, liveStreamUrl: e.target.value }))}
                    className="w-full border border-gray-250 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition placeholder-gray-450 font-sans"
                  />
                  <div className="text-[12px] text-gray-400 leading-normal mt-1.5 font-normal">
                    摄像头原始 RTSP 取流地址，如 rtsp://admin:密码@IP/Streaming/Channels/101，用于转码推流与录像
                  </div>
                </div>
              </div>

              {/* Row 6: Analysis Play URL */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  分析播放地址：
                </label>
                <div className="flex-1 ml-4 text-left">
                  <input
                    type="text"
                    placeholder="请输入拉流分析地址"
                    value={modalCamera.analysisPlayUrl || ""}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, analysisPlayUrl: e.target.value }))}
                    className="w-full border border-gray-250 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition placeholder-gray-300 font-sans"
                  />
                  <div className="text-[12px] text-gray-400 leading-normal mt-1.5 font-normal">
                    分析服务实际拉流分析、前端预览使用的地址，通常是转码后的 RTMP/FLV 流
                  </div>
                </div>
              </div>

              {/* Row 6.5: Bounded Speaker Selection */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  关联音响设备：
                </label>
                <div className="flex-1 ml-4 text-left">
                  {(() => {
                    const stationSpeakers = availableSpeakersList.filter(spk => spk.station === modalCamera.station);
                    const filteredSpeakers = stationSpeakers.filter(
                      spk => !spk.associatedCameraId || spk.associatedCameraId === modalCamera.id
                    );
                    
                    if (stationSpeakers.length === 0) {
                      return (
                        <div className="text-gray-400 text-xs py-2 px-3 bg-gray-50 border border-gray-150 rounded select-none">
                          当前收费站 (<strong>{modalCamera.station}</strong>) 下暂无音响设备，请先到「音响管理」页面为此收费站增加并注册音响设备。
                        </div>
                      );
                    }
                    if (filteredSpeakers.length === 0) {
                      return (
                        <div className="text-amber-600 text-xs py-2 px-3 bg-amber-50 border border-amber-200 rounded select-none flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span>当前收费站所有音响设备均已被关联，无可用未关联音响。</span>
                        </div>
                      );
                    }
                    return (
                      <div className="border border-gray-200 rounded-[2px] bg-[#fdfdfd] p-3 max-h-[160px] overflow-y-auto space-y-1.5 shadow-3xs">
                        {filteredSpeakers.map((spk) => {
                          const currentIds = modalCamera.boundSpeakerIds || (modalCamera.boundSpeakerId ? [modalCamera.boundSpeakerId] : []);
                          const isChecked = currentIds.includes(spk.id);
                          return (
                            <label 
                              key={spk.id} 
                              className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-gray-50 transition cursor-pointer select-none text-[12.5px]"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let nextIds = [...currentIds];
                                  if (e.target.checked) {
                                    if (!nextIds.includes(spk.id)) nextIds.push(spk.id);
                                  } else {
                                    nextIds = nextIds.filter(id => id !== spk.id);
                                  }
                                  setModalCamera(prev => ({ 
                                    ...prev, 
                                    boundSpeakerIds: nextIds,
                                    // Keep single boundSpeakerId in sync for simple fallback mechanisms
                                    boundSpeakerId: nextIds[0] || ""
                                  }));
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-500 cursor-pointer"
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800 text-xs flex items-center gap-1">
                                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                                  {spk.name}
                                </span>
                                <span className="text-[10.5px] text-gray-400 font-mono">设备ID: {spk.id}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="text-[11.5px] text-gray-400 font-normal leading-normal mt-1 w-full">
                    当前收费站摄像头布控时，异常告警语音会同时推送到同一收费站的所绑定的关联音响设备
                  </div>
                </div>
              </div>

              {/* Row 7: Camera Direction */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-1.5 shrink-0 select-none">
                  摄像头方向：
                </label>
                <div className="flex-1 ml-4 relative">
                  <select
                    value={modalCamera.direction || "后 (back)"}
                    onChange={(e) => setModalCamera(prev => ({ ...prev, direction: e.target.value as any }))}
                    className="w-full appearance-none border border-gray-200 rounded-[2px] px-3.5 py-1.5 text-[13.5px] focus:outline-none focus:border-blue-500 bg-white text-gray-850 cursor-pointer pr-10 hover:border-gray-300 transition duration-150"
                  >
                    <option value="后 (back)">后 (back)</option>
                    <option value="前 (front)">前 (front)</option>
                    <option value="侧 (side)">侧 (side)</option>
                    <option value="全景 (panorama)">全景 (panorama)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Row 8: Status Radio Button Group */}
              <div className="flex items-start">
                <label className="w-[110px] text-right text-gray-700 text-[13.5px] font-normal pt-0.5 shrink-0 select-none">
                  状态：
                </label>
                <div className="flex-1 ml-4 flex items-center gap-6">
                  {/* Enable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="isEnabled" 
                      checked={modalCamera.isEnabled === true} 
                      onChange={() => setModalCamera(prev => ({ ...prev, isEnabled: true }))}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                      modalCamera.isEnabled === true 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {modalCamera.isEnabled === true && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-[13.5px] text-gray-850">启用</span>
                  </label>
                  
                  {/* Disable Radio */}
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="radio" 
                      name="isEnabled" 
                      checked={modalCamera.isEnabled === false} 
                      onChange={() => setModalCamera(prev => ({ ...prev, isEnabled: false }))}
                      className="sr-only"
                    />
                    <span className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${
                      modalCamera.isEnabled === false 
                        ? "border-[#1890ff] bg-white" 
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}>
                      {modalCamera.isEnabled === false && (
                        <span className="w-[8px] h-[8px] rounded-full bg-[#1890ff]" />
                      )}
                    </span>
                    <span className="text-[13.5px] text-gray-850">禁用</span>
                  </label>
                </div>
              </div>

              {/* Custom divider and dialog buttons footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4.5 border-t border-gray-100 select-none">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white rounded-[2px] text-[13px] transition font-normal cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white border border-[#1890ff] rounded-[2px] text-[13px] transition font-normal cursor-pointer"
                >
                  确定
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* 5. Camera Event Assignment Modal Dialog (Goal 2) */}
      {isAssignModalOpen && assignCamera && (
        <div 
          onClick={() => {
            setIsAssignModalOpen(false);
            setAssignCamera(null);
          }}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-[110] select-none p-4 cursor-pointer"
          title="点击空白区域关闭"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-lg w-full max-w-3xl shadow-xl p-8 relative flex flex-col cursor-default animate-fadeIn"
          >
            {/* Minimalist close icon button in the corner */}
            <button 
              type="button"
              onClick={() => {
                setIsAssignModalOpen(false);
                setAssignCamera(null);
              }}
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition cursor-pointer p-1 rounded-full hover:bg-gray-55"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_EVENTS_MAPPING.map(evt => {
                const isChecked = tempAssignedEvents.includes(evt.key);
                return (
                  <div 
                    key={evt.key}
                    onClick={() => handleToggleAssignEvent(evt.key)}
                    className={`p-4 rounded-md border cursor-pointer flex items-center gap-3.5 transition-all duration-150 select-none ${
                      isChecked 
                        ? "bg-[#f4fbf7] border-[#10b981] text-[#064e3b]" 
                        : "bg-white border-[#e5e7eb] text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {/* Custom Checkbox as shown in image */}
                    <div className="shrink-0">
                      {isChecked ? (
                        <div className="w-5 h-5 rounded-[4px] bg-[#0074e4] flex items-center justify-center text-white">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-[4px] border border-[#d1d5db] bg-white" />
                      )}
                    </div>

                    <div className="leading-snug select-none">
                      <div className={`font-bold text-[14px] ${isChecked ? "text-[#004785]" : "text-gray-800"}`}>
                        {evt.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. High Quality Lane Image Preview Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 select-none animate-fadeIn cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-md border border-gray-200 shadow-2xl w-[900px] max-w-[95vw] flex flex-col overflow-hidden max-h-[85vh] cursor-default text-gray-900"
          >
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center select-none h-14">
              <div className="font-semibold text-sm text-gray-800 tracking-wide font-sans">
                {previewImage.title}
              </div>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 transition duration-150 cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 flex items-center justify-center overflow-auto min-h-0">
              <div className="relative max-h-[60vh] max-w-full select-none rounded border border-gray-200 overflow-hidden shadow-xs bg-slate-900">
                <img 
                  referrerPolicy="no-referrer"
                  src={previewImage.src} 
                  alt="Lane Snapshot full size preview"
                  className="max-h-[60vh] max-w-full object-contain block"
                />
                
                {/* Dynamically overlay Level 1 mask if coordinate points are passed, ONLY if pointsLevel2 is not provided to keep existing "车道框定" view unchanged */}
                {previewImage.pointsLevel1 && previewImage.pointsLevel1.length > 1 && !previewImage.pointsLevel2 && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <mask id="modal-mask-l1-preview">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <polygon
                          points={previewImage.pointsLevel1.map(p => `${p.x},${p.y}`).join(" ")}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    
                    {/* Dark opacity covering everything outside the polygon */}
                    <rect 
                      x="0" 
                      y="0" 
                      width="100" 
                      height="100" 
                      fill="rgba(0, 0, 0, 0.72)" 
                      mask="url(#modal-mask-l1-preview)" 
                    />
                    
                    {/* Bright space showing the target region - borderless with soft tint overlay */}
                    <polygon
                      points={previewImage.pointsLevel1.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="rgba(250, 140, 22, 0.08)"
                    />
                  </svg>
                )}

                {/* Draw Level 1 and Level 2 regions clearly together if BOTH may exist and pointsLevel2 is explicitly passed */}
                {previewImage.pointsLevel2 && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    {previewImage.pointsLevel1 && previewImage.pointsLevel1.length > 0 && (
                      <polygon
                        points={previewImage.pointsLevel1.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="rgba(255, 77, 79, 0.2)"
                        stroke="#ff4d4f"
                        strokeWidth="1.5"
                      />
                    )}
                    {previewImage.pointsLevel2 && previewImage.pointsLevel2.length > 0 && (
                      <polygon
                        points={previewImage.pointsLevel2.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="rgba(255, 165, 0, 0.2)"
                        stroke="#ffa500"
                        strokeWidth="1.5"
                      />
                    )}
                  </svg>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-6 py-2 bg-[#1890ff] hover:bg-blue-600 border border-[#1890ff] text-white rounded-sm text-xs font-semibold tracking-wide transition cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId !== null && (() => {
        const target = cameras.find(c => c.id === deleteTargetId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[999] animate-fadeIn">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800 text-[13px]">
              <h3 className="text-sm font-bold text-gray-800 mb-3 block">确认移除工业相机</h3>
              <p className="text-gray-500 mb-5 leading-normal">
                确定要移除摄像头 <strong className="text-gray-800">【{target.name}】</strong> (设备ID: <span className="font-mono">{target.id}</span>) 吗？一旦移除，该机道的智能化视觉判定区域将停用并关闭对应的AI检测信道。
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
                    setCameras(prev => prev.filter(c => c.id !== deleteTargetId));
                    if (onAppendLog) {
                      onAppendLog("设备管理", `【摄像头管理】移除了工业相机配置: [${target.name}] (设备ID: ${target.id})`);
                    }

                    // Sync release speakers database in localStorage on deletion
                    const speakersSaved = localStorage.getItem("highway_devices_list_db");
                    if (speakersSaved) {
                      try {
                        const speakers = JSON.parse(speakersSaved);
                        if (Array.isArray(speakers)) {
                          const updatedSpeakers = speakers.map((spk: any) => {
                            if (spk.associatedCameraId === deleteTargetId) {
                              return {
                                ...spk,
                                associatedCameraId: "",
                                associatedCameraName: ""
                              };
                            }
                            return spk;
                          });
                          localStorage.setItem("highway_devices_list_db", JSON.stringify(updatedSpeakers));
                        }
                      } catch (errSync) {
                        console.error("Failed to sync speakers after camera deletion", errSync);
                      }
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
