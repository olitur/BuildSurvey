CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  location_in_space TEXT NOT NULL, -- e.g., 'floor', 'wall', 'ceiling', 'window'
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  photos TEXT[], -- Array of URLs to Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);