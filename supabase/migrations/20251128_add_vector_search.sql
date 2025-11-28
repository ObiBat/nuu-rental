-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to properties table if it doesn't exist
-- Using 1536 dimensions for OpenAI text-embedding-3-small / ada-002
alter table properties 
add column if not exists embedding vector(1536);

-- Add unique constraint to external_id for upsert support
alter table properties 
add constraint properties_external_id_key unique (external_id);

-- Create a match_properties function for similarity search
create or replace function match_properties (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  suburb text,
  rent_weekly numeric,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    properties.id,
    properties.suburb,
    properties.rent_weekly,
    1 - (properties.embedding <=> query_embedding) as similarity
  from properties
  where 1 - (properties.embedding <=> query_embedding) > match_threshold
  order by properties.embedding <=> query_embedding
  limit match_count;
end;
$$;

