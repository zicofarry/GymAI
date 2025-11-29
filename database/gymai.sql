-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 29, 2025 at 01:29 PM
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

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `user_id`, `start_date`, `end_date`, `is_active`, `ai_weekly_motivation`, `created_at`) VALUES
(1, 4, '2025-11-30', '2025-12-06', 0, 'Halo raffa, Semangat untuk goal Stay Healthy!', '2025-11-29 08:51:20'),
(2, 4, '2025-11-30', '2025-12-06', 1, 'Halo raffa, Semangat untuk goal Stay Healthy!', '2025-11-29 09:15:31'),
(3, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Muscle Gain!', '2025-11-29 09:33:33'),
(4, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Stay Healthy!', '2025-11-29 10:00:06'),
(5, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Muscle Gain!', '2025-11-29 10:00:46'),
(6, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Muscle Gain!', '2025-11-29 10:01:00'),
(7, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Muscle Gain!', '2025-11-29 10:01:03'),
(8, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Flexibility!', '2025-11-29 10:02:37'),
(9, 5, '2025-11-30', '2025-12-06', 0, 'Halo demo1, Semangat untuk goal Stay Healthy!', '2025-11-29 10:06:34'),
(10, 5, '2025-11-30', '2025-12-06', 1, 'Halo demo1, Semangat untuk goal Fat Loss!', '2025-11-29 10:09:17'),
(11, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, Semangat untuk goal Muscle Gain!', '2025-11-29 10:19:05'),
(12, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, ayo semangat!', '2025-11-29 12:17:49'),
(13, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, ayo semangat!', '2025-11-29 12:52:58'),
(14, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, ayo semangat!', '2025-11-29 12:54:28'),
(15, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, ayo semangat!', '2025-11-29 13:01:25'),
(16, 2, '2025-11-30', '2025-12-06', 0, 'Halo zicofarry, ayo semangat!', '2025-11-29 13:03:49'),
(17, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:17:20'),
(18, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:17:58'),
(19, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:18:28'),
(20, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:19:01'),
(21, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:24:33'),
(22, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:25:02'),
(23, 2, '2025-11-30', '2025-12-06', 0, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:25:02'),
(24, 2, '2025-11-30', '2025-12-06', 1, 'Jadwal diperbarui otomatis untuk zicofarry (via Chatbot)', '2025-11-29 13:25:02');

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

--
-- Dumping data for table `schedule_items`
--

INSERT INTO `schedule_items` (`id`, `schedule_id`, `exercise_id`, `day_of_week`, `scheduled_time`, `duration_minutes`, `is_completed`, `ai_custom_tips`) VALUES
(1, 1, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(2, 1, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(3, 1, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(4, 2, 5, 'Monday', '08:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(5, 2, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(6, 2, 5, 'Thursday', '08:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(7, 3, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(8, 3, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(9, 3, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(10, 4, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(11, 4, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(12, 4, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(13, 5, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(14, 5, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(15, 5, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(16, 6, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(17, 6, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(18, 6, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(19, 7, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(20, 7, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(21, 7, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(22, 8, 1, 'Monday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(23, 8, 2, 'Tuesday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(24, 8, 1, 'Thursday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(25, 9, 1, 'Thursday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(26, 9, 2, 'Friday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(27, 9, 1, 'Saturday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(28, 10, 4, 'Tuesday', '08:00:00', 15, 0, 'Focus on form for Jumping Jacks'),
(29, 10, 1, 'Wednesday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(30, 10, 4, 'Thursday', '08:00:00', 15, 0, 'Focus on form for Jumping Jacks'),
(31, 10, 1, 'Friday', '08:00:00', 10, 0, 'Focus on form for Push Up'),
(32, 11, 5, 'Saturday', '08:00:00', 15, 1, 'Focus on form for Dumbbell Bench Press'),
(33, 11, 2, 'Sunday', '08:00:00', 10, 1, 'Focus on form for Bodyweight Squat'),
(34, 12, 6, 'Saturday', '08:00:00', 30, 0, 'Focus on form for Treadmill Run'),
(35, 12, 2, 'Sunday', '08:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(36, 13, 3, 'Saturday', '20:00:00', 5, 0, 'Focus on form for Plank'),
(37, 13, 2, 'Sunday', '20:00:00', 10, 0, 'Focus on form for Bodyweight Squat'),
(38, 14, 5, 'Saturday', '18:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(39, 15, 5, 'Monday', '09:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(40, 15, 5, 'Tuesday', '09:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(41, 15, 5, 'Wednesday', '09:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(42, 15, 5, 'Thursday', '09:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(43, 15, 5, 'Friday', '09:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(44, 16, 5, 'Saturday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(45, 16, 3, 'Saturday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(46, 16, 5, 'Saturday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(47, 16, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(48, 16, 6, 'Sunday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(49, 17, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(50, 17, 3, 'Sunday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(51, 17, 5, 'Sunday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(52, 17, 3, 'Sunday', '20:50:00', 5, 0, 'Focus on form for Plank'),
(53, 18, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(54, 18, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(55, 18, 5, 'Monday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(56, 18, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(57, 18, 6, 'Sunday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(58, 19, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(59, 19, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(60, 19, 5, 'Monday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(61, 19, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(62, 19, 6, 'Sunday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(63, 20, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(64, 20, 3, 'Sunday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(65, 20, 5, 'Sunday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(66, 20, 3, 'Sunday', '20:50:00', 5, 0, 'Focus on form for Plank'),
(67, 21, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(68, 21, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(69, 21, 5, 'Monday', '20:30:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(70, 21, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(71, 21, 6, 'Sunday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(72, 22, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(73, 22, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(74, 22, 5, 'Tuesday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(75, 22, 6, 'Tuesday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(76, 22, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(77, 22, 3, 'Sunday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(78, 23, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(79, 23, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(80, 23, 5, 'Tuesday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(81, 23, 6, 'Tuesday', '20:20:00', 30, 0, 'Focus on form for Treadmill Run'),
(82, 23, 5, 'Wednesday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(83, 23, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(84, 24, 5, 'Monday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(85, 24, 3, 'Monday', '20:20:00', 5, 0, 'Focus on form for Plank'),
(86, 24, 5, 'Tuesday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(87, 24, 5, 'Wednesday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(88, 24, 5, 'Thursday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press'),
(89, 24, 5, 'Sunday', '20:00:00', 15, 0, 'Focus on form for Dumbbell Bench Press');

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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `preferred_workout_time` enum('Morning','Afternoon','Evening','Night','Anytime') COLLATE utf8mb4_general_ci DEFAULT 'Anytime'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `weight_kg`, `height_cm`, `fitness_level`, `main_goal`, `location_preference`, `target_sessions_per_week`, `preferred_duration_minutes`, `created_at`, `updated_at`, `preferred_workout_time`) VALUES
(1, 'azmi_dev', 'azmi@gymai.com', 'dummy_hashed_password_123', 70, 175, 'Beginner', 'Muscle Gain', 'Home', 3, 45, '2025-11-29 04:33:54', '2025-11-29 04:33:54', 'Anytime'),
(2, 'zicofarry', 'zicofarry@gmail.com', '$2b$12$Aq4yAyAEJga6CLNkFVP35uDAL7YM89vYZkxNyQMyeRXL8oynfUZYO', 45, 165, 'Intermediate', 'Muscle Gain', 'Gym', 6, 45, '2025-11-29 05:46:24', '2025-11-29 13:03:49', 'Night'),
(3, 'tes', 'tes@gmail.com', '$2b$12$SePXmDW5gggFbjJbDefF2Ohm0HHKlQw5KdK2vdR39ud13Y3onTIg.', NULL, NULL, NULL, NULL, NULL, 3, 45, '2025-11-29 06:16:52', '2025-11-29 06:16:52', 'Anytime'),
(4, 'raffa', 'raffa@gmail.com', '$2b$12$xCXQEd4Yr9tTN0OFe1wdo.KoG96/XCU3YAag5Pkok.IkxE3CfJI5S', 35, 145, 'Intermediate', 'Stay Healthy', 'Home', 3, 45, '2025-11-29 06:29:01', '2025-11-29 09:15:31', 'Anytime'),
(5, 'demo1', 'demo1@gmail.com', '$2b$12$Od3e53apsZso/QiMFh.re.Ut0AfX7bcg7iHiWC4iDXjztxlZPzduC', 55, 170, 'Beginner', 'Fat Loss', 'Home', 4, 45, '2025-11-29 09:23:21', '2025-11-29 10:09:17', 'Anytime');

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
(2, 1, 'Wednesday', '08:00:00', '12:00:00', 0),
(6, 4, 'Monday', '21:02:00', '12:21:00', 0),
(7, 4, 'Wednesday', NULL, NULL, 1),
(21, 5, 'Monday', NULL, NULL, 1),
(55, 2, 'Friday', NULL, NULL, 1),
(56, 2, 'Saturday', NULL, NULL, 1),
(57, 2, 'Saturday', NULL, NULL, 1),
(58, 2, 'Saturday', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_injuries`
--

CREATE TABLE `user_injuries` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `muscle_group` enum('Chest','Back','Legs','Shoulders','Arms','Core','Full Body','Cardio') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_injuries`
--

INSERT INTO `user_injuries` (`id`, `user_id`, `muscle_group`, `created_at`) VALUES
(8, 2, 'Legs', '2025-11-29 20:03:49'),
(9, 2, 'Shoulders', '2025-11-29 20:03:49');

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
-- Dumping data for table `user_logs`
--

INSERT INTO `user_logs` (`id`, `user_id`, `schedule_item_id`, `log_date`, `actual_duration_minutes`, `calories_burned`, `rating`, `feedback_text`) VALUES
(7, 2, 32, '2025-11-29 19:12:38', 15, 50, 5, 'Selesai via Checklist UI'),
(8, 2, 33, '2025-11-29 19:12:51', 10, 50, 5, 'Selesai via Checklist UI');

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
-- Indexes for table `user_injuries`
--
ALTER TABLE `user_injuries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_user_injuries_id` (`id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `schedule_items`
--
ALTER TABLE `schedule_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_busy_times`
--
ALTER TABLE `user_busy_times`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `user_injuries`
--
ALTER TABLE `user_injuries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Constraints for table `user_injuries`
--
ALTER TABLE `user_injuries`
  ADD CONSTRAINT `user_injuries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
