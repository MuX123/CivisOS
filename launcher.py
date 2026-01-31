import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import webbrowser
import threading
import os
import sys
import time
import queue

class CivisLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("CivisOS 啟動器")
        self.root.geometry("600x450")
        self.root.resizable(False, False)
        
        # 定義顏色 (參考專案 global.css)
        self.colors = {
            'bg': '#111827',       # 深色背景
            'card': '#1f2937',     # 卡片背景
            'primary': '#3b82f6',  # 主色藍
            'success': '#22c55e',  # 成功綠
            'text': '#f3f4f6',     # 主文字
            'text_dim': '#9ca3af', # 次要文字
            'border': '#374151'    # 邊框
        }
        
        self.root.configure(bg=self.colors['bg'])
        self.server_process = None
        self.msg_queue = queue.Queue()
        
        self.setup_styles()
        self.create_widgets()
        self.check_queue()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        # Frame 樣式
        style.configure('Main.TFrame', background=self.colors['bg'])
        style.configure('Card.TFrame', background=self.colors['card'], relief='flat')
        
        # Label 樣式
        style.configure('Header.TLabel', background=self.colors['bg'], foreground=self.colors['text'], font=('Outfit', 24, 'bold'))
        style.configure('Status.TLabel', background=self.colors['card'], foreground=self.colors['text_dim'], font=('Inter', 10))
        
        # Button 樣式 (自定義)
        style.configure('Primary.TButton', 
            font=('Inter', 11, 'bold'),
            background=self.colors['primary'],
            foreground='white',
            borderwidth=0,
            focuscolor=self.colors['primary'],
            padding=10
        )
        style.map('Primary.TButton',
            background=[('active', '#2563eb')], # darker blue
            relief=[('pressed', 'flat')]
        )

        style.configure('Secondary.TButton', 
            font=('Inter', 11),
            background=self.colors['card'],
            foreground=self.colors['text'],
            borderwidth=1,
            bordercolor=self.colors['border'],
            padding=10
        )
        style.map('Secondary.TButton',
            background=[('active', '#374151')],
            foreground=[('active', 'white')]
        )

    def create_widgets(self):
        # 主容器
        main_frame = ttk.Frame(self.root, style='Main.TFrame')
        main_frame.pack(fill='both', expand=True, padx=30, pady=30)
        
        # 標題區
        header_frame = ttk.Frame(main_frame, style='Main.TFrame')
        header_frame.pack(fill='x', pady=(0, 20))
        
        title = ttk.Label(header_frame, text="CivisOS System", style='Header.TLabel')
        title.pack(side='left')
        
        version = ttk.Label(header_frame, text="v1.0.0", background=self.colors['bg'], foreground=self.colors['primary'])
        version.pack(side='left', padx=(10, 0), pady=(10, 0))

        # 狀態日誌區 (模擬終端機)
        log_frame = ttk.LabelFrame(main_frame, text=" 系統日誌 ", style='Card.TFrame', padding=10)
        log_frame.pack(fill='both', expand=True, pady=(0, 20))
        
        # 配置 LabelFrame 的文字顏色
        self.root.option_add('*TLabelFrame.Label.foreground', self.colors['text_dim'])
        self.root.option_add('*TLabelFrame.Label.background', self.colors['card'])
        
        self.log_text = tk.Text(log_frame, height=10, bg='#0f1115', fg='#e5e7eb', 
                               bd=0, font=('Consolas', 10), padx=10, pady=10)
        self.log_text.pack(fill='both', expand=True)
        self.log("歡迎使用 CivisOS 啟動器。")
        self.log("等待指令...")

        # 按鈕控制區
        btn_frame = ttk.Frame(main_frame, style='Main.TFrame')
        btn_frame.pack(fill='x')
        
        # 啟動伺服器按鈕
        self.btn_start = ttk.Button(btn_frame, text="🚀 啟動開發伺服器", style='Primary.TButton', command=self.start_system)
        self.btn_start.pack(side='left', fill='x', expand=True, padx=(0, 10))
        
        # 僅開啟網頁按鈕
        self.btn_open_web = ttk.Button(btn_frame, text="🌐 開啟網站", style='Secondary.TButton', command=self.open_website_only)
        self.btn_open_web.pack(side='left', fill='x', expand=True, padx=(0, 10))

        # 停止按鈕
        self.btn_stop = ttk.Button(btn_frame, text="⏹ 停止", style='Secondary.TButton', command=self.stop_server, state='disabled')
        self.btn_stop.pack(side='left', fill='x', expand=True)

    def log(self, message):
        self.msg_queue.put(f"[{time.strftime('%H:%M:%S')}] {message}\n")

    def check_queue(self):
        while not self.msg_queue.empty():
            msg = self.msg_queue.get()
            self.log_text.insert('end', msg)
            self.log_text.see('end')
        self.root.after(100, self.check_queue)

    def start_system(self):
        if self.server_process:
            messagebox.showinfo("提示", "伺服器已經在運行中")
            return

        self.btn_start.configure(state='disabled')
        self.btn_stop.configure(state='normal')
        
        thread = threading.Thread(target=self.run_startup_sequence)
        thread.daemon = True
        thread.start()

    def run_startup_sequence(self):
        # 1. 檢查 node_modules
        if not os.path.exists("node_modules"):
            self.log("偵測到首次執行，正在安裝依賴套件 (npm install)...")
            try:
                subprocess.check_call("npm install", shell=True)
                self.log("依賴套件安裝完成。")
            except subprocess.CalledProcessError:
                self.log("錯誤：安裝失敗。請檢查 Node.js 是否已安裝。")
                self.reset_ui()
                return

        # 2. 啟動伺服器
        self.log("正在啟動 Vite 開發伺服器...")
        try:
            # 使用 shell=True 在 Windows 上執行 npm
            self.server_process = subprocess.Popen(
                "npm run dev", 
                shell=True, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # 3. 監聽輸出並自動開啟瀏覽器
            threading.Thread(target=self.monitor_server_output, daemon=True).start()
            
        except Exception as e:
            self.log(f"啟動失敗: {str(e)}")
            self.reset_ui()

    def monitor_server_output(self):
        opened = False
        while self.server_process and self.server_process.stdout:
            line = self.server_process.stdout.readline()
            if not line:
                break
            
            # 清理輸出並顯示
            clean_line = line.strip()
            if clean_line:
                self.log(f"> {clean_line}")
            
            # 偵測到 Ready 訊號時開啟瀏覽器
            if "Local:" in line and not opened:
                self.log("伺服器已就緒！正在開啟瀏覽器...")
                time.sleep(1)
                self.root.after(0, lambda: webbrowser.open("http://localhost:5173"))
                opened = True

    def open_website_only(self):
        self.log("正在開啟瀏覽器前往 http://localhost:5173 ...")
        webbrowser.open("http://localhost:5173")

    def stop_server(self):
        if self.server_process:
            self.log("正在停止伺服器...")
            # Windows 上殺死進程樹比較複雜，這裡用簡單的 taskkill
            if os.name == 'nt':
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(self.server_process.pid)])
            else:
                self.server_process.terminate()
            
            self.server_process = None
            self.log("伺服器已停止。")
            self.reset_ui()

    def reset_ui(self):
        self.root.after(0, lambda: self.btn_start.configure(state='normal'))
        self.root.after(0, lambda: self.btn_stop.configure(state='disabled'))

    def on_closing(self):
        if self.server_process:
            if messagebox.askokcancel("退出", "伺服器正在運行，確定要關閉嗎？"):
                self.stop_server()
                self.root.destroy()
        else:
            self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = CivisLauncher(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()