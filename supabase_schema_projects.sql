CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  building_characteristics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);