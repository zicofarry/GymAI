from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from database import engine, Base, get_db
import models, schemas, csp_logic, auth
from jose import JWTError, jwt
import os

# Init DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GymAI API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency untuk cek token (Proteksi Halaman)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- ENDPOINTS AUTH ---

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Cek email duplikat
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Buat User Baru
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Langsung login setelah register
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "username": new_user.username}

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Invalid Credentials")
        
    if not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=404, detail="Invalid Credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

# --- ENDPOINTS FITUR (YANG DIPROTEKSI) ---

@app.post("/generate-schedule", response_model=schemas.ScheduleResponse)
def generate_schedule(
    user_input: schemas.UserProfileInput, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # <-- WAJIB LOGIN
):
    # Logic sama seperti sebelumnya...
    exercises = db.query(models.Exercise).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="Exercise library kosong.")
        
    try:
        generated_plan = csp_logic.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error algoritma: {str(e)}")
    
    response_items = []
    # (Bagian AI Generation disederhanakan dulu biar gak error kalau API key mati)
    for item in generated_plan:
        ex = item["exercise"]
        response_items.append(schemas.ScheduleItemResponse(
            day=item["day"],
            exercise_name=ex.name,
            time=str(item["time"]),
            duration=item["duration"],
            muscle_group=str(ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else ex.muscle_group),
            tips=f"Lakukan {ex.name} dengan benar!"
        ))
        
    return schemas.ScheduleResponse(
        motivation=f"Halo {current_user.username}, Semangat latihan!",
        schedule=response_items
    )