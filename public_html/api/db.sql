-- SQL Database Schema for VT-SYS May Viet Tien
-- Exportable to PHPMyAdmin / cPanel MySQL Database

-- Bảo đảm dữ liệu tiếng Việt được nạp đúng bảng mã UTF-8 (tránh lỗi mã hoá kép
-- khi import bằng MySQL client mặc định latin1 hoặc qua entrypoint Docker).
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounts` (
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `user_id` VARCHAR(10) NOT NULL,
  `balance` BIGINT NOT NULL DEFAULT 0,
  `bank_name` VARCHAR(100) DEFAULT '',
  `account_number` VARCHAR(50) DEFAULT '',
  `account_holder` VARCHAR(100) DEFAULT '',
  `referral_code` VARCHAR(20) DEFAULT NULL,
  `accumulated_support` BIGINT NOT NULL DEFAULT 0,
  `accumulated_interest` BIGINT NOT NULL DEFAULT 0,
  `accumulated_wins` BIGINT NOT NULL DEFAULT 0,
  `accumulation_count` INT NOT NULL DEFAULT 0,
  `is_locked` TINYINT NOT NULL DEFAULT 0,
  `last_active` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `avatar_url` TEXT DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` VARCHAR(10) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'smart_display',
  `cycle` INT NOT NULL DEFAULT 45,
  `current_cycle` INT NOT NULL DEFAULT 45,
  `session` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bets` (
  `id` VARCHAR(50) NOT NULL,
  `room` VARCHAR(50) NOT NULL,
  `period` VARCHAR(20) NOT NULL,
  `choice` VARCHAR(50) NOT NULL,
  `amount` BIGINT NOT NULL,
  `result` VARCHAR(50) NOT NULL DEFAULT 'Chờ kết quả',
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `username` VARCHAR(50) NOT NULL,
  `payout` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `amount` BIGINT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Đang xử lý',
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `details` TEXT DEFAULT NULL,
  `username` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `periods_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `room` VARCHAR(50) NOT NULL,
  `period` VARCHAR(20) NOT NULL,
  `result` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_room_period` (`room`, `period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forced_results` (
  `room` VARCHAR(50) NOT NULL,
  `choice` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`room`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(50) NOT NULL,
  `setting_value` TEXT NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hệ thống thông báo 2 chiều (admin <-> khách hàng)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(40) NOT NULL,
  `audience` VARCHAR(20) NOT NULL DEFAULT 'user',   -- 'user' | 'admin' (ai là người nhận/xem)
  `username` VARCHAR(50) NOT NULL,                   -- tài khoản nhận ('admin' cho hộp thư quản trị)
  `sender` VARCHAR(50) NOT NULL DEFAULT 'system',    -- người/hệ thống gửi
  `type` VARCHAR(30) NOT NULL DEFAULT 'info',         -- 'balance' | 'info' | 'message' | 'request' | 'transaction'
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `message` TEXT DEFAULT NULL,
  `is_read` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_inbox` (`audience`, `username`, `is_read`),
  KEY `idx_notif_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data
INSERT INTO `accounts` (`username`, `password`, `full_name`, `phone`, `user_id`, `balance`, `bank_name`, `account_number`, `account_holder`, `referral_code`, `accumulated_support`, `accumulated_interest`, `accumulated_wins`, `accumulation_count`, `is_locked`, `last_active`) VALUES
('admin', 'admin', 'Quản Trị Viên Hệ Thống', '0999999999', '1', 999999999, 'Hệ Thống', 'ADMIN_VTEC', 'VTEC GLOBAL', NULL, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `rooms` (`id`, `name`, `icon`, `cycle`, `current_cycle`, `session`) VALUES
('#4', 'Youtube', 'smart_display', 45, 45, DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
('#3', 'Facebook', 'thumb_up', 45, 45, DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'))
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `forced_results` (`room`, `choice`) VALUES
('Facebook', NULL),
('Youtube', NULL)
ON DUPLICATE KEY UPDATE `room`=`room`;

INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('seconds_remaining', '39'),
('last_updated_time', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
