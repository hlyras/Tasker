-- Estrutura da tabela subtask no MySQL
-- Execute no banco cms_tasker

CREATE TABLE IF NOT EXISTS cms_tasker.subtask (
  id INT AUTO_INCREMENT PRIMARY KEY,
  datetime BIGINT NOT NULL,
  task_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pendente',
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_subtask_task
    FOREIGN KEY (task_id)
    REFERENCES cms_tasker.task(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_subtask_task_id ON cms_tasker.subtask(task_id);
CREATE INDEX idx_subtask_sort_order ON cms_tasker.subtask(task_id, sort_order);
