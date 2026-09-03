import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrg } from '../context/OrgContext';
import { useToast } from '../components/ToastProvider';
import { getTask, updateTask, deleteTask } from '../api/tasks';
import { getMembers } from '../api/orgs';
import { getLabels, addLabelToTask, removeLabelFromTask } from '../api/labels';
import LoadingSpinner from '../components/LoadingSpinner';
import { LabelBadge } from '../components/LabelBadge';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const { success, error: showError } = useToast();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [orgLabels, setOrgLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [taskData, membersData, labelsData] = await Promise.allSettled([
          getTask(taskId),
          currentOrg ? getMembers(currentOrg.id || currentOrg._id) : Promise.resolve([]),
          currentOrg ? getLabels(currentOrg.id || currentOrg._id) : Promise.resolve([]),
        ]);
        if (taskData.status === 'fulfilled') {
          const t = taskData.value;
          setTask(t);
          setTitle(t.title || '');
          setDescription(t.description || '');
          setStatus(t.status || 'todo');
          setPriority(t.priority || 'medium');
          setAssigneeId(t.assignee_id || t.assignee?.id || '');
          setDueDate(t.due_date ? t.due_date.split('T')[0] : '');
        }
        if (membersData.status === 'fulfilled') {
          const md = membersData.value;
          setMembers(Array.isArray(md) ? md : md.results || []);
        }
        if (labelsData.status === 'fulfilled') {
          const ld = labelsData.value;
          setOrgLabels(Array.isArray(ld) ? ld : ld.results || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId, currentOrg]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTask(taskId, {
        title,
        description,
        status,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      });
      success('Task updated!');
    } catch (err) {
      showError(err.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      success('Task deleted');
      navigate(`/tf/projects/${projectId}`);
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    }
  };

  const handleAddLabel = async (labelId) => {
    try {
      await addLabelToTask(taskId, labelId);
      const updated = await getTask(taskId);
      setTask(updated);
      success('Label added');
    } catch (err) {
      showError(err.message || 'Failed to add label');
    }
  };

  const handleRemoveLabel = async (labelId) => {
    try {
      await removeLabelFromTask(taskId, labelId);
      const updated = await getTask(taskId);
      setTask(updated);
      success('Label removed');
    } catch (err) {
      showError(err.message || 'Failed to remove label');
    }
  };

  if (loading) return <LoadingSpinner text="Loading task..." />;
  if (!task) return <div className="page"><p>Task not found.</p></div>;

  const taskLabelIds = (task.labels || []).map((l) => l.id || l._id);
  const availableLabels = orgLabels.filter((l) => !taskLabelIds.includes(l.id || l._id));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to={`/tf/projects/${projectId}`} className="breadcrumb">
            <FiArrowLeft size={14} /> Back to Project
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="task-detail-title"
            onBlur={handleSave}
          />
        </div>
        <div className="page-actions">
          <button className="btn btn-danger" onClick={handleDelete} aria-label="Delete task">
            <FiTrash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="task-detail-layout">
        <div className="task-detail-main">
          <div className="form-group">
            <label htmlFor="td-desc">Description</label>
            <textarea
              id="td-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              rows={5}
              placeholder="Add a description..."
            />
          </div>

          <div className="task-labels-section">
            <h4>Labels</h4>
            <div className="task-labels">
              {(task.labels || []).map((l) => (
                <LabelBadge key={l.id || l._id} label={l} onRemove={handleRemoveLabel} />
              ))}
              {availableLabels.length > 0 && (
                <select
                  className="label-add-select"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddLabel(e.target.value);
                  }}
                  aria-label="Add label"
                >
                  <option value="">+ Add label</option>
                  {availableLabels.map((l) => (
                    <option key={l.id || l._id} value={l.id || l._id}>{l.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="task-meta">
            <span>Created: {task.created_at ? new Date(task.created_at).toLocaleString() : 'Unknown'}</span>
            {task.updated_at && <span>Updated: {new Date(task.updated_at).toLocaleString()}</span>}
          </div>
        </div>

        <div className="task-detail-sidebar">
          <div className="form-group">
            <label htmlFor="td-status">Status</label>
            <select
              id="td-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onBlur={handleSave}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="td-priority">Priority</label>
            <select
              id="td-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              onBlur={handleSave}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="td-assignee">Assignee</label>
            <select
              id="td-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              onBlur={handleSave}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="td-due">Due Date</label>
            <input
              id="td-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleSave}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
