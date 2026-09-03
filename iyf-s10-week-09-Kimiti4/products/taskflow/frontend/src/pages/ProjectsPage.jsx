import { useState, useEffect } from 'react';
import { useOrg } from '../context/OrgContext';
import { useToast } from '../components/ToastProvider';
import { getProjects, createProject } from '../api/projects';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import { FiPlus } from 'react-icons/fi';

export default function ProjectsPage() {
  const { currentOrg } = useOrg();
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadProjects = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const data = await getProjects(currentOrg.id || currentOrg._id);
      setProjects(Array.isArray(data) ? data : data.results || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentOrg]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createProject(currentOrg.id || currentOrg._id, { name: name.trim(), description: description.trim(), priority });
      success('Project created!');
      setName('');
      setDescription('');
      setPriority('medium');
      setShowCreate(false);
      loadProjects();
    } catch (err) {
      showError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)} aria-label="Create project">
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {showCreate && (
        <div className="card form-card">
          <h3>Create Project</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="proj-name">Name *</label>
              <input
                id="proj-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="proj-desc">Description</label>
              <textarea
                id="proj-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Project description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="proj-priority">Priority</label>
              <select id="proj-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        {['all', 'active', 'archived'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects"
          description={filter === 'all' ? 'Create your first project.' : `No ${filter} projects found.`}
          actionLabel="Create Project"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="projects-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id || p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
