# How to Install and Run

1. Install untuk backend
   ```
   cd backend/
   pip install -r requirements.txt
   ```

2. Install untuk frontend
   ```
   cd frontend/
   npm install
   ```

3. Import database
   
   import file backend/db/gymai.sql ke mysql kalian, pastikan servernya sudah dijalankan

4. Jalankan server backend
   ```
   cd backend/
   uvicorn main:app --reload
   ```

5. Jalankan server frontend
   ```
   cd frontend/
   npm run dev
   ```

Website harusnya sudah bisa dijalankan
   
