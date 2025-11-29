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
   
   import file dari database/gymai.sql ke mysql kalian, pastikan servernya sudah dijalan

4. Setup environment
   
   buatlah file .env di dalam folder backend, dengan isian seperti ini

   ```
   DATABASE_URL=mysql+pymysql://root:@localhost/gymai
   GEMINI_API_KEY=isi_dengan_token_api_gemini_anda
   ```
   
5. Jalankan server backend
   ```
   cd backend/
   uvicorn app.main:app --reload
   ```

6. Jalankan server frontend
   ```
   cd frontend/
   npm run dev
   ```

Website harusnya sudah bisa dijalankan
   
