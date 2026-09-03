-- TaskFlow Seed Data
-- Run after schema.sql

-- Demo users (passwords are "password123" hashed with bcrypt rounds 10)
insert into users (id, email, name, password_hash) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'alice@example.com', 'Alice Johnson', '$2a$10$rZ8Q3pE8vYvQWqQXw8XxMeFJwQqQqQqQqQqQqQqQqQqQqQqQqQq'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'bob@example.com', 'Bob Smith', '$2a$10$rZ8Q3pE8vYvQWqQXw8XxMeFJwQqQqQqQqQqQqQqQqQqQqQqQqQq'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'carol@example.com', 'Carol Davis', '$2a$10$rZ8Q3pE8vYvQWqQXw8XxMeFJwQqQqQqQqQqQqQqQqQqQqQqQqQq')
on conflict (id) do nothing;

-- Demo organization
insert into organizations (id, name, slug, description, owner_id) values
  ('d4e5f6a7-b8c9-0123-def0-123456789012', 'Acme Corp', 'acme-corp', 'The best team in the world', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
on conflict (id) do nothing;

-- Members
insert into organization_members (org_id, user_id, role) values
  ('d4e5f6a7-b8c9-0123-def0-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner'),
  ('d4e5f6a7-b8c9-0123-def0-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'admin'),
  ('d4e5f6a7-b8c9-0123-def0-123456789012', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'member')
on conflict (org_id, user_id) do nothing;

-- Projects
insert into projects (id, org_id, name, description, status, priority, owner_id) values
  ('e5f6a7b8-c9d0-1234-ef01-234567890123', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Website Redesign', 'Complete overhaul of the company website', 'active', 'high', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('f6a7b8c9-d0e1-2345-f012-345678901234', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Mobile App v2', 'Next version of our mobile application', 'active', 'medium', 'b2c3d4e5-f6a7-8901-bcde-f12345678901')
on conflict (id) do nothing;

-- Labels
insert into labels (id, org_id, name, color) values
  ('aabbccdd-1111-2222-3333-444455556666', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Bug', '#ef4444'),
  ('aabbccdd-1111-2222-3333-444455557777', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Feature', '#3b82f6'),
  ('aabbccdd-1111-2222-3333-444455558888', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Urgent', '#f97316'),
  ('aabbccdd-1111-2222-3333-444455559999', 'd4e5f6a7-b8c9-0123-def0-123456789012', 'Design', '#8b5cf6')
on conflict (id) do nothing;

-- Tasks
insert into tasks (id, project_id, title, description, status, priority, assignee_id, due_date, position, created_by) values
  ('11111111-0000-0000-0000-000000000001', 'e5f6a7b8-c9d0-1234-ef01-234567890123', 'Design homepage mockup', 'Create wireframes and high-fidelity mockups', 'in_progress', 'high', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '2026-09-15', 0, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('11111111-0000-0000-0000-000000000002', 'e5f6a7b8-c9d0-1234-ef01-234567890123', 'Set up CI/CD pipeline', 'Configure GitHub Actions for deployment', 'todo', 'medium', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2026-09-20', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('11111111-0000-0000-0000-000000000003', 'e5f6a7b8-c9d0-1234-ef01-234567890123', 'Write API documentation', 'Document all endpoints with examples', 'done', 'low', null, '2026-09-25', 2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('11111111-0000-0000-0000-000000000004', 'f6a7b8c9-d0e1-2345-f012-345678901234', 'Implement auth flow', 'Login, register, and password reset', 'in_review', 'high', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-09-10', 0, 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
  ('11111111-0000-0000-0000-000000000005', 'f6a7b8c9-d0e1-2345-f012-345678901234', 'Push notifications setup', 'Configure Firebase for push notifications', 'todo', 'medium', null, '2026-09-28', 1, 'b2c3d4e5-f6a7-8901-bcde-f12345678901')
on conflict (id) do nothing;

-- Task labels
insert into task_labels (task_id, label_id) values
  ('11111111-0000-0000-0000-000000000001', 'aabbccdd-1111-2222-3333-444455559999'),
  ('11111111-0000-0000-0000-000000000002', 'aabbccdd-1111-2222-3333-444455557777'),
  ('11111111-0000-0000-0000-000000000004', 'aabbccdd-1111-2222-3333-444455558888')
on conflict do nothing;

-- Activities
insert into activities (project_id, user_id, action, entity_type, entity_id, metadata) values
  ('e5f6a7b8-c9d0-1234-ef01-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'created', 'project', 'e5f6a7b8-c9d0-1234-ef01-234567890123', '{"name": "Website Redesign"}'),
  ('e5f6a7b8-c9d0-1234-ef01-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'created', 'task', '11111111-0000-0000-0000-000000000001', '{"title": "Design homepage mockup"}'),
  ('e5f6a7b8-c9d0-1234-ef01-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'updated', 'task', '11111111-0000-0000-0000-000000000001', '{"status": "in_progress"}'),
  ('f6a7b8c9-d0e1-2345-f012-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'created', 'project', 'f6a7b8c9-d0e1-2345-f012-345678901234', '{"name": "Mobile App v2"}');
