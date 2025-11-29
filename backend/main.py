from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
import models, schemas, csp_logic

# Pastikan table terbuat (tapi lebih baik pakai SQL script manual di awal)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GymAI API")

# Setup CORS agar Frontend React (beda port) bisa akses Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Di production ganti jadi URL frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GymAI Backend is Running!"}

@app.post("/generate-schedule", response_model=schemas.ScheduleResponse)
def generate_schedule(user_input: schemas.UserProfileInput, db: Session = Depends(get_db)):
    # 1. Ambil Knowledge Base Latihan
    exercises = db.query(models.Exercise).all()
    
    if not exercises:
        # Jika tabel kosong, kasih pesan error yang jelas
        raise HTTPException(status_code=500, detail="Exercise library kosong. Harap jalankan script SQL Insert Data.")
        
    # 2. Jalankan Logika CSP
    try:
        generated_plan = csp_logic.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error algoritma: {str(e)}")
    
    # 3. Format Output untuk React
    response_items = []
    for item in generated_plan:
        ex = item["exercise"]
        
        # Placeholder AI Generator (Nanti diganti Gemini API real)
        ai_tip = f"Lakukan {ex.name} fokus pada otot {ex.muscle_group}. Pastikan form sempurna!"
        
        response_items.append(schemas.ScheduleItemResponse(
            day=item["day"],
            exercise_name=ex.name,
            time=str(item["time"]),
            duration=item["duration"],
            muscle_group=ex.muscle_group,
            tips=ai_tip
        ))
        
    motivation_text = f"Bagus! Jadwal {user_input.sessions_per_week} sesi minggu ini telah dibuat. Target: {user_input.goal}."
    
    return schemas.ScheduleResponse(
        motivation=motivation_text,
        schedule=response_items
    )
