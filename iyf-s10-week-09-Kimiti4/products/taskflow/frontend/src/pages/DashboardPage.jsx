import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrg } from '../context/OrgContext';
import { getDashboardStats, getRecentActivity } from '../api/dashboard';
import { getProjects } from '../api/projects';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import { FiFolder, FiCheckSquare, FiClock, FiArrowRight } from 'react-icons/fi';

export default function DashboardPage() {
  const { currentOrg } = useOrg();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, activityData, projectsData] = await Promise.allSettled([
          getDashboardStats(currentOrg.id || currentOrg._id),
          getRecentActivity(currentOrg.id || currentOrg._id),
          getProjects(currentOrg.id || currentOrg._id),
        ]);
        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (activityData.status === 'fulfilled') setActivity(Array.isArray(activityData.value) ? activityData.value : activityData.value.results || []);
        if (projectsData.status === 'fulfilled') {
          const pd = projectsData.value;
          setProjects(Array.isArray(pd) ? pd : pd.results || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrg]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!currentOrg) return <EmptyState title="No Organization" description="Create or join an organization to get started." />;

  const totalProjects = stats?.total_projects ?? projects.length;
  const totalTasks = stats?.total_tasks ?? 0;
  const tasksTodo = stats?.tasks_todo ?? 0;
  const tasksInProgress = stats?.tasks_in_progress ?? 0;
  const tasksDone = stats?.tasks_done ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to {currentOrg.name}</p>
      </div>

      <section className="stats-grid" aria-label="Dashboard statistics">
        <div className="stat-card">
          <FiFolder className="stat-icon stat-icon-primary" aria-hidden="true" />
          <div className="stat-content">
            <span className="stat-value">{totalProjects}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckSquare className="stat-icon stat-icon-success" aria-hidden="true" />
          <div className="stat-content">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>
        <div className="stat-card">
          <FiClock className="stat-icon stat-icon-warning" aria-hidden="true" />
          <div className="stat-content">
            <span className="stat-value">{tasksInProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckSquare className="stat-icon stat-icon-info" aria-hidden="true" />
          <div className="stat-content">
            <span className="stat-value">{tasksDone}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section" aria-labelledby="recent-projects-heading">
          <div className="section-header">
            <h2 id="recent-projects-heading">Recent Projects</h2>
            <Link to="/tf/projects" className="section-link">
              View all <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start organizing tasks."
              actionLabel="Create Project"
              onAction={() => {}}
            />
          ) : (
            <div className="projects-grid">
              {projects.slice(0, 4).map((p) => (
                <ProjectCard key={p.id || p._id} project={p} />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="recent-activity-heading">
          <div className="section-header">
            <h2 id="recent-activity-heading">Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="text-muted">No recent activity</p>
          ) : (
            <div className="activity-feed" role="feed" aria-label="Recent activity feed">
              {activity.slice(0, 10).map((item, i) => (
                <div key={item.id || i} className="activity-item" role="article">
                  <div className="activity-dot" aria-hidden="true" />
                  <div className="activity-content">
                    <span className="activity-text">
                      <strong>{item.user?.name || 'Someone'}</strong> {item.action || item.description || 'performed an action'}
                    </span>
                    <span className="activity-time">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
