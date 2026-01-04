import asyncio
import sys
import os
import tempfile
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import RPCError

# UI kutubxonalari
try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
        QLineEdit, QPushButton, QLabel, QListWidget, QListWidgetItem, 
        QStackedWidget, QTextBrowser, QFrame, QScrollArea
    )
    from PyQt6.QtCore import Qt, pyqtSignal, QSize
    from PyQt6.QtGui import QFont, QIcon, QColor, QPalette
except ImportError:
    print("❌ PyQt6 topilmadi. Iltimos o'rnating: pip install PyQt6")
    sys.exit(1)

from dotenv import load_dotenv

load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")

if not API_ID or not API_HASH:
    raise RuntimeError("❌ TELEGRAM_API_ID yoki TELEGRAM_API_HASH topilmadi (.env tekshiring)")

TEMP_DIR = os.path.join(tempfile.gettempdir(), "hasker_media")
os.makedirs(TEMP_DIR, exist_ok=True)

class HaskerUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Hasker - Telegram Manager")
        self.resize(1000, 700)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f2f5;
            }
            QWidget {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            QLineEdit {
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: white;
                font-size: 14px;
            }
            QPushButton {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton#primary {
                background-color: #1e88e5;
                color: white;
                border: none;
            }
            QPushButton#primary:hover {
                background-color: #1976d2;
            }
            QListWidget {
                border: none;
                background-color: white;
                outline: none;
            }
            QListWidget::item {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            QListWidget::item:selected {
                background-color: #e3f2fd;
                color: #1976d2;
            }
        """)

        self.client = None
        self.loop = asyncio.get_event_loop()
        
        # Markaziy vidjet va stack
        self.central_widget = QStackedWidget()
        self.setCentralWidget(self.central_widget)

        # Sahifalar
        self.init_login_page()
        self.init_main_page()

    def init_login_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(20)

        # Logo/Title
        title = QLabel("Hasker Login")
        title.setStyleSheet("font-size: 32px; font-weight: bold; color: #1e88e5;")
        layout.addWidget(title, alignment=Qt.AlignmentFlag.AlignCenter)

        self.session_input = QLineEdit()
        self.session_input.setPlaceholderText("StringSession ni kiriting...")
        self.session_input.setFixedWidth(400)
        layout.addWidget(self.session_input, alignment=Qt.AlignmentFlag.AlignCenter)

        login_btn = QPushButton("Ulanish")
        login_btn.setObjectName("primary")
        login_btn.setFixedWidth(400)
        login_btn.clicked.connect(self.start_login)
        layout.addWidget(login_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        self.status_label = QLabel("")
        self.status_label.setStyleSheet("color: #666;")
        layout.addWidget(self.status_label, alignment=Qt.AlignmentFlag.AlignCenter)

        self.central_widget.addWidget(page)

    def init_main_page(self):
        page = QWidget()
        main_layout = QHBoxLayout(page)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar (Telegram kabi)
        sidebar = QFrame()
        sidebar.setFixedWidth(300)
        sidebar.setStyleSheet("background-color: white; border-right: 1px solid #ddd;")
        sidebar_layout = QVBoxLayout(sidebar)
        
        header = QLabel("Dialoglar")
        header.setStyleSheet("font-size: 20px; font-weight: bold; padding: 15px; color: #1e88e5;")
        sidebar_layout.addWidget(header)

        self.dialog_list = QListWidget()
        self.dialog_list.itemClicked.connect(self.on_dialog_selected)
        sidebar_layout.addWidget(self.dialog_list)

        # Chat Area
        chat_area = QFrame()
        chat_layout = QVBoxLayout(chat_area)
        
        self.chat_title = QLabel("Chatni tanlang")
        self.chat_title.setStyleSheet("font-size: 18px; font-weight: bold; padding: 15px; background-color: white; border-bottom: 1px solid #ddd;")
        chat_layout.addWidget(self.chat_title)

        self.message_browser = QTextBrowser()
        self.message_browser.setStyleSheet("border: none; background-color: #f0f2f5; padding: 20px; font-size: 14px;")
        chat_layout.addWidget(self.message_browser)

        main_layout.addWidget(sidebar)
        main_layout.addWidget(chat_area)

        self.central_widget.addWidget(page)

    def start_login(self):
        session = self.session_input.text().strip()
        if not session:
            self.status_label.setText("❌ Session bo'sh bo'lishi mumkin emas")
            return
        
        self.status_label.setText("⌛ Ulanmoqda...")
        asyncio.ensure_future(self.connect_telegram(session))

    async def connect_telegram(self, session_string):
        try:
            self.client = TelegramClient(StringSession(session_string), API_ID, API_HASH)
            await self.client.connect()
            
            if not await self.client.is_user_authorized():
                self.status_label.setText("❌ Avtorizatsiya xatosi")
                return

            me = await self.client.get_me()
            self.status_label.setText(f"✅ @{me.username} sifatida ulandi")
            
            # Dialoglarni yuklash
            await self.load_ui_dialogs()
            self.central_widget.setCurrentIndex(1)
            
        except Exception as e:
            self.status_label.setText(f"❌ Xato: {str(e)}")

    async def load_ui_dialogs(self):
        self.dialog_list.clear()
        self.all_dialogs = []
        async for dialog in self.client.iter_dialogs():
            self.all_dialogs.append(dialog)
            item = QListWidgetItem(f"{dialog.name}")
            icon_text = "📢" if dialog.is_channel and not dialog.is_group else "👥" if dialog.is_group else "👤"
            item.setText(f"{icon_text} {dialog.name}")
            self.dialog_list.addItem(item)

    def on_dialog_selected(self, item):
        index = self.dialog_list.row(item)
        dialog = self.all_dialogs[index]
        self.chat_title.setText(f"💬 {dialog.name}")
        asyncio.ensure_future(self.load_messages(dialog))

    async def load_messages(self, dialog):
        """
        Telegram-style chat bubbles:
        - Incoming messages: LEFT, white rounded bubble
        - Outgoing messages: RIGHT, dodgerblue rounded bubble
        - Each message is a compact bubble (not full-width rows)
        """
        self.message_browser.clear()

        try:
            blocks = []

            async for msg in self.client.iter_messages(dialog.entity, limit=50):
                is_out = msg.out

                # Time
                time_str = msg.date.strftime("%H:%M") if msg.date else ""

                # Sender name (only for incoming)
                sender_html = ""
                if not is_out and msg.sender:
                    sender_html = f"""
                    <div style="
                        font-size:11px;
                        font-weight:600;
                        color:#1e88e5;
                        margin-bottom:4px;
                    ">
                        {msg.sender.first_name or "Noma'lum"}
                    </div>
                    """

                # Text
                text_html = (msg.text or "").replace("\n", "<br>")

                # Media (photos)
                media_html = ""
                if msg.photo:
                    try:
                        path = os.path.join(TEMP_DIR, f"{msg.id}.jpg")
                        if not os.path.exists(path):
                            await msg.download_media(file=path)
                        media_html = f"""
                        <img src="{path}" style="
                            max-width:260px;
                            border-radius:16px;
                            margin-bottom:6px;
                        ">
                        """
                    except Exception:
                        media_html = "<i>[Rasm yuklanmadi]</i><br>"

                # Bubble layout
                align = "flex-end" if is_out else "flex-start"
                bubble_bg = "#1e90ff" if is_out else "#ffffff"
                text_color = "#ffffff" if is_out else "#000000"

                bubble_html = f"""
                <div style="
                    display:flex;
                    justify-content:{align};
                    margin:8px 0;
                ">
                    <div style="
                        background:{bubble_bg};
                        color:{text_color};
                        padding:8px 12px;
                        border-radius:18px;
                        border-top-left-radius:{'18px' if is_out else '6px'};
                        border-top-right-radius:{'6px' if is_out else '18px'};
                        max-width:70%;
                        width:fit-content;
                        font-size:14px;
                        line-height:1.4;
                        box-shadow:0 1px 2px rgba(0,0,0,0.12);
                        word-break:break-word;
                    ">
                        {sender_html}
                        {media_html}
                        <div>{text_html}</div>
                        <div style="
                            text-align:right;
                            font-size:10px;
                            opacity:0.6;
                            margin-top:4px;
                        ">
                            {time_str}
                        </div>
                    </div>
                </div>
                """

                blocks.append(bubble_html)

            self.message_browser.setHtml(
                "<body style='background:#eef3f7; padding:12px;'>" +
                "".join(reversed(blocks)) +
                "</body>"
            )

            bar = self.message_browser.verticalScrollBar()
            bar.setValue(bar.maximum())

        except Exception as e:
            self.message_browser.setText(f"Xato: {str(e)}")

def main():
    app = QApplication(sys.argv)
    
    # Asyncio va PyQt6 integratsiyasi uchun oddiy wrapper
    import qasync
    loop = qasync.QEventLoop(app)
    asyncio.set_event_loop(loop)
    
    window = HaskerUI()
    window.show()
    
    with loop:
        loop.run_forever()

if __name__ == "__main__":
    # qasync kutubxonasi kerak bo'ladi, agar yo'q bo'lsa o'rnatishni so'raymiz
    try:
        import qasync
        main()
    except ImportError:
        print("❌ qasync topilmadi. Iltimos o'rnating: pip install qasync")
