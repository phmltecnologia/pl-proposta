create extension if not exists pgcrypto;

create table if not exists public.signature_documents (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  document_type text not null check (document_type in ('technical', 'consulting')),
  proposal_number text,
  client_name text not null,
  snapshot jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'signed', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  signed_at timestamptz,
  signed_name text,
  signed_document text,
  signature_path text,
  signed_pdf_path text,
  signed_ip_hash text,
  signed_user_agent text
);

create index if not exists signature_documents_token_hash_idx on public.signature_documents(token_hash);
create index if not exists signature_documents_status_idx on public.signature_documents(status);

alter table public.signature_documents enable row level security;

revoke all on table public.signature_documents from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('signature-artifacts', 'signature-artifacts', false)
on conflict (id) do nothing;

-- A API usa a chave service role e não depende de políticas públicas para ler/escrever.
