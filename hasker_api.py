import os
import asyncio
import tempfile
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import RPCError, AuthKeyUnregisteredError
from dotenv import load_dotenv

# =====================
# ENV
# =====================
load_dotenv()

API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")

if not API_ID or not API_HASH:
    raise RuntimeError("TELEGRAM_API_ID yoki TELEGRAM_API_HASH yo‘q")

API_ID = int(API_ID)

TEMP_DIR = os.path.join(tempfile.gettempdir(), "hasker_media")
os.makedirs(TEMP_DIR, exist_ok=True)

# =====================
# FASTAPI
# =====================
app = FastAPI(title="Hasker API", version="1.0")

# session_string -> TelegramClient
_clients: dict[str, TelegramClient] = {}

# =====================
# SCHEMAS
# =====================
class SessionIn(BaseModel):
    session: str

class DialogOut(BaseModel):
    id: int
    name: str
    is_group: bool
    is_channel: bool

class MessageOut(BaseModel):
    id: int
    out: bool
    sender: Optional[str]
    text: str
    time: Optional[str]
    media_path: Optional[str]

# =====================
# UTILS
# =====================
async def get_client(session_string: str) -> TelegramClient:
    # 🔁 Agar oldin ulangan bo‘lsa
    if session_string in _clients:
        client = _clients[session_string]
        if client.is_connected():
            print("♻️ Reusing existing client")
            return client

    print("🔌 Creating new TelegramClient")

    client = TelegramClient(
        StringSession(session_string),
        API_ID,
        API_HASH,
    )

    try:
        await client.connect()
    except Exception as e:
        print("❌ CONNECT ERROR:", e)
        raise HTTPException(status_code=400, detail="Telegram connect error")

    try:
        authorized = await client.is_user_authorized()
        print("🔐 AUTHORIZED:", authorized)
    except AuthKeyUnregisteredError:
        authorized = False

    if not authorized:
        # ⚠️ Session noto‘g‘ri YOKI band
        raise HTTPException(
            status_code=409,
            detail="SESSION_IN_USE_OR_INVALID"
        )

    _clients[session_string] = client
    return client


async def drop_client(session_string: str):
    client = _clients.pop(session_string, None)
    if client:
        try:
            await client.disconnect()
            print("🧹 Client disconnected")
        except Exception:
            pass

# =====================
# ROUTES
# =====================
@app.post("/connect")
async def connect(session: SessionIn):
    try:
        client = await get_client(session.session)
        me = await client.get_me()
        return {
            "ok": True,
            "username": me.username,
            "id": me.id,
        }
    except HTTPException:
        raise
    except RPCError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/disconnect")
async def disconnect(session: SessionIn):
    await drop_client(session.session)
    return {"ok": True}


@app.post("/dialogs", response_model=List[DialogOut])
async def dialogs(session: SessionIn):
    client = await get_client(session.session)

    result = []
    async for d in client.iter_dialogs():
        result.append(DialogOut(
            id=d.id,
            name=d.name,
            is_group=d.is_group,
            is_channel=d.is_channel,
        ))

    return result


@app.post("/messages/{dialog_id}", response_model=List[MessageOut])
async def messages(dialog_id: int, session: SessionIn):
    client = await get_client(session.session)

    msgs = []
    async for msg in client.iter_messages(dialog_id, limit=50):
        media_path = None

        if msg.photo:
            path = os.path.join(TEMP_DIR, f"{msg.id}.jpg")
            if not os.path.exists(path):
                await msg.download_media(path)
            media_path = path

        msgs.append(MessageOut(
            id=msg.id,
            out=msg.out,
            sender=msg.sender.first_name if msg.sender else None,
            text=msg.text or "",
            time=msg.date.strftime("%H:%M") if msg.date else None,
            media_path=media_path,
        ))

    return list(reversed(msgs))


@app.get("/")
def root():
    return {"status": "Hasker API is running"}

@app.get("/health")
def health():
    return {"ok": True}