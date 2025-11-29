from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# --- KONFIGURASI KEAMANAN ---
# Ganti dengan string acak yang panjang & rahasia
SECRET_KEY = "rahasia_super_kunci_ganti_dengan_random_string_panjang_sekali_12345" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Token berlaku 1 jam

# Konfigurasi Hash Password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Mengecek apakah password input sesuai dengan hash di DB"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Mengubah password plain text menjadi hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Membuat JWT Token untuk user yang berhasil login"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
