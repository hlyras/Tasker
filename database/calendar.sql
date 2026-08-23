-- Estado do calendário por usuário
-- Execute no banco cms_tasker

CREATE TABLE IF NOT EXISTS cms_tasker.calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  schedule LONGTEXT NOT NULL,
  repeats LONGTEXT NOT NULL,
  seeded_weeks LONGTEXT NOT NULL,
  xp_events LONGTEXT NOT NULL,
  UNIQUE KEY uq_calendar_user (user_id)
);
