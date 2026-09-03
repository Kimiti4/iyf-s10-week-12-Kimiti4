import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrg } from '../context/OrgContext';
import { useToast } from '../components/ToastProvider';
import { getProject, updateProject, deleteProject, archiveProject } from '../api/projects';
import { getTasks, createTask } from '../api/tasks';
import { getMembers } from '../api/orgs';
import { getLabels } from '../api/labels';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { FiPlus, FiSettings, FiTrash2, FiArchive, FiGrid, FiList } from 'react-icons/fi';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const { success, error: showError } = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projData, tasksData, membersData, labelsData] = await Promise.allSettled([
        getProject(projectId),
        getTasks(projectId),
        currentOrg ? getMembers(currentOrg.id || currentOrg._id) : Promise.resolve([]),
        currentOrg ? getLabels(currentOrg.id || currentOrg._id) : Promise.resolve([]),
      ]);
      if (projData.status === 'fulfilled') {
        setProject(projData.value);
        setEditName(projData.value.name || '');
        setEditDesc(projData.value.description || '');
        setEditPriority(projData.value.priority || 'medium');
      }
      if (tasksData.status === 'fulfilled') {
        const td = tasksData.value;
        setTasks(Array.isArray(td) ? td : td.results || []);
      }
      if (membersData.status === 'fulfilled') {
        const md = membersData.value;
        setMembers(Array.isArray(md) ? md : md.results || []);
      }
      if (labelsData.status === 'fulfilled') {
        const ld = labelsData.value;
        setLabels(Array.isArray(ld) ? ld : ld.results || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId, currentOrg]);

  const handleCreateTask = async (data) => {
    await createTask(projectId, data);
    success('Task created!');
    loadAll();
  };

  const handleUpdateProject = async () => {
    try {
      await updateProject(projectId, { name: editName, description: editDesc, priority: editPriority });
      success('Project updated!');
      setEditMode(false);
      loadAll();
    } catch (err) {
      showError(err.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(projectId);
      success('Project deleted');
      navigate('/tf/projects');
    } catch (err) {
      showError(err.message || 'Failed to delete project');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject(projectId);
      success('Project archived');
      loadAll();
    } catch (err) {
      showError(err.message || 'Failed to archive project');
    }
  };

  if (loading) return <LoadingSpinner text="Loading project..." />;
  if (!project) return <EmptyState title="Project not found" />;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/tf/projects" className="breadcrumb">Projects</Link>
          {editMode ? (
            <div className="inline-edit">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="inline-edit-input"
                autoFocus
              />
              <button className="btn btn-sm btn-primary" onClick={handleUpdateProject}>Save</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            <h1 className="page-title" onClick={() => setEditMode(true)} style={{ cursor: 'pointer' }}>
              {project.name}
            </h1>
          )}
        </div>
        <div className="page-actions">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          <Link to={`/tf/projects/${projectId}/board`} className="btn btn-secondary">
            <FiGrid size={16} /> Board
          </Link>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <FiPlus size={16} /> Add Task
          </button>
        </div>
      </div>

      {project.description && (
        <p className="project-description">{project.description}</p>
      )}

      <div className="tabs">
        {['tasks', 'settings'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="filter-bar">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks"
              description="Create your first task to get started."
              actionLabel="Add Task"
              onAction={() => setShowTaskModal(true)}
            />
          ) : (
            <div className="task-list">
              {filteredTasks.map((t) => (
                <TaskCard key={t.id || t._id} task={t} projectId={projectId} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <div className="card form-card">
          <h3>Project Settings</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleUpdateProject}>Save Changes</button>
          </div>
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <div className="danger-actions">
              <button className="btn btn-warning" onClick={handleArchive}>
                <FiArchive size={16} /> Archive Project
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <FiTrash2 size={16} /> Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        members={members}
        labels={labels}
      />
    </div>
  );
}
