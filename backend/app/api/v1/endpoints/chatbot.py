from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from app.api import deps
from app.models.user import User
from app.services.chat_service import chat_service

router = APIRouter()

# Update Schema: Tambahkan field 'mode'
class ChatRequest(BaseModel):
    message: str
    mode: Literal["info", "action"] = "info" # Default ke info kalau tidak diisi

class ChatResponse(BaseModel):
    reply: str

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Endpoint Chatbot Hybrid.
    - mode="info" -> Tanya jawab seputar fitness (AI tidak punya akses DB).
    - mode="action" -> Perintah update data (AI fokus memanggil Tools).
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong")
        
    reply_text = await chat_service.process_chat(
        db=db, 
        user=current_user, 
        message=request.message,
        mode=request.mode # <-- Kirim mode ke service
    )
    
    return {"reply": reply_text}