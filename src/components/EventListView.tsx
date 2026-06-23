import React, { useState } from "react";
import { Filter, Calendar, Search, RefreshCw, X, ShieldAlert, CheckCircle, Image, ArrowRight } from "lucide-react";
import { TollStationEvent, EventType, EventStatus, HandlerAction, getEventTypeName } from "../types";

interface EventListViewProps {
  events: TollStationEvent[];
  onSubmitProcess: (eventId: string, action: HandlerAction | "误报", opinion: string) => void;
  showAnnotations: boolean;
}

export default function EventListView({ events, onSubmitProcess, showAnnotations }: EventListViewProps) {
  // Query Filters State
  const [filterType, setFilterType] = useState<string>("全部");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [filterAction, setFilterAction] = useState<string>("全部");
  const [filterId, setFilterId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Handling Modal State
  const [selectedEvent, setSelectedEvent] = useState<TollStationEvent | null>(null);
  const [handlingTab, setHandlingTab] = useState<"办结" | "误报">("办结");
  const [handlingSubAction, setHandlingSubAction] = useState<"正常" | "劝阻无效">("正常");
  const [opinionText, setOpinionText] = useState("");
  
  // Original Image Modal State
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const resetFilters = () => {
    setFilterType("全部");
    setFilterStatus("全部");
    setFilterAction("全部");
    setFilterId("");
    setFilterDate("");
  };

  // Filter logic
  const filteredEvents = events.filter((e) => {
    if (filterType !== "全部" && e.type !== filterType) return false;
    if (filterStatus !== "全部" && e.status !== filterStatus) return false;
    if (filterAction !== "全部") {
      if (filterAction === "办结-正常" && e.handlerAction !== HandlerAction.Normal) return false;
      if (filterAction === "办结-劝阻无效" && e.handlerAction !== HandlerAction.Canceled) return false;
      if (filterAction === "误报" && e.handlerAction !== HandlerAction.Misreport) return false;
    }
    if (filterId && !e.id.includes(filterId)) return false;
    if (filterDate && !e.alarmTime.includes(filterDate)) return false;
    return true;
  });

  const handleOpenProcess = (event: TollStationEvent) => {
    setSelectedEvent(event);
    setHandlingTab("办结");
    setHandlingSubAction("正常");
    setOpinionText("");
  };

  const handleCloseProcess = () => {
    setSelectedEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    let action: HandlerAction | "误报";
    if (handlingTab === "误报") {
      action = "误报";
    } else {
      action = handlingSubAction === "正常" ? HandlerAction.Normal : HandlerAction.Canceled;
    }

    onSubmitProcess(selectedEvent.id, action, opinionText || "无");
    setSelectedEvent(null);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Search Filters Section (Screen 2 Filters layout) */}
      <section className="bg-white p-5 rounded border border-gray-200 shadow-xs" data-purpose="filter-bar">
        <h2 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            事件检索中心
          </span>
          <span className="text-[11px] text-gray-400 font-normal">
            筛选及处理车道告警异常
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* Input: Category */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap" htmlFor="category-select">事件类型</label>
            <select
              id="category-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-32 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 h-8 text-gray-700 cursor-pointer font-sans"
            >
              <option value="全部">全部</option>
              {Object.values(EventType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Input: Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap" htmlFor="status-select">事件状态</label>
            <select
              id="status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-28 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 h-8 text-gray-700 cursor-pointer font-sans"
            >
              <option value="全部">全部</option>
              <option value="待处理">待处理</option>
              <option value="已处理">已处理</option>
            </select>
          </div>

          {/* Input: Action */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap" htmlFor="action-select">处理操作</label>
            <select
              id="action-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-32 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 h-8 text-gray-700 cursor-pointer font-sans"
            >
              <option value="全部">全部</option>
              <option value="办结-正常">办结-正常</option>
              <option value="办结-劝阻无效">办结-劝阻无效</option>
              <option value="误报">误报</option>
            </select>
          </div>

          {/* Input: Time Span */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap" htmlFor="date-input">告警时间</label>
            <div className="relative w-56">
              <input
                id="date-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 pr-8 outline-none focus:border-blue-500 h-8 font-sans text-gray-700"
                placeholder="开始-结束 (例如: 2024-10-21)"
                type="text"
              />
              <span className="absolute right-2.5 top-2 text-gray-400">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={resetFilters}
              className="bg-white hover:bg-gray-50 text-[#1890ff] border border-blue-200 rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
            >
              重置
            </button>
            <button
              onClick={() => {}}
              className="bg-[#1890ff] hover:bg-blue-600 text-white rounded text-xs px-5 py-1.5 font-medium transition duration-150 cursor-pointer flex items-center gap-1 h-8"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
          </div>
        </div>
      </section>

      {/* Events Table Section */}
      <section className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden" data-purpose="data-table">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse" id="event-table">
            <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5 border-r border-gray-200 text-center w-16">序号</th>
                <th className="px-4 py-3.5 border-r border-gray-200 text-center w-24">事件ID</th>
                <th className="px-4 py-3.5 border-r border-gray-200">事件类型</th>
                <th className="px-4 py-3.5 border-r border-gray-200 text-center w-24">事件快照</th>
                <th className="px-4 py-3.5 border-r border-gray-200">告警时间</th>
                <th className="px-4 py-3.5 border-r border-gray-200 text-center w-24">事件状态</th>
                <th className="px-4 py-3.5 border-r border-gray-200 text-center w-32">处理操作</th>
                <th className="px-4 py-3.5 border-r border-gray-200">处理时间</th>
                <th className="px-4 py-3.5 border-r border-gray-200">处理意见</th>
                <th className="px-4 py-3.5 text-center w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    抱歉，没有找到匹配该筛选条件的任一特情事件。
                  </td>
                </tr>
              ) : (
                filteredEvents.map((element, idx) => {
                  const isPending = element.status === EventStatus.Pending;
                  // Dynamic warning color implementation (Annotation 12: "若选择劝阻无效，此事件在事件列表中将红色高亮显示")
                  const isCanceledWarning = element.handlerAction === HandlerAction.Canceled;
                  const rowTextColor = isCanceledWarning ? "text-red-500 bg-red-50/40" : "text-gray-700";

                  return (
                    <tr key={element.id} className={`hover:bg-gray-50 transition-colors ${rowTextColor}`}>
                      {/* Serial Number */}
                      <td className="px-4 py-4 font-mono text-center border-r border-gray-200 font-medium text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-4 font-mono font-medium text-center border-r border-gray-200">
                        {element.id}
                      </td>
                      <td className="px-4 py-4 font-medium border-r border-gray-200">
                        {getEventTypeName(element.type)}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">
                        {element.snapshotUrl ? (
                          <button
                            onClick={() => setViewImageUrl(element.snapshotUrl || null)}
                            className="w-16 h-10 bg-gray-100 hover:scale-105 border border-gray-200 flex items-center justify-center mx-auto overflow-hidden rounded relative shadow-xs transition group cursor-pointer"
                            title="点击查看完整原图"
                          >
                            <img
                              src={element.snapshotUrl}
                              alt="Lane Cap"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity">
                              原图
                            </div>
                          </button>
                        ) : (
                          <div className="w-16 h-10 bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto rounded">
                            <Image className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500 border-r border-gray-200">
                        {element.alarmTime}
                      </td>
                      <td className="px-4 py-4 text-center font-medium border-r border-gray-200">
                        {isPending ? (
                          <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                            待处理
                          </span>
                        ) : (
                          <span className={isCanceledWarning ? "text-red-500 font-semibold" : "text-gray-500"}>
                            已处理
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-200 font-medium">
                        {isPending ? (
                          <span className="text-gray-400">--</span>
                        ) : (
                          <span className={isCanceledWarning ? "text-red-600 bg-red-100 px-2 py-0.5 rounded font-bold" : "text-gray-700"}>
                            {element.handlerAction}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200 text-gray-500">
                        {element.handlerTime}
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200 max-w-xs truncate text-gray-500" title={element.handlerOpinion || "无"}>
                        {element.handlerOpinion || "--"}
                      </td>
                      <td className="px-4 py-4 text-center font-semibold">
                        {isPending ? (
                          <button
                            onClick={() => handleOpenProcess(element)}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            处理
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenProcess(element)}
                            className={`font-semibold hover:underline cursor-pointer ${isCanceledWarning ? "text-red-500 hover:text-red-700" : "text-gray-800 hover:text-blue-600"}`}
                          >
                            详情
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* EVENT PROCESSING DETAILS MODAL (Screens 3, 5, 7) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-[920px] max-h-[90%] flex flex-col overflow-hidden border border-gray-200 select-none">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white w-2 h-5 rounded-sm" />
                <h3 className="text-md font-bold text-gray-800">永川西收费站车道监控事件响应</h3>
              </div>
              <button
                onClick={handleCloseProcess}
                className="text-gray-400 hover:text-gray-600 pr-1 transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content Column Split */}
            <div className="flex-1 flex overflow-hidden p-6 gap-6">
              
              {/* Left Side: Form Details */}
              <div className="w-[45%] flex flex-col gap-5 overflow-y-auto pr-2">
                
                {/* section: Event Info */}
                <section>
                  <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center justify-between">
                    <span>事件详情</span>
                    {selectedEvent.status === EventStatus.Pending && (
                      <span className="text-[10px] text-red-500 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 animate-pulse">
                        ● 紧急处理中
                      </span>
                    )}
                  </h4>
                  <div className="bg-gray-50 rounded-md p-4 space-y-3 text-xs">
                    <div className="flex border-b border-gray-200/50 pb-2">
                      <span className="w-20 font-bold text-gray-700">事件ID:</span>
                      <span className="font-mono text-gray-600">{selectedEvent.id}</span>
                    </div>
                    <div className="flex border-b border-gray-200/50 pb-2">
                      <span className="w-20 font-bold text-gray-700">事件类型:</span>
                      <span className="text-gray-600 font-semibold">{getEventTypeName(selectedEvent.type)}</span>
                    </div>
                    <div className="flex pb-1">
                      <span className="w-20 font-bold text-gray-700">告警时间:</span>
                      <span className="text-gray-600">{selectedEvent.alarmTime}</span>
                    </div>
                  </div>
                </section>

                <div className="border-t border-dashed border-gray-200 my-1" />

                {/* section: Handled Data or Form submission */}
                {selectedEvent.status !== EventStatus.Pending ? (
                  // Screen 5 View Completed Details
                  <section className="relative">
                    <h4 className="text-xs font-bold text-gray-500 mb-2">处理详情</h4>
                    <div className="bg-gray-50 rounded-md p-4 space-y-3 text-xs">
                      <div className="flex border-b border-gray-200/50 pb-2">
                        <span className="w-20 font-bold text-gray-700">处理人:</span>
                        <span className="text-gray-600 font-medium">
                          {selectedEvent.handlerName || "李华"} (管理员)
                        </span>
                      </div>
                      <div className="flex border-b border-gray-200/50 pb-2">
                        <span className="w-20 font-bold text-gray-700">处理操作:</span>
                        <span className={`font-bold ${selectedEvent.handlerAction === HandlerAction.Canceled ? "text-red-500" : "text-blue-600"}`}>
                          {selectedEvent.handlerAction}
                        </span>
                      </div>
                      <div className="flex border-b border-gray-200/50 pb-2">
                        <span className="w-20 font-bold text-gray-700">处理时间:</span>
                        <span className="text-gray-600">{selectedEvent.handlerTime}</span>
                      </div>
                      <div className="flex pb-1">
                        <span className="w-20 font-bold text-gray-700">处理意见:</span>
                        <span className="text-gray-600 italic bg-white border border-gray-200 rounded p-2 flex-1 min-h-[48px]">
                          {selectedEvent.handlerOpinion || "经现场连线确认，事态已有效处置妥当。"}
                        </span>
                      </div>
                    </div>

                    {/* Annotation 4: Automatic Audit details overlay */}
                    {showAnnotations && (
                      <div className="absolute top-1/4 -right-10 w-64 bg-yellow-100 border border-yellow-300 rounded p-3 shadow-lg text-[10px] leading-relaxed z-20">
                        <div className="bg-yellow-400 text-white px-1.5 py-0.5 rounded-sm inline-block mb-1.5 font-bold">
                          4
                        </div>
                        <p className="font-bold text-gray-800">处理人：自动带入处理时的人员信息</p>
                        <p className="font-bold text-gray-800">处理操作：办结-正常/办结-劝阻无效或误报</p>
                        <div className="mt-2 text-gray-400 flex items-center">
                          <span>猿翠小羽</span>
                          <span className="ml-1 text-yellow-500">♡</span>
                        </div>
                        {/* Connecting Visual */}
                        <div className="absolute right-full top-1/2 w-4 h-[1px] bg-yellow-400" />
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      </div>
                    )}
                  </section>
                ) : (
                  // Screen 3 and Screen 7 - Pending Event Form Submission
                  <section onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 mb-3">事件处理</h4>

                      {/* Tab Buttons (办结 vs 误报) */}
                      <div className="flex space-x-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setHandlingTab("办结")}
                          className={`px-5 py-1.5 rounded text-xs font-medium border transition cursor-pointer ${handlingTab === "办结" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                        >
                          办结
                        </button>
                        <button
                          type="button"
                          onClick={() => setHandlingTab("误报")}
                          className={`px-5 py-1.5 rounded text-xs font-medium border transition cursor-pointer ${handlingTab === "误报" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                        >
                          误报
                        </button>
                      </div>

                      {/* State Option Radios (Only visible when 办结 tab is chosen - Screen 7 action) */}
                      {handlingTab === "办结" && (
                        <div className="flex items-center space-x-6 mb-4 bg-blue-50/50 border border-blue-100 rounded p-2">
                          <label className="flex items-center text-xs text-gray-700 cursor-pointer select-none">
                            <input
                              checked={handlingSubAction === "正常"}
                              onChange={() => setHandlingSubAction("正常")}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                              name="handlingSubAction"
                              type="radio"
                            />
                            <span>正常 (办结-正常)</span>
                          </label>
                          <label className="flex items-center text-xs text-gray-700 cursor-pointer select-none">
                            <input
                              checked={handlingSubAction === "劝阻无效"}
                              onChange={() => setHandlingSubAction("劝阻无效")}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                              name="handlingSubAction"
                              type="radio"
                            />
                            <span className="text-red-600 font-semibold">劝阻无效 (高亮红色)</span>
                          </label>
                        </div>
                      )}

                      {/* Handled Opinion Textarea */}
                      <div className="mb-4 relative">
                        <label className="block text-[11px] text-gray-400 mb-1" htmlFor="opinion-textarea">处理意见</label>
                        <textarea
                          id="opinion-textarea"
                          value={opinionText}
                          onChange={(e) => setOpinionText(e.target.value.slice(0, 300))}
                          className="w-full h-24 p-3 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none leading-relaxed"
                          placeholder={handlingTab === "误报" ? "请输入误报核查事实描述..." : "请输入异常处理举措与清障反馈详情..."}
                        />
                        <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                          {opinionText.length} / 300
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors shadow-xs hover:shadow-sm cursor-pointer"
                    >
                      提 交 反 馈
                    </button>
                  </section>
                )}
              </div>

              {/* Right Side: Media Snapshots Frame */}
              <div className="flex-1 flex flex-col border border-gray-100 rounded overflow-hidden relative bg-gray-50">
                <div className="bg-white border-b border-gray-100 p-3 flex space-x-2 shrink-0">
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-xs select-none">
                    事件快照
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
                  {selectedEvent.snapshotUrl ? (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                      <img
                        src={selectedEvent.snapshotUrl}
                        alt="High Res Snapshot"
                        className="max-h-[240px] max-w-full object-contain rounded border border-gray-200 shadow-xs"
                      />
                      <p className="text-[10px] text-gray-400 mt-2">
                        智能边界识别：已划定黄色禁行管控警戒线
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Image className="w-12 h-12 text-gray-200 mb-2" />
                      <span className="text-xs">暂无图像数据</span>
                    </div>
                  )}

                  {/* Annotation 12: Action options note (Screen 7 overlay) */}
                  {showAnnotations && selectedEvent.status === EventStatus.Pending && (
                    <div className="absolute right-4 bottom-4 w-60 bg-yellow-100 border border-yellow-300 rounded p-3.5 shadow-xl text-[10.5px] leading-relaxed z-20">
                      <div className="bg-yellow-400 text-white text-[10px] px-1.5 py-0.5 rounded-sm inline-block mb-1.5 font-bold shadow-xs">
                        12
                      </div>
                      <p className="text-yellow-800 font-medium">
                        办结选项下增加【正常】、【劝阻无效】两种情况，单选。
                      </p>
                      <p className="text-red-700 font-semibold mt-1">
                        若选择劝阻无效，此事件在事件列表中将红色高亮显示。
                      </p>
                      <p className="text-[10px] text-yellow-600 mt-2 font-medium text-right">
                        激罕小狗💛
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW ORIGINAL SNAPSHOT MODAL POPUP (Screen 10) */}
      {viewImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs animate-fadeIn">
          {/* Modal Container */}
          <div className="bg-white p-2 rounded-lg relative shadow-2xl w-[640px] max-w-[95%] h-[420px] flex items-center justify-center overflow-hidden border border-gray-100">
            {/* Close Button */}
            <button
              onClick={() => setViewImageUrl(null)}
              className="absolute top-2 right-2 bg-white/90 text-gray-700 hover:bg-white hover:text-black rounded-full p-1.5 shadow-md border border-gray-200 z-[110] focus:outline-none transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulated photo preview stream */}
            <div className="w-full h-full bg-gray-50 flex flex-col justify-center items-center relative group">
              <img
                src={viewImageUrl}
                alt="Source Snapshot High Resolution"
                className="max-h-[380px] max-w-full object-contain"
              />

              {/* Annotation 11: View origin image (Screen 10 bubble) */}
              {showAnnotations && (
                <div className="absolute left-1/2 bottom-5 -translate-x-1/2 bg-white border border-yellow-400 rounded p-3 w-44 shadow-2xl z-[120]">
                  <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-[2px] h-12 bg-yellow-400">
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full -translate-x-[4px] -translate-y-[4px]" />
                  </div>
                  <div className="bg-yellow-400 text-white text-[9px] px-1.5 py-0.5 font-bold select-none inline-block rounded-xs mb-1">
                    11
                  </div>
                  <h5 className="font-bold text-gray-800 text-xs mt-0.5">查看原图</h5>
                  <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1 select-none">
                    <span>渡萃小剪</span>
                    <span className="text-yellow-400">💛</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
