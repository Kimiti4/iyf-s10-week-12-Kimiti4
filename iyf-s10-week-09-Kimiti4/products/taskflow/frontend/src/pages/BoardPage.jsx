import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrg } from '../context/OrgContext';
import { useToast } from '../components/ToastProvider';
import { getProject } from '../api/projects';
import { getTasks, moveTask } from '../api/tasks';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCard from '../components/TaskCard';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';

const COLUMNS = [
  { id: 'todo', label: 'Todo', color: '#64748b' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review', label: 'Review', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

export default function BoardPage() {
  const { projectId } = useParams();
  const { success, error: showError } = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projData, tasksData] = await Promise.allSettled([
        getProject(projectId),
        getTasks(projectId),
      ]);
      if (projData.status === 'fulfilled') setProject(projData.value);
      if (tasksData.status === 'fulfilled') {
        const td = tasksData.value;
        setTasks(Array.isArray(td) ? td : td.results || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => (t.id || t._id) === taskId);
    if (task && task.status === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === taskId ? { ...t, status: targetStatus } : t
      )
    );
    setDraggedTaskId(null);

    try {
      await moveTask(taskId, targetStatus);
      success(`Task moved to ${targetStatus.replace('_', ' ')}`);
    } catch (err) {
      showError(err.message || 'Failed to move task');
      loadAll();
    }
  };

  if (loading) return <LoadingSpinner text="Loading board..." />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to={`/tf/projects/${projectId}`} className="breadcrumb">
            <FiArrowLeft size={14} /> Back to Project
          </Link>
          <h1 className="page-title">{project?.name || 'Project'} - Board</h1>
        </div>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="board-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              aria-label={`${col.label} column`}
            >
              <div className="board-column-header" style={{ borderTopColor: col.color }}>
                <span className="board-column-title">{col.label}</span>
                <span className="board-column-count">{colTasks.length}</span>
              </div>
              <div className="board-column-body">
                {colTasks.length === 0 ? (
                  <div className="board-empty">No tasks</div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id || task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id || task._id)}
                      className="board-task-wrapper"
                    >
                      <TaskCard task={task} projectId={projectId} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
