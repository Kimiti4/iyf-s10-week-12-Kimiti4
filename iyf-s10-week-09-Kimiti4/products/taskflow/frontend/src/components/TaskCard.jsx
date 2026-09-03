import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export default function TaskCard({ task, projectId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tf/projects/${projectId}/tasks/${task.id || task._id}`);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id || task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && (
        <p className="task-card-description">
          {task.description.length > 80 ? task.description.slice(0, 80) + '...' : task.description}
        </p>
      )}
      <div className="task-card-footer">
        <StatusBadge status={task.status} />
        {task.assignee && (
          <div className="task-card-assignee" title={task.assignee.name}>
            <div className="avatar-mini">
              {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
