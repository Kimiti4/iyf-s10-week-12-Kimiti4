import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ isOpen, onClose, onSubmit, task = null, members = [], labels = [], defaultStatus = 'todo' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssigneeId(task.assignee_id || task.assignee?.id || '');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setSelectedLabels(task.labels?.map((l) => l.id || l._id) || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssigneeId('');
      setDueDate('');
      setSelectedLabels([]);
    }
    setErrors({});
  }, [task, isOpen, defaultStatus]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
        label_ids: selectedLabels,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save task' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLabel = (labelId) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Create task'}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && <div className="form-error-banner">{errors.submit}</div>}
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'input-error' : ''}
              placeholder="Task title"
              autoFocus
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Task description"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-assignee">Assignee</label>
              <select id="task-assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {labels.length > 0 && (
            <div className="form-group">
              <label>Labels</label>
              <div className="label-selector">
                {labels.map((label) => (
                  <button
                    key={label.id || label._id}
                    type="button"
                    className={`label-option ${selectedLabels.includes(label.id || label._id) ? 'selected' : ''}`}
                    style={{ borderColor: label.color }}
                    onClick={() => toggleLabel(label.id || label._id)}
                  >
                    <span className="label-dot" style={{ backgroundColor: label.color }} />
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
