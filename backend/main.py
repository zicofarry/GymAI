from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
import models, schemas, csp_logic
import os
import google.generativeai as genai # Import library Google AI

# Load API Key
from dotenv import load_dotenv
load_dotenv()

# Konfigurasi Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GymAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GymAI Backend is Running!"}

def generate_ai_tip(exercise_name, muscle_group):
    """Fungsi helper untuk minta tips ke Gemini"""
    try:
        prompt = f"Berikan 1 kalimat tips singkat, padat, dan memotivasi untuk melakukan latihan '{exercise_name}' yang melatih otot {muscle_group} dalam Bahasa Indonesia."
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return f"Lakukan {exercise_name} dengan fokus penuh pada otot {muscle_group}!"

@app.post("/generate-schedule", response_model=schemas.ScheduleResponse)
def generate_schedule(user_input: schemas.UserProfileInput, db: Session = Depends(get_db)):
    exercises = db.query(models.Exercise).all()
    
    if not exercises:
        raise HTTPException(status_code=500, detail="Exercise library kosong. Harap jalankan script SQL Insert Data.")
        
    try:
        generated_plan = csp_logic.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error algoritma: {str(e)}")
    
    response_items = []
    
    # Generate Motivation Sekali Saja untuk Header
    try:
        motivation_prompt = f"Buat 1 kalimat semangat pendek untuk user level {user_input.fitness_level} yang ingin {user_input.goal}."
        motivation_res = model.generate_content(motivation_prompt)
        motivation_text = motivation_res.text.strip()
    except:
        motivation_text = f"Jadwal {user_input.sessions_per_week} sesi siap! Fokus goal: {user_input.goal}."

    for item in generated_plan:
        ex = item["exercise"]
        
        # Panggil AI untuk setiap item (Bisa agak lambat, tapi hasil lebih bagus)
        # Untuk performa lebih cepat, tips bisa di-generate batch atau pakai template
        ai_tip = generate_ai_tip(ex.name, str(ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else ex.muscle_group))
        
        response_items.append(schemas.ScheduleItemResponse(
            day=item["day"],
            exercise_name=ex.name,
            time=str(item["time"]),
            duration=item["duration"],
            muscle_group=str(ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else ex.muscle_group),
            tips=ai_tip
        ))
        
    return schemas.ScheduleResponse(
        motivation=motivation_text,
        schedule=response_items
    )