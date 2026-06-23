import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ChevronDown, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock
} from "lucide-react";

interface UpgradeViewProps {
  category: "outdoor" | "server";
  onAppendLog?: (module: string, action: string) => void;
}

interface DeviceItem {
  id: string;
  station: string;
  status: "正常" | "离线";
  createdAt: string;
  lastUpgradedAt: string;
}

interface ServerFileItem {
  id: string;
  name: string;
  size: string;
  status: "上传成功" | "上传失败" | "上传40%..." | "待上传";
}

// Full mock data list matching the pagination and search filters
const ALL_OUTDOOR_DEVICES: DeviceItem[] = [
  // Page 1 devices
  { id: "yongchuan01", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan02", station: "大安收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan03", station: "永川西收费站", status: "离线", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 2 devices (EXACTLY THE THREE ROWS FROM THE SCREENSHOT!)
  { id: "yongchuan23", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan24", station: "永川南收费站", status: "离线", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan25", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 3 devices
  { id: "yongchuan26", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan27", station: "大安收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan28", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 4 devices
  { id: "yongchuan29", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan30", station: "大安收费站", status: "离线", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan31", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 5 devices
  { id: "yongchuan32", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan33", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "yongchuan34", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
];

const ALL_SERVER_DEVICES: DeviceItem[] = [
  // Page 1
  { id: "server-yc01", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc02", station: "大安收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc03", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 2
  { id: "server-yc23", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc24", station: "永川南收费站", status: "离线", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc25", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 3
  { id: "server-yc26", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc27", station: "大安收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc28", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 4
  { id: "server-yc29", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc30", station: "大安收费站", status: "离线", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc31", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  // Page 5
  { id: "server-yc32", station: "永川南收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc33", station: "永川西收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
  { id: "server-yc34", station: "双石收费站", status: "正常", createdAt: "2024/02/26 17:23:21", lastUpgradedAt: "2024/02/26 17:23:21" },
];

export default function UpgradeView({ category, onAppendLog }: UpgradeViewProps) {
  // Query Filter States
  const [filterStation, setFilterStation] = useState<string>("全部");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [filterDeviceId, setFilterDeviceId] = useState<string>("");

  // Droppdowns open
  const [showStationDrop, setShowStationDrop] = useState(false);
  const [showStatusDrop, setShowStatusDrop] = useState(false);

  // Active query parameters (applied on clicking '查询')
  const [searchParams, setSearchParams] = useState({
    station: "全部",
    status: "全部",
    deviceId: "",
  });

  // Checklist Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Default page is 2 to match the screenshot exactly!
  const [currentPage, setCurrentPage] = useState<number>(2);
  const pageSize = 3;

  // Active editable database state to simulate real Upgrade / Rollback
  const [devices, setDevices] = useState<DeviceItem[]>([]);

  // Initialize data list based on category
  useEffect(() => {
    if (category === "outdoor") {
      setDevices([...ALL_OUTDOOR_DEVICES]);
    } else {
      setDevices([...ALL_SERVER_DEVICES]);
    }
    // Default page index to 2 in order to display the targeted dataset
    setCurrentPage(2);
    setSelectedIds([]);
  }, [category]);

  // Server state declarations
  const [serverCurrentPage, setServerCurrentPage] = useState<number>(2);
  const [serverFilesMap, setServerFilesMap] = useState<Record<number, ServerFileItem[]>>({
    2: [
      { id: "s1", name: "文件名.bin", size: "40k", status: "上传成功" },
      { id: "s2", name: "这里格式是文件名+后缀", size: "40k", status: "上传失败" },
      { id: "s3", name: "文件名.txt", size: "40k", status: "上传40%..." },
      { id: "s4", name: "文件名.txt", size: "40k", status: "上传40%..." },
      { id: "s5", name: "文件名.txt", size: "40k", status: "待上传" },
    ],
    1: [
      { id: "s10", name: "升级配置补丁_1.0.9.json", size: "8k", status: "上传成功" },
      { id: "s11", name: "服务端安全认证秘钥.key", size: "2k", status: "上传成功" },
    ],
    3: [
      { id: "s12", name: "接口驱动文件_linux_amd64.so", size: "40k", status: "待上传" },
      { id: "s13", name: "日志分析模块_v2.1.tar.gz", size: "450k", status: "上传失败" },
    ],
    4: [
      { id: "s14", name: "中继器主数据库框架.sql", size: "120k", status: "待上传" },
    ],
    5: [
      { id: "s15", name: "静态网页资源分发包.zip", size: "3.2M", status: "上传40%..." },
    ]
  });

  const [isServerFilesUploading, setIsServerFilesUploading] = useState(false);
  const [isServerUpgrading, setIsServerUpgrading] = useState(false);
  const [serverUpgradeLog, setServerUpgradeLog] = useState<string>("");

  const handleServerFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    let sizeStr = "40k";
    if (file.size > 1024 * 1024) {
      sizeStr = (file.size / (1024 * 1024)).toFixed(1) + "M";
    } else {
      sizeStr = (file.size / 1024).toFixed(0) + "k";
    }

    const newItem: ServerFileItem = {
      id: "sf_" + Date.now(),
      name: file.name,
      size: sizeStr,
      status: "待上传"
    };

    setServerFilesMap(prev => ({
      ...prev,
      [serverCurrentPage]: [...(prev[serverCurrentPage] || []), newItem]
    }));

    if (onAppendLog) {
      onAppendLog("工控服务端", `选择并添加了本地待上传文件 [${file.name}] (${sizeStr})`);
    }
  };

  const handleServerFileDelete = (id: string, name: string) => {
    setServerFilesMap(prev => ({
      ...prev,
      [serverCurrentPage]: (prev[serverCurrentPage] || []).filter(item => item.id !== id)
    }));

    if (onAppendLog) {
      onAppendLog("工控服务端", `移除了工作区等待上传列表中的缓存文件 [${name}]`);
    }
  };

  const handleServerFilesUploadAction = () => {
    const files = serverFilesMap[serverCurrentPage] || [];
    const hasPending = files.some(f => f.status === "待上传");
    if (!hasPending) {
      alert("当前页没有检测到“待上传”状态的文件项目。");
      return;
    }

    setIsServerFilesUploading(true);

    setServerFilesMap(prev => {
      const pageFiles = prev[serverCurrentPage] || [];
      return {
        ...prev,
        [serverCurrentPage]: pageFiles.map(f => {
          if (f.status === "待上传") {
            return { ...f, status: "上传40%..." };
          }
          return f;
        })
      };
    });

    if (onAppendLog) {
      onAppendLog("工控服务端", "启用了批处理异步并发上传，正在分块传输底层文件包");
    }

    setTimeout(() => {
      setServerFilesMap(prev => {
        const pageFiles = prev[serverCurrentPage] || [];
        return {
          ...prev,
          [serverCurrentPage]: pageFiles.map(f => {
            if (f.status === "上传40%...") {
              return { ...f, status: "上传成功" };
            }
            return f;
          })
        };
      });
      setIsServerFilesUploading(false);
      
      if (onAppendLog) {
        onAppendLog("工控服务端", "已经通过网络并发写盘完成，上传通过验证。");
      }
    }, 1500);
  };

  const handleServerUpgradeAction = () => {
    const files = serverFilesMap[serverCurrentPage] || [];
    const hasSuccess = files.some(f => f.status === "上传成功");
    if (!hasSuccess) {
      alert("当前列表没有“上传成功”的合格固件包，无法进行服务端底层升级。");
      return;
    }

    setIsServerUpgrading(true);
    setServerUpgradeLog("正在解压校验分发补丁中...");

    if (onAppendLog) {
      onAppendLog("工控服务端", "向工控中心写入服务端升级指令，引导写盘并进入特情热升级程序");
    }

    setTimeout(() => {
      setServerUpgradeLog("物理写盘镜像校验 100% 成功，正进行系统无缝热更...");
      setTimeout(() => {
        setIsServerUpgrading(false);
        setServerUpgradeLog("");
        alert("🎉 服务端升级成功！最新配置文件与驱动库已平滑部署，服务自愈守护程序已启动。");
        if (onAppendLog) {
          onAppendLog("工控服务端", "服务端版本已平顺接管，新架构特征值已刷新运行。");
        }
      }, 1500);
    }, 1200);
  };

  // Map of device ID to its current version
  const [deviceVersions, setDeviceVersions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    ALL_OUTDOOR_DEVICES.forEach(d => {
      initial[d.id] = "v1.7";
    });
    ALL_SERVER_DEVICES.forEach(d => {
      initial[d.id] = "v1.7";
    });
    return initial;
  });

  // Upgrade Progress Simulator States (Individual Custom Modal)
  const [targetUpgradeDevice, setTargetUpgradeDevice] = useState<DeviceItem | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalFileName, setModalFileName] = useState("v2.bin");
  const [modalFileSizeStr, setModalFileSizeStr] = useState("3.21GB");
  const [modalProgress, setModalProgress] = useState(60); // Starts at 60% matching Left screenshot instantly!
  const [modalUploadStatus, setModalUploadStatus] = useState<'idle' | 'uploading' | 'success'>('uploading');
  const [modalUpgradeStatus, setModalUpgradeStatus] = useState<'idle' | 'upgrading' | 'success' | 'failed'>('idle');
  const [modalErrorReason, setModalErrorReason] = useState("");

  // Legacy/Batch Progress Simulator States
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);
  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([]);
  const [upgradeFinished, setUpgradeFinished] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  // Rollback dialog states
  const [rollbackDevice, setRollbackDevice] = useState<DeviceItem | null>(null);

  const stations = ["全部", "永川南收费站", "永川西收费站", "双石收费站", "大安收费站"];
  const statuses = ["全部", "正常", "离线"];

  // Handle Query Search action
  const handleQuery = () => {
    setSearchParams({
      station: filterStation,
      status: filterStatus,
      deviceId: filterDeviceId,
    });
    setCurrentPage(1); // Reset to first page on new query filter trigger
  };

  // Handle Reset filters
  const handleReset = () => {
    setFilterStation("全部");
    setFilterStatus("全部");
    setFilterDateRange("");
    setFilterDeviceId("");
    setSearchParams({
      station: "全部",
      status: "全部",
      deviceId: "",
    });
    setCurrentPage(2); // Back to default page 2 matching screenshot
    setSelectedIds([]);
  };

  // Filtered devices calculation
  const filteredDevices = devices.filter((item) => {
    const matchStation = searchParams.station === "全部" || item.station === searchParams.station;
    const matchStatus = searchParams.status === "全部" || item.status === searchParams.status;
    const matchDeviceId = !searchParams.deviceId || item.id.toLowerCase().includes(searchParams.deviceId.toLowerCase().trim());
    return matchStation && matchStatus && matchDeviceId;
  });

  // Paginated Slicing calculation
  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const visibleDevices = filteredDevices.slice(startIndex, startIndex + pageSize);

  // Toggle selection checklists
  const handleToggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    const visibleIds = visibleDevices.map(d => d.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...visibleIds])));
    }
  };

  // Formatted date generator for real upgrade logging
  const getFormattedDateTime = () => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  // Handlers for Custom Upgrade Modal file choosing
  const handleModalFileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModalFileName(file.name);
      const sizeInBytes = file.size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 1024) {
        setModalFileSizeStr(`${(sizeInMB / 1024).toFixed(2)}GB`);
      } else {
        setModalFileSizeStr(`${sizeInMB.toFixed(2)}MB`);
      }
      setModalProgress(0);
      setModalUploadStatus('idle');
      setModalUpgradeStatus('idle');
      setModalErrorReason("");
    }
  };

  // Trigger simulated file upload animation
  const triggerSimulateUploadAction = () => {
    if (modalProgress === 100) return;
    setModalUploadStatus('uploading');
    setModalUpgradeStatus('idle');
    setModalErrorReason("");
    
    let current = modalProgress === 100 ? 0 : modalProgress;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setModalUploadStatus('success');
      }
      setModalProgress(current);
    }, 150);
  };

  // Trigger simulated firmware flashing sequence
  const triggerSimulateUpgradeAction = () => {
    if (modalProgress < 100 || !targetUpgradeDevice) return;
    setModalUpgradeStatus('upgrading');

    setTimeout(() => {
      if (modalErrorReason) {
        // If simulated error is active
        setModalUpgradeStatus('failed');
        if (onAppendLog) {
          onAppendLog(
            category === "outdoor" ? "户外显示屏" : "工控服务端",
            `设备 [${targetUpgradeDevice.id}] 执行固件包检测升级失败: ${modalErrorReason}`
          );
        }
      } else {
        // Successful upgrade
        setModalUpgradeStatus('success');
        
        // Update version to v2.0
        setDeviceVersions(prev => ({
          ...prev,
          [targetUpgradeDevice.id]: "v2.0"
        }));

        // Update lastUpgradeTime in devices database
        const currentTime = getFormattedDateTime();
        setDevices(prev => prev.map(item => {
          if (item.id === targetUpgradeDevice.id) {
            return {
              ...item,
              lastUpgradedAt: currentTime
            };
          }
          return item;
        }));

        if (onAppendLog) {
          onAppendLog(
            category === "outdoor" ? "户外显示屏" : "工控服务端",
            `手动对设备 [${targetUpgradeDevice.id}] 执行固件包检测由 v1.7 升级至 v2.0 成功`
          );
        }
      }
    }, 1500);
  };

  // Trigger individual device upgrade sequence (Opens the custom interactive modal)
  const startUpgradeDevice = (device: DeviceItem) => {
    setTargetUpgradeDevice(device);
    setModalFileName("v2.bin");
    setModalFileSizeStr("3.21GB");
    setModalProgress(60); // Starts at 60% matching Left screenshot instantly!
    setModalUploadStatus('uploading');
    setModalUpgradeStatus('idle');
    setModalErrorReason("");
    setShowUpgradeModal(true);
  };

  // Trigger Batch Upgrade sequence
  const handleBatchUpgrade = () => {
    if (selectedIds.length === 0) {
      alert("请先在列表中勾选需要批量升级的设备！");
      return;
    }
    
    setTargetUpgradeDevice(null);
    setBatchMode(true);
    setIsUpgrading(true);
    setUpgradeProgress(0);
    setUpgradeFinished(false);

    setUpgradeLogs([
      `[批量控制器] 已捕获待升级设备序列数: [${selectedIds.length}] 组`,
      `[批量控制器] 建立多路总线并行网关，正在批量分发最新固件架构...`,
    ]);

    let count = 0;
    const timer = setInterval(() => {
      count += 10;
      setUpgradeProgress(count);

      if (count === 30) {
        setUpgradeLogs(prev => [
          ...prev, 
          ...selectedIds.map(id => `[分发队列] [OK] 升级信号成功下发至 -> [${id}]`)
        ]);
      } else if (count === 70) {
        setUpgradeLogs(prev => [...prev, `[状态监测] 批量设备正并发写入闪存区块 0x7E3F...`]);
      } else if (count >= 100) {
        clearInterval(timer);
        setUpgradeFinished(true);
        setUpgradeLogs(prev => [...prev, `[完成] 所有勾选设备批量同步升级操作均告成功，通道已切回监测状态。`]);

        // Log into database
        const currentTime = getFormattedDateTime();
        setDevices(prev => prev.map(item => {
          if (selectedIds.includes(item.id)) {
            return {
              ...item,
              lastUpgradedAt: currentTime
            };
          }
          return item;
        }));

        if (onAppendLog) {
          onAppendLog(
            category === "outdoor" ? "户外显示屏" : "工控服务端",
            `批量对设备 [${selectedIds.join(", ")}] 执行固件包检测升级成功`
          );
        }
      }
    }, 200);
  };

  // Trigger Rollback sequence
  const handleRollbackClick = (device: DeviceItem) => {
    setRollbackDevice(device);
  };

  const confirmRollbackExec = () => {
    if (!rollbackDevice) return;
    const currentTime = getFormattedDateTime();
    
    // Update target device's lastUpgradedAt or signal version downgrading
    setDevices(prev => prev.map(item => {
      if (item.id === rollbackDevice.id) {
        return {
          ...item,
          lastUpgradedAt: currentTime
        };
      }
      return item;
    }));

    if (onAppendLog) {
      onAppendLog(
        category === "outdoor" ? "户外显示屏" : "工控服务端",
        `对设备 [${rollbackDevice.id}] 执行固件驱动回退操作，重新拉取缓存镜像`
      );
    }

    setRollbackDevice(null);
    alert(`设备 [${rollbackDevice.id}] 固件版本已成功回退，恢复备用分区。`);
  };

  const checkAllSelectedOnPage = visibleDevices.length > 0 && visibleDevices.every(d => selectedIds.includes(d.id));

  return (
    <div className="flex-grow flex flex-col space-y-4 select-none pb-8" id="upgrade-view-root">
      
      {/* 1. Header Path Route Area (Matches Screenshot perfectly) */}
      <div className="text-[12px] font-semibold text-gray-800 flex items-center justify-between py-1 px-1 h-6">
        <span>升级包升级 / {category === "outdoor" ? "户外屏" : "服务端"}</span>
      </div>

      {/* 2. Main Container Box (Centered white board matching the screenshot) */}
      {category === "outdoor" ? (
        <div className="bg-white border border-gray-200 rounded p-6 shadow-xs flex flex-col space-y-5" id="upgrade-table-main-container">
          
          {/* 2.1 Filters & Actions Bar (All horizontally aligned like a real Antd form layout) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 justify-between pb-1" id="filter-action-row">
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-gray-700">
              
              {/* Filter 1: 所属收费站 dropdown select */}
              <div className="flex items-center gap-1.5" id="filter-station-select-box">
                <span className="text-gray-600 font-medium whitespace-nowrap text-xs">所属收费站</span>
                <div className="relative min-w-[124px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStationDrop(!showStationDrop);
                      setShowStatusDrop(false);
                    }}
                    className="bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none w-full h-8 text-left text-gray-700"
                  >
                    <span className="truncate">{filterStation}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
                  </button>

                  {showStationDrop && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-md z-30 max-h-48 overflow-y-auto">
                      {stations.map((st) => (
                        <div
                          key={st}
                          onClick={() => {
                            setFilterStation(st);
                            setShowStationDrop(false);
                          }}
                          className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700 font-mono"
                        >
                          {st}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter 2: 设备状态 dropdown select */}
              <div className="flex items-center gap-1.5" id="filter-status-select-box">
                <span className="text-gray-600 font-medium whitespace-nowrap text-xs">设备状态</span>
                <div className="relative min-w-[105px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusDrop(!showStatusDrop);
                      setShowStationDrop(false);
                    }}
                    className="bg-white border border-gray-300 rounded px-2.5 py-1.5 flex items-center justify-between text-xs cursor-pointer focus:outline-none w-full h-8 text-left text-gray-700"
                  >
                    <span>{filterStatus}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
                  </button>

                  {showStatusDrop && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-md z-30">
                      {statuses.map((st) => (
                        <div
                          key={st}
                          onClick={() => {
                            setFilterStatus(st);
                            setShowStatusDrop(false);
                          }}
                          className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700"
                        >
                          {st}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter 3: 最近一次升级 date range picker input */}
              <div className="flex items-center gap-1.5" id="filter-date-picker-box">
                <span className="text-gray-600 font-medium whitespace-nowrap text-xs">最近一次升级</span>
                <div className="relative min-w-[210px]">
                  <input
                    type="text"
                    placeholder="开始-结束 (年月日时分秒)"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-xs outline-none focus:border-blue-500 w-full h-8 font-sans placeholder-gray-400 text-gray-700"
                  />
                  <Calendar className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Filter 4: 设备ID enter input box */}
              <div className="flex items-center gap-1.5" id="filter-deviceid-box">
                <span className="text-gray-600 font-medium whitespace-nowrap text-xs">设备ID</span>
                <input
                  type="text"
                  placeholder="请输入"
                  value={filterDeviceId}
                  onChange={(e) => setFilterDeviceId(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-1 text-xs outline-none focus:border-blue-500 w-32 h-8 font-mono text-gray-700 placeholder-gray-400"
                />
              </div>

            </div>

            {/* Action buttons on the right matching colors exactly */}
            <div className="flex items-center gap-2" id="filter-actions-actions">
              <button
                onClick={handleQuery}
                className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer h-8"
              >
                查询
              </button>
              <button
                onClick={handleReset}
                className="bg-white hover:bg-gray-50 text-[#1890ff] border border-[#1890ff] rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer h-8"
              >
                重置
              </button>
              <button
                onClick={handleBatchUpgrade}
                className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer h-8"
              >
                批量升级
              </button>
            </div>

          </div>

          {/* 2.2 Grid Bordered Table exactly replicates screenshot rows */}
          <div className="overflow-x-auto w-full select-text" id="devices-table-grid-wrapper">
            <table className="w-full text-center border-collapse border border-gray-200 text-xs">
              
              {/* Header section with light gray block background */}
              <thead>
                <tr className="bg-[#f5f5f5] h-11 text-gray-800 font-bold select-none border-b border-gray-200">
                  <th className="w-12 text-center border border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={checkAllSelectedOnPage}
                        onChange={handleToggleSelectAll}
                        className="w-3.5 h-3.5 text-blue-500 cursor-pointer border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">设备ID</th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">所属收费站</th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">设备状态</th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">创建时间</th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">最近一次升级</th>
                  <th className="border border-gray-200 px-3 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>

              {/* Table data body matching row elements */}
              <tbody>
                {visibleDevices.length > 0 ? (
                  visibleDevices.map((device) => {
                    const isChecked = selectedIds.includes(device.id);
                    return (
                      <tr
                        key={device.id}
                        className="h-12 hover:bg-slate-50 border-b border-gray-200 transition text-gray-750"
                      >
                        {/* Checkbox column */}
                        <td className="border border-gray-200 text-center">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleRow(device.id)}
                              className="w-3.5 h-3.5 text-blue-500 cursor-pointer border-gray-300 rounded"
                            />
                          </div>
                        </td>

                        {/* Device ID */}
                        <td className="border border-[#e8e8e8] px-3 font-mono text-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{device.id}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 scale-95 origin-right px-1.5 py-0.5 rounded border border-blue-100 font-sans">
                              {deviceVersions[device.id] || "v1.7"}
                            </span>
                          </div>
                        </td>

                        {/* Station */}
                        <td className="border border-gray-200 px-3 text-gray-800">{device.station}</td>

                        {/* Status with designated colors (online=blue, offline=orange) */}
                        <td className="border border-gray-200 px-3">
                          {device.status === "正常" ? (
                            <span className="text-[#1890ff] font-medium" id={`status-${device.id}`}>正常</span>
                          ) : (
                            <span className="text-[#fa8c16] font-medium animate-pulse" id={`status-${device.id}`}>离线</span>
                          )}
                        </td>

                        {/* Created time */}
                        <td className="border border-gray-200 px-3 font-mono text-gray-600">{device.createdAt}</td>

                        {/* Last Upgraded datetime */}
                        <td className="border border-gray-200 px-3 font-mono text-gray-600">{device.lastUpgradedAt}</td>

                        {/* Action buttons */}
                        <td className="border border-gray-200 px-3 select-none">
                          <div className="flex items-center justify-center gap-4 text-[12px]">
                            <button
                              type="button"
                              onClick={() => startUpgradeDevice(device)}
                              className="text-[#1890ff] hover:text-blue-700 font-medium hover:underline cursor-pointer transition"
                            >
                              升级
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRollbackClick(device)}
                              className="text-[#1890ff] hover:text-blue-700 font-medium hover:underline cursor-pointer transition"
                            >
                              回退
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="h-28">
                    <td colSpan={7} className="text-gray-400 text-center border border-gray-200">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <AlertCircle className="w-5 h-5 text-gray-300" />
                        <span>未查询到匹配的机电设备记录</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* 2.3 Pagination controls aligned at the bottom right matching screenshot exactly */}
          <div className="flex justify-between items-center pt-2 select-none" id="upgrade-table-footer">
            
            {/* Left information tip */}
            <div className="text-[11px] text-gray-400">
              {selectedIds.length > 0 && (
                <span>已选择 <strong className="text-blue-600">{selectedIds.length}</strong> 台设备待指令批量执行</span>
              )}
            </div>

            {/* Pagination Blocks (matches screenshot look [<] [1] [2] [3] [4] [5] [>]) */}
            <div className="flex items-center gap-1 text-xs" id="pagination-control-blocks">
              
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

              {/* Page number buttons */}
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    if (page <= totalPages) {
                      setCurrentPage(page);
                    } else {
                      alert(`演示模式仅在有效数据页面 1-${totalPages} 间切换`);
                    }
                  }}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold transition cursor-pointer select-none ${
                    currentPage === page
                      ? "border-[#1890ff] text-[#1890ff] bg-white font-bold"
                      : "border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 bg-white"
                  }`}
                >
                  {page}
                </button>
              ))}

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
      ) : (
        /* ------------------ FIDELITY SERVER UPGRADE VIEW (Screenshot 3 Matching!) ------------------ */
        <div className="bg-white border border-gray-200 rounded p-6 shadow-xs flex flex-col space-y-4" id="server-upgrade-main-container">
          
          <div className="flex flex-col space-y-4">
            
            {/* Title bold heading */}
            <h2 className="text-sm font-bold text-gray-900 select-none pb-0.5">
              服务端升级
            </h2>

            {/* Upload File Input & Button with light thin grey outline */}
            <div className="flex items-center gap-3">
              <label className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs px-4 py-1.5 rounded-[4px] transition bg-white cursor-pointer inline-flex items-center justify-center font-semibold h-[28px] shadow-2xs select-none">
                上传文件
                <input
                  type="file"
                  className="hidden"
                  onChange={handleServerFileUploadChange}
                  disabled={isServerFilesUploading}
                />
              </label>

              {isServerFilesUploading && (
                <span className="text-xs text-blue-500 flex items-center gap-1.5 animate-pulse">
                  <svg className="animate-spin h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  文件正在并发传输中...
                </span>
              )}

              {serverUpgradeLog && (
                <span className="text-xs text-green-600 font-semibold animate-pulse">{serverUpgradeLog}</span>
              )}
            </div>

          </div>

          {/* Dash outline box table replicating screenshot look */}
          <div className="border border-dashed border-[#cccccc] rounded-[4px] bg-white overflow-hidden select-text">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#e8e8e8] h-10 text-gray-400 font-medium select-none">
                  <th className="px-5 py-2 font-semibold">文件名</th>
                  <th className="px-5 py-2 font-semibold text-center w-24">大小</th>
                  <th className="px-5 py-2 font-semibold text-center w-48">状态</th>
                  <th className="px-5 py-2 font-semibold text-center w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {(serverFilesMap[serverCurrentPage] || []).length > 0 ? (
                  (serverFilesMap[serverCurrentPage] || []).map((file) => (
                    <tr key={file.id} className="border-b border-gray-150/45 h-11 hover:bg-slate-50 transition">
                      
                      {/* Name of the file */}
                      <td className="px-5 py-2 text-gray-800 font-sans font-medium" title={file.name}>
                        {file.name}
                      </td>

                      {/* File size */}
                      <td className="px-5 py-2 text-gray-600 text-center font-mono font-bold">
                        {file.size}
                      </td>

                      {/* Status indicator with matching check/exclamation/loading spinner shapes */}
                      <td className="px-5 py-2 text-center select-none font-sans">
                        <div className="flex items-center justify-center gap-1.5 font-semibold">
                          {file.status === "上传成功" && (
                            <span className="text-[#52c41a] flex items-center gap-1.5 text-xs font-bold">
                              <svg className="w-3.5 h-3.5 text-[#52c41a] bg-[#52c41a]/10 rounded-full p-0.5" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              上传成功
                            </span>
                          )}
                          {file.status === "上传失败" && (
                            <span className="text-[#ff4d4f] flex items-center gap-1.5 text-xs font-bold">
                              <span className="w-3.5 h-3.5 bg-[#ff4d4f] text-white text-[9px] rounded-full flex items-center justify-center font-bold">!</span>
                              上传失败
                            </span>
                          )}
                          {file.status === "上传40%..." && (
                            <span className="text-[#1890ff] flex items-center gap-1.5 text-xs font-bold">
                              <svg className="animate-spin h-3.5 w-3.5 text-[#1890ff]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              上传40%...
                            </span>
                          )}
                          {file.status === "待上传" && (
                            <span className="text-gray-400 flex items-center gap-1.5 text-xs font-bold">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4" />
                              </svg>
                              待上传
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delete option link button */}
                      <td className="px-5 py-2 text-center select-none text-xs">
                        <button
                          type="button"
                          onClick={() => handleServerFileDelete(file.id, file.name)}
                          className="text-gray-400 hover:text-red-500 hover:underline transition cursor-pointer font-sans"
                        >
                          删除
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-gray-400 py-12 text-center select-none">
                      当前页没有上传记录，点击上方按钮追加
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Horizontal line divider above note description */}
          <div className="border-t border-gray-150/80 pt-3 mt-1" />

          {/* Yellow/Orange explanation line matching exact text and icon indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#fa8c16] font-bold select-none pl-1">
            <span className="w-2.5 h-2.5 bg-[#fa8c16] rounded-full inline-block" />
            <span>说明：文件上传中，请耐心等候...</span>
          </div>

          {/* Action trigger buttons (Centred exactly below) in pastel blue style */}
          <div className="flex justify-center items-center gap-4 pt-1 select-none">
            
            {/* Upload Action */}
            <button
              onClick={handleServerFilesUploadAction}
              disabled={isServerFilesUploading}
              className={`px-8 py-1.5 rounded-[3px] text-xs font-semibold tracking-wide text-white transition cursor-pointer select-none border-none shadow-2xs ${
                isServerFilesUploading
                  ? "bg-[#d9d9d9] text-gray-400 cursor-not-allowed"
                  : "bg-[#adc6ff] hover:bg-blue-400 text-white"
              }`}
              style={{ width: "80px" }}
            >
              上传
            </button>

            {/* Upgrade Action */}
            <button
              onClick={handleServerUpgradeAction}
              disabled={isServerFilesUploading || isServerUpgrading}
              className={`px-8 py-1.5 rounded-[3px] text-xs font-semibold tracking-wide text-white transition cursor-pointer select-none border-none shadow-2xs ${
                isServerFilesUploading || isServerUpgrading
                  ? "bg-[#d9d9d9] text-gray-400 cursor-not-allowed"
                  : "bg-[#adc6ff] hover:bg-blue-400 text-white"
              }`}
              style={{ width: "80px" }}
            >
              {isServerUpgrading ? "升级中" : "升级"}
            </button>

          </div>

          {/* Bottom Pagination Control matching layout exact values */}
          <div className="flex justify-end pt-1 select-none">
            <div className="flex items-center gap-1 text-xs" id="server-pagination-controls">
              
              {/* Prev */}
              <button
                onClick={() => setServerCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={serverCurrentPage === 1}
                className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                  serverCurrentPage === 1
                    ? "text-gray-300 border-gray-150 cursor-not-allowed"
                    : "text-gray-600 border-gray-200 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                &lt;
              </button>

              {/* Pages numbers */}
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setServerCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold transition cursor-pointer select-none ${
                    serverCurrentPage === page
                      ? "border-[#1890ff] text-[#1890ff] bg-white font-bold"
                      : "border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 bg-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setServerCurrentPage(prev => Math.min(prev + 1, 5))}
                disabled={serverCurrentPage === 5}
                className={`w-7 h-7 flex items-center justify-center border rounded text-xs font-semibold bg-white cursor-pointer transition ${
                  serverCurrentPage === 5
                    ? "text-gray-300 border-gray-150 cursor-not-allowed"
                    : "text-gray-650 border-gray-200 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                &gt;
              </button>

            </div>
          </div>

        </div>
      )}

      {/* -------------------- DYNAMIC MODALS OVERLAY FOR CORRESPONDING ACTIONS -------------------- */}

      {/* 1. STATE-OF-THE-ART INDIVIDUAL UPGRADE MODAL (Perfect Replica of User's Mock Image) */}
      {showUpgradeModal && targetUpgradeDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn" id="user-custom-upgrade-modal-overlay">
          
          {/* Main Modal Card Wrapper (Compact, styled exactly like the provided screenshot) */}
          <div className="bg-white rounded-md border border-gray-100 p-6 w-[410px] shadow-2xl relative animate-scaleIn text-left text-gray-800" id="user-upgrade-card-box">
            
            {/* Top-Right Close Button */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 text-[#999999] hover:text-[#333333] transition cursor-pointer select-none"
              title="关闭"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>

            {/* Modal Title (Matches screenshot font spacing) */}
            <h3 className="text-base font-bold text-gray-900 mb-6 select-none pl-1">升级</h3>

            <div className="space-y-[15px] pl-1">
              
              {/* Row 1: Current Version (当前版本) */}
              <div className="flex items-center text-[13px]">
                <span className="w-[78px] shrink-0 text-left font-bold text-gray-900 select-none">当前版本：</span>
                <span className="text-gray-900 font-sans font-medium text-xs">
                  {deviceVersions[targetUpgradeDevice.id] || "v1.7"}
                </span>
              </div>

              {/* Row 2: Select/Upload File (上传文件) */}
              <div className="flex items-center text-[13px]">
                <span className="w-[78px] shrink-0 text-left font-bold text-gray-900 select-none">上传文件：</span>
                <div className="flex-grow flex items-center gap-3">
                  <input
                    type="text"
                    value={modalFileName}
                    readOnly
                    className="border border-[#cccccc] bg-white text-[#999999] font-sans text-xs rounded-[4px] px-3 py-1 w-[200px] h-[28px] outline-none select-none text-left"
                    placeholder="v2.bin"
                  />
                  
                  {/* Select File Link Button */}
                  <label className="text-[#1890ff] hover:text-blue-600 cursor-pointer font-bold text-[12px] whitespace-nowrap select-none hover:underline">
                    选择文件
                    <input
                      type="file"
                      className="hidden"
                      accept=".bin,.zip,.hex"
                      onChange={handleModalFileChanged}
                      disabled={modalUploadStatus === 'uploading' || modalUpgradeStatus === 'upgrading'}
                    />
                  </label>
                </div>
              </div>

              {/* Row 3: Progress block containing file size on the left, progress bar on the right */}
              <div className="flex items-center text-[13px]">
                {/* 共3.21GB left aligned inside the label column */}
                <span className="w-[78px] shrink-0 text-left font-bold text-gray-950 whitespace-nowrap select-none">
                  共{modalFileSizeStr}
                </span>

                <div className="flex items-center gap-2 flex-grow">
                  {/* Custom thick rounded progress bar mimicking mockup shape */}
                  <div className="relative w-[200px] bg-[#e6e6e6] h-[18px] rounded-full overflow-hidden select-none">
                    
                    {/* Active blue progress track */}
                    <div
                      className="bg-[#1890ff] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${modalProgress}%` }}
                    />

                    {/* Progress percentage text centered horizontally inside the filled blue part */}
                    <div
                      className="absolute inset-y-0 left-0 flex items-center justify-center transition-all duration-300 font-sans text-[10px] font-bold text-white"
                      style={{ width: `${modalProgress}%` }}
                    >
                      {modalProgress > 15 && <span>{modalProgress}%</span>}
                    </div>

                  </div>

                  {/* 100% complete blue icon circle with checkmark from the RIGHT screenshot */}
                  {modalProgress === 100 && (
                    <div className="flex items-center justify-center w-4 h-4 bg-[#1890ff] rounded-full text-white shrink-0 shadow-2xs antialiased animate-scaleIn">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Action Buttons row */}
              <div className="flex items-center pt-2">
                <div className="w-[78px] shrink-0" /> {/* Column spacer */}
                <div className="flex items-center gap-2">
                  
                  {/* Upload Button ("上传") */}
                  <button
                    type="button"
                    onClick={triggerSimulateUploadAction}
                    disabled={modalUploadStatus === 'uploading' || modalUpgradeStatus === 'upgrading' || modalProgress === 100}
                    className={`h-[30px] px-5 rounded-[4px] text-xs font-bold transition cursor-pointer select-none border-none text-white ${
                      modalProgress === 100
                        ? "bg-[#d9d9d9] text-gray-400 cursor-not-allowed"
                        : "bg-[#1890ff] hover:bg-[#40a9ff] active:bg-[#096dd9]"
                    }`}
                  >
                    上传
                  </button>

                  {/* Upgrade Button ("升级") - Gray disabled when <100%, Green active when 100% */}
                  <button
                    type="button"
                    onClick={triggerSimulateUpgradeAction}
                    disabled={modalProgress < 100 || modalUpgradeStatus === 'upgrading' || modalUpgradeStatus === 'success'}
                    className={`h-[30px] px-5 rounded-[4px] text-xs font-bold transition cursor-pointer select-none border-none text-white ${
                      modalProgress < 100
                        ? "bg-[#cccccc] text-white cursor-not-allowed"
                        : modalUpgradeStatus === 'upgrading'
                          ? "bg-orange-500 animate-pulse"
                          : modalUpgradeStatus === 'success'
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#52c41a] hover:bg-[#73d13d] active:bg-[#389e0d]"
                    }`}
                  >
                    升级
                  </button>

                </div>
              </div>

              {/* Status Banner Info */}
              <div className="text-[10.5px] text-gray-400 pt-1 border-t border-gray-150/50 mt-1 select-none space-y-1">
                {modalProgress < 100 ? (
                  <p className="text-amber-600 flex items-center gap-1 font-medium font-sans">
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                    说明：文件上传中，请耐心等候...
                  </p>
                ) : modalUpgradeStatus === 'idle' ? (
                  <p className="text-[#52c41a] flex items-center gap-1 font-semibold font-sans">
                    状态：上传已完成，允许点按绿色“升级”键！
                  </p>
                ) : modalUpgradeStatus === 'upgrading' ? (
                  <p className="text-blue-600 flex items-center gap-1 font-semibold font-sans animate-pulse">
                    升级状态：物理扇区重写及写盘校验中...
                  </p>
                ) : modalUpgradeStatus === 'success' ? (
                  <p className="text-[#52c41a] flex items-center gap-1 font-bold font-sans">
                    ✓ 升级成功！设备主系统已经部署 v2.0，设备即将重启。
                  </p>
                ) : (
                  <p className="text-red-500 flex items-center gap-1 font-semibold font-sans">
                    ✕ 升级失败：由于 RS-485 链路离线，请尝试重新连接。
                  </p>
                )}
              </div>



            </div>

          </div>



        </div>
      )}

      {/* 2. Legacy Batch Upgrade sequence dialog (Triggered on ticking multiply check lists) */}
      {isUpgrading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn" id="upgrade-progress-overlay-board">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-2xl relative animate-scaleIn text-left text-gray-800">
            
            <button
              onClick={() => setIsUpgrading(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">
              {batchMode ? "批量固件分发升级中" : `设备指令热重载刷盘 - ${targetUpgradeDevice?.id}`}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-xs text-gray-600">
                <span>分发协议：SCP网际加密通道 / Modbus Mapped</span>
                <span className="font-mono font-bold text-gray-950 text-sm">{upgradeProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-150 rounded-full h-2">
                <div 
                  className="bg-[#1890ff] h-2 rounded-full transition-all duration-150"
                  style={{ width: `${upgradeProgress}%` }}
                />
              </div>

              <div className="bg-zinc-950 p-3 rounded font-mono text-[11px] text-emerald-400 space-y-1 h-36 overflow-y-auto leading-relaxed select-text" id="modal-terminal-logs">
                <div className="text-[10px] text-zinc-500 block border-b border-zinc-800 pb-1 mb-1 font-sans">STDOUT/STDERR DIAGNOSTIC CONSOLE</div>
                {upgradeLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                {upgradeFinished ? (
                  <button
                    onClick={() => {
                      setIsUpgrading(false);
                      alert("系统模块批量闪存写盘完成，全部指示常态绿灯重启正常。");
                    }}
                    className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-6 py-1.5 font-bold cursor-pointer transition shadow-xs"
                  >
                    完成
                  </button>
                ) : (
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>升级正在高速下发中，切勿断开电源...</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. Device Rollback Version Warning Dialogue */}
      {rollbackDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn" id="rollback-warning-modal">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn text-left text-gray-800">
            
            <button
              onClick={() => setRollbackDevice(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">固件版本回归确认</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              您正在请求对设备 <strong className="text-gray-900 font-mono font-bold bg-gray-50 px-1 py-0.5 rounded border">{rollbackDevice.id}</strong> 固件执行底层回退。该操作会将程序重新加载回到最近一次上传并测试通过的备份内核包，此过程需要大约 1-2 分钟，期间物理硬件将触发重启。
            </p>

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRollbackDevice(null)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs px-5 py-1.5 font-medium cursor-pointer transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmRollbackExec}
                className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-bold cursor-pointer transition shadow-xs"
              >
                确认回退
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
