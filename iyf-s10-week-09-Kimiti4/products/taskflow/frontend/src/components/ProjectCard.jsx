import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/tf/projects/${project.id || project._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/tf/projects/${project.id || project._id}`);
      }}
      aria-label={`Project: ${project.name}`}
    >
      <div className="project-card-header">
        <h3 className="project-card-name">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="project-card-description">
          {project.description.length > 100
            ? project.description.slice(0, 100) + '...'
            : project.description}
        </p>
      )}
      <div className="project-card-footer">
        <PriorityBadge priority={project.priority || 'medium'} />
        <span className="project-card-count">
          {project.task_count || 0} tasks
        </span>
      </div>
    </div>
  );
}
