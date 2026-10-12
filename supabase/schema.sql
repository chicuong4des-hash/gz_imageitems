-- Chạy toàn bộ SQL này trong Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id text primary key,
  title text not null default 'Thiệp cưới mới',
  slug text unique not null,
  is_public boolean not null default false,
  design jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Public chỉ đọc được những thiệp đã xuất bản.
create policy "Public can read published invitations"
on public.projects for select
using (is_public = true);

-- Chỉ tài khoản chủ web được quản lý dự án.
-- Tạo app_metadata.owner=true cho tài khoản quản trị trong Supabase Auth
-- hoặc sửa điều kiện email bên dưới theo email quản trị của bạn.
create policy "Owner can read all projects"
on public.projects for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'owner') = 'true');

create policy "Owner can insert projects"
on public.projects for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'owner') = 'true');

create policy "Owner can update projects"
on public.projects for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'owner') = 'true')
with check ((auth.jwt() -> 'app_metadata' ->> 'owner') = 'true');

create policy "Owner can delete projects"
on public.projects for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'owner') = 'true');

-- Không bật public sign-ups. Tạo user trong Authentication > Users.
-- Để đánh dấu chủ web: Authentication > Users > chọn user > Edit app metadata
-- thêm JSON: {"owner": true}
