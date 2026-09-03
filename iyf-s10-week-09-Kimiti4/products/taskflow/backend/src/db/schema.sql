-- TaskFlow Database Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  password_hash text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Organizations table
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  owner_id uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Organization members table
create table if not exists organization_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Projects table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  description text,
  status text default 'active',
  priority text default 'medium',
  owner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks table
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assignee_id uuid references users(id) on delete set null,
  due_date date,
  position int default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Labels table
create table if not exists labels (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  color text default '#6366f1'
);

-- Task labels junction table
create table if not exists task_labels (
  task_id uuid references tasks(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- Activities table
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_tasks_project_id on tasks(project_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_assignee_id on tasks(assignee_id);
create index if not exists idx_activities_project_created on activities(project_id, created_at desc);
create index if not exists idx_org_members_org_id on organization_members(org_id);
create index if not exists idx_org_members_user_id on organization_members(user_id);
create index if not exists idx_projects_org_id on projects(org_id);

-- Enable RLS
alter table users enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table labels enable row level security;
alter table task_labels enable row level security;
alter table activities enable row level security;

-- Permissive RLS policies (allow all for authenticated service role)
create policy "Allow all for service role" on users for all using (true) with check (true);
create policy "Allow all for service role" on organizations for all using (true) with check (true);
create policy "Allow all for service role" on organization_members for all using (true) with check (true);
create policy "Allow all for service role" on projects for all using (true) with check (true);
create policy "Allow all for service role" on tasks for all using (true) with check (true);
create policy "Allow all for service role" on labels for all using (true) with check (true);
create policy "Allow all for service role" on task_labels for all using (true) with check (true);
create policy "Allow all for service role" on activities for all using (true) with check (true);
