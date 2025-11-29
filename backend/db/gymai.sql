-- 1. Buat Database GymAI
CREATE DATABASE IF NOT EXISTS gymai;
USE gymai;

-- 2. Tabel Users (LENGKAP)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Wajib diisi dummy dulu
    weight_kg FLOAT,
    height_cm INT,
    fitness_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Athlete') DEFAULT 'Beginner',
    main_goal ENUM('Fat Loss', 'Muscle Gain', 'Stay Healthy', 'Flexibility') DEFAULT 'Stay Healthy',
    location_preference ENUM('Home', 'Gym') DEFAULT 'Home',
    target_sessions_per_week INT DEFAULT 3,
    preferred_duration_minutes INT DEFAULT 45, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel User Busy Times
CREATE TABLE user_busy_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME,
    end_time TIME,
    is_full_day BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel Exercise Library
CREATE TABLE exercise_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('Strength', 'Cardio', 'Flexibility', 'HIIT') NOT NULL,
    muscle_group ENUM('Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio') NOT NULL,
    equipment_type ENUM('None', 'Dumbbell', 'Barbell', 'Machine', 'Resistance Band') DEFAULT 'None',
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    default_duration_minutes INT DEFAULT 10,
    calories_burn_estimate INT,
    description TEXT
);

-- 5. Tabel Schedules
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    ai_weekly_motivation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Tabel Schedule Items
CREATE TABLE schedule_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    exercise_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    ai_custom_tips TEXT, 
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercise_library(id)
);

-- 7. Tabel User Logs
CREATE TABLE user_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_item_id INT,
    log_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    actual_duration_minutes INT,
    calories_burned INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_item_id) REFERENCES schedule_items(id) ON DELETE SET NULL
);

-- =============================================
-- SEED DATA (UPDATE: Dengan Password Hash Dummy)
-- =============================================

-- Dummy User (ID 1)
INSERT INTO users (username, email, password_hash, weight_kg, height_cm, fitness_level, main_goal, location_preference, target_sessions_per_week) 
VALUES ('azmi_dev', 'azmi@gymai.com', 'dummy_hashed_password_123', 70, 175, 'Beginner', 'Muscle Gain', 'Home', 3);

-- Dummy Busy Times
INSERT INTO user_busy_times (user_id, day_of_week, start_time, end_time, is_full_day) VALUES 
(1, 'Monday', '00:00:00', '23:59:59', TRUE),
(1, 'Wednesday', '08:00:00', '12:00:00', FALSE);

-- Dummy Exercise Library
INSERT INTO exercise_library (name, category, muscle_group, equipment_type, difficulty_level, default_duration_minutes, description) VALUES 
('Push Up', 'Strength', 'Chest', 'None', 'Beginner', 10, 'Latihan dasar dada'),
('Bodyweight Squat', 'Strength', 'Legs', 'None', 'Beginner', 10, 'Latihan dasar kaki'),
('Plank', 'Strength', 'Core', 'None', 'Beginner', 5, 'Menahan posisi lurus'),
('Jumping Jacks', 'Cardio', 'Full Body', 'None', 'Beginner', 15, 'Latihan kardio ringan'),
('Dumbbell Bench Press', 'Strength', 'Chest', 'Dumbbell', 'Intermediate', 15, 'Latihan dada dengan beban'),
('Treadmill Run', 'Cardio', 'Cardio', 'Machine', 'Beginner', 30, 'Lari statis');