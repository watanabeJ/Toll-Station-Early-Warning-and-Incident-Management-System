import React, { useState, useEffect } from "react";
import { 
  Minus, 
  Plus, 
  Check, 
  ChevronDown, 
  Save 
} from "lucide-react";

interface GeneralConfigViewProps {
  onAppendLog?: (module: string, action: string) => void;
  showAnnotations?: boolean;
}

export default function GeneralConfigView({ onAppendLog, showAnnotations = true }: GeneralConfigViewProps) {
  // Successful alert modal or toast status
  const [toastMessage, setToastMessage] = useState("");

  // ================= STATE INITIALIZATION WITH LOCAL_STORAGE SYNCHRONIZATION =================
  
  // 1. 目标检测推理参数 (Inference parameters)
  const [detectConf, setDetectConf] = useState(() => localStorage.getItem("toll_sys_detect_conf") || "0.25");
  const [detectIou, setDetectIou] = useState(() => localStorage.getItem("toll_sys_detect_iou") || "0.45");
  const [imgszWidth, setImgszWidth] = useState(() => localStorage.getItem("toll_sys_detect_imgsz_width") || "640");
  const [imgszHeight, setImgszHeight] = useState(() => localStorage.getItem("toll_sys_detect_imgsz_height") || "640");
  const [detectResizeFactor, setDetectResizeFactor] = useState(() => localStorage.getItem("toll_sys_detect_resize_factor") || "1.0");
  const [detectApplyMask, setDetectApplyMask] = useState(() => localStorage.getItem("toll_sys_detect_apply_mask") === "true");
  const [detectRegionFilter, setDetectRegionFilter] = useState(() => localStorage.getItem("toll_sys_detect_region_filter") !== "false");

  // 2. 两客一危禁行设置
  const [prohibitsEnabled, setProhibitsEnabled] = useState(() => localStorage.getItem("toll_sys_prohibits_enabled") !== "false");
  const [coachStart, setCoachStart] = useState(() => localStorage.getItem("toll_sys_coach_start") || "02:00");
  const [coachEnd, setCoachEnd] = useState(() => localStorage.getItem("toll_sys_coach_end") || "05:00");
  const [dangerousStart, setDangerousStart] = useState(() => localStorage.getItem("toll_sys_dangerous_start") || "00:00");
  const [dangerousEnd, setDangerousEnd] = useState(() => localStorage.getItem("toll_sys_dangerous_end") || "24:00");

  // 3. 语音播报设置
  const [staffBroadcastEnabled, setStaffBroadcastEnabled] = useState(() => localStorage.getItem("toll_sys_staff_broadcast_master") !== "false");
  const [ttsVoiceName, setTtsVoiceName] = useState(() => localStorage.getItem("toll_sys_tts_voice_name") || "xiaomei");
  const [ttsPitch, setTtsPitch] = useState(() => Number(localStorage.getItem("toll_sys_tts_pitch") || "50"));
  const [ttsSpeed, setTtsSpeed] = useState(() => Number(localStorage.getItem("toll_sys_tts_speed") || "45"));
  const [playInterval, setPlayInterval] = useState(() => Number(localStorage.getItem("toll_sys_play_interval") || "2"));
  const [sleepTime, setSleepTime] = useState(() => Number(localStorage.getItem("toll_sys_sleep_time") || "6"));

  // 4. 服务地址
  const [eventServer, setEventServer] = useState(() => localStorage.getItem("toll_sys_event_server") || "http://api.internal.service/events");
  const [fileServer, setFileServer] = useState(() => localStorage.getItem("toll_sys_file_server") || "http://oss.internal.storage/v1");

  // ================= PERSIST TO LOCAL STORAGE UPON VALUE CHANGED =================

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_conf", detectConf);
  }, [detectConf]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_iou", detectIou);
  }, [detectIou]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_imgsz_width", imgszWidth);
  }, [imgszWidth]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_imgsz_height", imgszHeight);
  }, [imgszHeight]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_resize_factor", detectResizeFactor);
  }, [detectResizeFactor]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_apply_mask", String(detectApplyMask));
  }, [detectApplyMask]);

  useEffect(() => {
    localStorage.setItem("toll_sys_detect_region_filter", String(detectRegionFilter));
  }, [detectRegionFilter]);

  useEffect(() => {
    localStorage.setItem("toll_sys_prohibits_enabled", String(prohibitsEnabled));
  }, [prohibitsEnabled]);

  useEffect(() => {
    localStorage.setItem("toll_sys_coach_start", coachStart);
  }, [coachStart]);

  useEffect(() => {
    localStorage.setItem("toll_sys_coach_end", coachEnd);
  }, [coachEnd]);

  useEffect(() => {
    localStorage.setItem("toll_sys_dangerous_start", dangerousStart);
  }, [dangerousStart]);

  useEffect(() => {
    localStorage.setItem("toll_sys_dangerous_end", dangerousEnd);
  }, [dangerousEnd]);

  useEffect(() => {
    localStorage.setItem("toll_sys_staff_broadcast_master", String(staffBroadcastEnabled));
  }, [staffBroadcastEnabled]);

  useEffect(() => {
    localStorage.setItem("toll_sys_tts_voice_name", ttsVoiceName);
  }, [ttsVoiceName]);

  useEffect(() => {
    localStorage.setItem("toll_sys_tts_pitch", String(ttsPitch));
  }, [ttsPitch]);

  useEffect(() => {
    localStorage.setItem("toll_sys_tts_speed", String(ttsSpeed));
  }, [ttsSpeed]);

  useEffect(() => {
    localStorage.setItem("toll_sys_play_interval", String(playInterval));
  }, [playInterval]);

  useEffect(() => {
    localStorage.setItem("toll_sys_sleep_time", String(sleepTime));
  }, [sleepTime]);

  useEffect(() => {
    localStorage.setItem("toll_sys_event_server", eventServer);
  }, [eventServer]);

  useEffect(() => {
    localStorage.setItem("toll_sys_file_server", fileServer);
  }, [fileServer]);

  // ================= SAVE GLOBAL CONFIG ACTION =================

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleSaveAllConfig = () => {
    if (onAppendLog) {
      onAppendLog("通用参数配置", "下发全端参数配置，并持久化到各系统内核");
    }
    triggerToast("通用配置参数保存成功！");
  };

  // Switch Custom Toggle component internal
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-5 px-4 md:px-8 py-6 bg-[#f8fafc] text-slate-800 font-sans min-h-0 overflow-y-auto" id="general-config-replicate-view">
      
      {/* 1. Header Title */}
      <div className="pb-3 border-b border-gray-150 flex items-center justify-between" id="general-config-title-bar">
        <div className="text-[13px] text-gray-400 select-none flex items-center gap-1.5 pl-1">
          <span className="text-gray-650 font-medium font-sans">通用参数配置</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0b5df2] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 select-none animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}



      {/* Main Containers Layout */}
      <div className="max-w-3xl space-y-6">

        {/* ================= 2. 两客一危禁行设置 ================= */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 select-none tracking-tight pl-1">两客一危禁行设置</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            
            {/*包车限行时段*/}
            <div className="px-5 py-5 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-600">从事旅游的包车、三类以上班线客车禁行时段</h4>
              <div className="flex items-center gap-2 select-none">
                <input
                  type="text"
                  value={coachStart}
                  onChange={(e) => setCoachStart(e.target.value)}
                  className="w-32 h-8 text-center text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none border border-transparent focus:bg-white focus:border-[#0b5df2]"
                />
                <span className="text-gray-400 text-xs px-1">至</span>
                <input
                  type="text"
                  value={coachEnd}
                  onChange={(e) => setCoachEnd(e.target.value)}
                  className="w-32 h-8 text-center text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none border border-transparent focus:bg-white focus:border-[#0b5df2]"
                />
              </div>
            </div>

            {/*危化品限行时段*/}
            <div className="px-5 py-5 space-y-2.5 bg-slate-50/40">
              <h4 className="text-xs font-semibold text-slate-600">从事危化品运输车辆禁行时段</h4>
              <div className="flex items-center gap-2 select-none">
                <input
                  type="text"
                  value={dangerousStart}
                  onChange={(e) => setDangerousStart(e.target.value)}
                  className="w-32 h-8 text-center text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl border border-transparent outline-none focus:bg-white focus:border-[#0b5df2]"
                />
                <span className="text-gray-400 text-xs px-1">至</span>
                <input
                  type="text"
                  value={dangerousEnd}
                  onChange={(e) => setDangerousEnd(e.target.value)}
                  className="w-32 h-8 text-center text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl border border-transparent outline-none focus:bg-white focus:border-[#0b5df2]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= 3. 播报设置 ================= */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 select-none tracking-tight pl-1">默认播报设置</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            
            {/*是否播报员工事件*/}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-[70%]">
                <h4 className="text-xs font-bold text-gray-800">是否播报员工事件</h4>
                <p className="text-[11px] text-gray-400 leading-normal">开启后系统将自动语音提醒</p>
              </div>
              <div>
                <ToggleSwitch checked={staffBroadcastEnabled} onChange={setStaffBroadcastEnabled} />
              </div>
            </div>

            {/*TTS 语音名称*/}
            <div className="px-5 py-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-800">TTS 语音名称</h4>
              <div className="relative">
                <select
                  value={ttsVoiceName}
                  onChange={(e) => setTtsVoiceName(e.target.value)}
                  className="w-full h-8.5 bg-[#f1f3f5] text-slate-800 text-xs font-semibold pl-4 pr-10 rounded-xl ring-0 border border-transparent outline-none focus:bg-white focus:border-[#0b5df2] cursor-pointer appearance-none"
                >
                  <option value="xiaomei">晓梅 (xiaomei)</option>
                  <option value="xiaofeng">晓峰 (xiaofeng)</option>
                  <option value="xiaoyan">晓燕 (xiaoyan)</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">语音合成特征，可选择不同性别的播报角色音色。</p>
            </div>

            {/*TTS 音调 & 语速*/}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-800">TTS 音调</h4>
                <input
                  type="number"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(Number(e.target.value))}
                  className="w-full h-8 px-4 text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none focus:bg-white border border-transparent focus:border-[#0b5df2]"
                />
                <p className="text-[11px] text-gray-400">声调高低，默认值为 50。</p>
              </div>

              <div className="space-y-1.5 sm:pl-5 pt-3 sm:pt-0">
                <h4 className="text-xs font-bold text-gray-800">TTS 语速</h4>
                <input
                  type="number"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(Number(e.target.value))}
                  className="w-full h-8 px-4 text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none focus:bg-white border border-transparent focus:border-[#0b5df2]"
                />
                <p className="text-[11px] text-gray-400">发音快慢，默认值为 50。</p>
              </div>

            </div>

            {/*播放间隔*/}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-[60%]">
                <h4 className="text-xs font-bold text-gray-800">播放间隔</h4>
                <p className="text-[11px] text-gray-400 leading-normal">相同类型事件连续触发的防刷冷却时间。</p>
              </div>
              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  onClick={() => setPlayInterval(Math.max(1, playInterval - 1))}
                  className="w-7.5 h-7.5 rounded-lg bg-[#f1f3f5] hover:bg-[#e2e8f0] flex items-center justify-center font-bold text-gray-500 hover:text-slate-700 cursor-pointer transition active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-800 px-2 min-w-[3rem] text-center">
                  {playInterval} 秒
                </span>
                <button
                  type="button"
                  onClick={() => setPlayInterval(playInterval + 1)}
                  className="w-7.5 h-7.5 rounded-lg bg-[#f1f3f5] hover:bg-[#e2e8f0] flex items-center justify-center font-bold text-gray-500 hover:text-slate-700 cursor-pointer transition active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/*调用播放接口后的等待秒数*/}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-[65%]">
                <h4 className="text-xs font-bold text-gray-800">调用播放接口后的等待秒数</h4>
                <p className="text-[11px] text-gray-400 leading-normal">语音播报调用播放接口后的等待延迟时间（数字人/音响底层交互组件）。</p>
              </div>
              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  onClick={() => setSleepTime(Math.max(0, sleepTime - 1))}
                  className="w-7.5 h-7.5 rounded-lg bg-[#f1f3f5] hover:bg-[#e2e8f0] flex items-center justify-center font-bold text-gray-500 hover:text-slate-700 cursor-pointer transition active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-800 px-2 min-w-[3rem] text-center">
                  {sleepTime} 秒
                </span>
                <button
                  type="button"
                  onClick={() => setSleepTime(sleepTime + 1)}
                  className="w-7.5 h-7.5 rounded-lg bg-[#f1f3f5] hover:bg-[#e2e8f0] flex items-center justify-center font-bold text-gray-500 hover:text-slate-700 cursor-pointer transition active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= 4. 服务地址 ================= */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 select-none tracking-tight pl-1">服务地址</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            
            {/*事件上报后台地址*/}
            <div className="px-5 py-4 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700">事件上报后台地址</h4>
              <input
                type="text"
                value={eventServer}
                onChange={(e) => setEventServer(e.target.value)}
                className="w-full h-8 px-4 text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none border border-transparent focus:bg-white focus:border-[#0b5df2]"
                placeholder="E.g. http://api.internal.service/events"
              />
            </div>

            {/*文件服务地址*/}
            <div className="px-5 py-4 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700">文件服务地址</h4>
              <input
                type="text"
                value={fileServer}
                onChange={(e) => setFileServer(e.target.value)}
                className="w-full h-8 px-4 text-xs font-semibold bg-[#f1f3f5] text-slate-800 rounded-xl outline-none border border-transparent focus:bg-white focus:border-[#0b5df2]"
                placeholder="E.g. http://oss.internal.storage/v1"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Floating Save Prompt segment for bottom visibility */}
      <div className="max-w-3xl pt-2 pb-8 flex justify-end">
        <button
          type="button"
          onClick={handleSaveAllConfig}
          className="px-6 py-2 bg-[#0b5df2] hover:bg-[#094dc7] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition cursor-pointer"
        >
          保存
        </button>
      </div>

    </div>
  );
}
