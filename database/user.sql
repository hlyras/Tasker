-- XP no registro do usuário
-- Execute no banco cms_tasker

ALTER TABLE cms_tasker.user
  ADD COLUMN xp INT NOT NULL DEFAULT 0;
