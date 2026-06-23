import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Info } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
  showAnnotations: boolean;
}

export default function LoginView({ onLoginSuccess, showAnnotations }: LoginViewProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("请输入账号");
      return;
    }
    if (!password) {
      setErrorMessage("请输入密码");
      return;
    }
    
    // Simulate simple log in (we support any username, admin/admin standard)
    onLoginSuccess(username);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 relative min-h-[calc(100vh-60px)]">
      {/* Background decoration elements */}
      <div className="absolute inset-x-0 top-0 bottom-0 bg-[#f4f6f8] -z-10" />

      {/* Login Card Container */}
      <div className="bg-white w-full max-w-md rounded-lg p-10 md:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-gray-100 z-10 transition-all">
        {/* Login Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">登录</h2>
          <p className="text-xs text-gray-400 mt-2">收费站监控与异常状态响应平台</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 px-4 py-2 text-xs rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Username Input */}
          <div className="relative">
            <label className="sr-only" htmlFor="username-input">账号</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input
              id="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm"
              placeholder="请输入账号"
              type="text"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="sr-only" htmlFor="password-input">密码</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm"
              placeholder="请输入密码"
              type={showPassword ? "text" : "password"}
            />
            
            {/* Show/hide Eye icon wrapper */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              title={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Annotation 2: Show/Hide Password */}
            {showAnnotations && (
              <div className="hidden lg:block absolute -right-60 top-1/2 -translate-y-1/2 z-20 pointer-events-none w-52">
                <div className="relative">
                  <div className="absolute -left-12 top-11/12 w-12 h-[2px] bg-yellow-400" />
                  <div className="absolute -left-12 top-11/12 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="bg-white border border-[#f9da85] rounded shadow-md overflow-hidden">
                    <div className="bg-[#f9da85] px-2 py-0.5 text-xs font-bold text-gray-800">2</div>
                    <div className="p-2 text-[11px] text-gray-700 leading-relaxed">
                      显示/隐藏密码
                    </div>
                    <div className="px-2 pb-1.5 text-[9px] text-gray-400 text-right">菠萃小驹💛</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm select-none relative">
            <label className="flex items-center text-gray-500 cursor-pointer text-xs">
              <input
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 mr-2 h-4 w-4"
                type="checkbox"
              />
              <span>记住密码</span>
            </label>

            {/* Annotation 1: Remember Me */}
            {showAnnotations && (
              <div className="hidden lg:block absolute -left-64 bottom-6 z-20 pointer-events-none w-52">
                <div className="relative">
                  <div className="bg-white border border-[#f9da85] rounded shadow-md overflow-hidden">
                    <div className="bg-[#f9da85] px-2 py-0.5 text-xs font-bold text-gray-800">1</div>
                    <div className="p-2 text-[11px] text-gray-700 leading-relaxed">
                      可选择记住密码
                    </div>
                    <div className="px-2 pb-1.5 text-[9px] text-gray-400 text-right">菠萃小驹💛</div>
                  </div>
                  {/* Vertical connector line up to checkbox vicinity */}
                  <div className="absolute left-[80%] bottom-[-50px] w-[2px] h-[50px] bg-yellow-400" />
                  <div className="absolute left-[80%] bottom-[-50px] -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400" />
                </div>
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setTooltipVisible(!tooltipVisible)}
                onBlur={() => setTimeout(() => setTooltipVisible(false), 200)}
                className="text-gray-400 hover:text-blue-600 transition-colors text-xs focus:outline-none"
              >
                忘记密码?
              </button>

              {/* Forgot password tooltip overlay as shown in Screen 1 */}
              {tooltipVisible && (
                <div className="absolute right-0 bottom-full mb-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-20">
                  请联系管理员重置
                  <div className="absolute right-4 top-full w-0 h-0 border-t-4 border-t-gray-800 border-x-4 border-x-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md shadow-lg shadow-blue-500/25 transition-all duration-200 text-sm cursor-pointer"
              type="submit"
            >
              登录
            </button>
          </div>
        </form>
      </div>

      {/* Mobile/Floating Hint on how to log in */}
      <div className="absolute bottom-6 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2 shadow-sm z-10 max-w-md">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">快捷登录：</span>
          任何用户名与密码均可直接登录（系统默认内置管理员账户 <code className="bg-blue-100 px-1 rounded font-mono text-blue-900">admin</code>）。
        </div>
      </div>
    </div>
  );
}
