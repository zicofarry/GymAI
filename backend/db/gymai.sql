-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 29, 2025 at 06:48 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gymai`
--

-- --------------------------------------------------------

--
-- Table structure for table `exercise_library`
--

CREATE TABLE `exercise_library` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('Strength','Cardio','Flexibility','HIIT') COLLATE utf8mb4_general_ci NOT NULL,
  `muscle_group` enum('Chest','Back','Legs','Shoulders','Arms','Core','Full Body','Cardio') COLLATE utf8mb4_general_ci NOT NULL,
  `equipment_type` enum('None','Dumbbell','Barbell','Machine','Resistance Band') COLLATE utf8mb4_general_ci DEFAULT 'None',
  `difficulty_level` enum('Beginner','Intermediate','Advanced') COLLATE utf8mb4_general_ci DEFAULT 'Beginner',
  `default_duration_minutes` int DEFAULT '10',
  `calories_burn_estimate` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exercise_library`
--

INSERT INTO `exercise_library` (`id`, `name`, `category`, `muscle_group`, `equipment_type`, `difficulty_level`, `default_duration_minutes`, `calories_burn_estimate`, `description`) VALUES
(1, 'Push Up', 'Strength', 'Chest', 'None', 'Beginner', 10, NULL, 'Latihan dasar dada'),
(2, 'Bodyweight Squat', 'Strength', 'Legs', 'None', 'Beginner', 10, NULL, 'Latihan dasar kaki'),
(3, 'Plank', 'Strength', 'Core', 'None', 'Beginner', 5, NULL, 'Menahan posisi lurus'),
(4, 'Jumping Jacks', 'Cardio', 'Full Body', 'None', 'Beginner', 15, NULL, 'Latihan kardio ringan'),
(5, 'Dumbbell Bench Press', 'Strength', 'Chest', 'Dumbbell', 'Intermediate', 15, NULL, 'Latihan dada dengan beban'),
(6, 'Treadmill Run', 'Cardio', 'Cardio', 'Machine', 'Beginner', 30, NULL, 'Lari statis');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `ai_weekly_motivation` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedule_items`
--

CREATE TABLE `schedule_items` (
  `id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `exercise_id` int NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_general_ci NOT NULL,
  `scheduled_time` time NOT NULL,
  `duration_minutes` int NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `ai_custom_tips` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `weight_kg` float DEFAULT NULL,
  `height_cm` int DEFAULT NULL,
  `fitness_level` enum('Beginner','Intermediate','Advanced','Athlete') COLLATE utf8mb4_general_ci DEFAULT 'Beginner',
  `main_goal` enum('Fat Loss','Muscle Gain','Stay Healthy','Flexibility') COLLATE utf8mb4_general_ci DEFAULT 'Stay Healthy',
  `location_preference` enum('Home','Gym') COLLATE utf8mb4_general_ci DEFAULT 'Home',
  `target_sessions_per_week` int DEFAULT '3',
  `preferred_duration_minutes` int DEFAULT '45',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `weight_kg`, `height_cm`, `fitness_level`, `main_goal`, `location_preference`, `target_sessions_per_week`, `preferred_duration_minutes`, `created_at`, `updated_at`) VALUES
(1, 'azmi_dev', 'azmi@gymai.com', 'dummy_hashed_password_123', 70, 175, 'Beginner', 'Muscle Gain', 'Home', 3, 45, '2025-11-29 04:33:54', '2025-11-29 04:33:54'),
(2, 'zicofarry', 'zicofarry@gmail.com', '$2b$12$Aq4yAyAEJga6CLNkFVP35uDAL7YM89vYZkxNyQMyeRXL8oynfUZYO', NULL, NULL, NULL, NULL, NULL, 3, 45, '2025-11-29 05:46:24', '2025-11-29 05:46:24'),
(3, 'tes', 'tes@gmail.com', '$2b$12$SePXmDW5gggFbjJbDefF2Ohm0HHKlQw5KdK2vdR39ud13Y3onTIg.', NULL, NULL, NULL, NULL, NULL, 3, 45, '2025-11-29 06:16:52', '2025-11-29 06:16:52'),
(4, 'raffa', 'raffa@gmail.com', '$2b$12$xCXQEd4Yr9tTN0OFe1wdo.KoG96/XCU3YAag5Pkok.IkxE3CfJI5S', NULL, NULL, NULL, NULL, NULL, 3, 45, '2025-11-29 06:29:01', '2025-11-29 06:29:01');

-- --------------------------------------------------------

--
-- Table structure for table `user_busy_times`
--

CREATE TABLE `user_busy_times` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_full_day` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_busy_times`
--

INSERT INTO `user_busy_times` (`id`, `user_id`, `day_of_week`, `start_time`, `end_time`, `is_full_day`) VALUES
(1, 1, 'Monday', '00:00:00', '23:59:59', 1),
(2, 1, 'Wednesday', '08:00:00', '12:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_logs`
--

CREATE TABLE `user_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `schedule_item_id` int DEFAULT NULL,
  `log_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `actual_duration_minutes` int DEFAULT NULL,
  `calories_burned` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `feedback_text` text COLLATE utf8mb4_general_ci
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exercise_library`
--
ALTER TABLE `exercise_library`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `schedule_items`
--
ALTER TABLE `schedule_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_busy_times`
--
ALTER TABLE `user_busy_times`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `schedule_item_id` (`schedule_item_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exercise_library`
--
ALTER TABLE `exercise_library`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedule_items`
--
ALTER TABLE `schedule_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_busy_times`
--
ALTER TABLE `user_busy_times`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_logs`
--
ALTER TABLE `user_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedule_items`
--
ALTER TABLE `schedule_items`
  ADD CONSTRAINT `schedule_items_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedule_items_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercise_library` (`id`);

--
-- Constraints for table `user_busy_times`
--
ALTER TABLE `user_busy_times`
  ADD CONSTRAINT `user_busy_times_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_logs_ibfk_2` FOREIGN KEY (`schedule_item_id`) REFERENCES `schedule_items` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
