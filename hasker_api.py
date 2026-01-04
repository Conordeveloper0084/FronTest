import os
import asyncio
import tempfile
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import RPCError
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

_clients = {}

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
    if session_string in _clients:
        client = _clients[session_string]
        if client.is_connected():
            return client

    client = TelegramClient(
        StringSession(session_string),
        API_ID,
        API_HASH,
    )
    await client.connect()

    if not await client.is_user_authorized():
        raise HTTPException(status_code=401, detail="Session invalid")

    _clients[session_string] = client
    return client

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
    except RPCError as e:
        raise HTTPException(status_code=400, detail=str(e))


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

    # eski → yangi
    return list(reversed(msgs))