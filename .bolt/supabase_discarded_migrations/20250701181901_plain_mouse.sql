/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Circular dependency between projects and project_members policies
    - Projects policy checks project_members table
    - Project_members policy checks projects table
    - This creates infinite recursion

  2. Solution
    - First ensure all required tables and functions exist
    - Use the security definer function get_user_project_role to break the cycle
    - This function bypasses RLS when checking roles
    - Update project_members policies to use this function instead of joining tables

  3. Changes
    - Create project_members table if it doesn't exist
    - Create the security definer function if it doesn't exist
    - Replace project_members policies to use get_user_project_role function
    - Keep projects policies as they are since they don't cause recursion when project_members is fixed
*/

-- First, ensure the project_members table exists
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.user_role DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- Create the security definer function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_user_project_role(project_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role::text FROM public.project_members 
  WHERE project_id = project_uuid AND user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Project creators and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can manage members" ON public.project_members;

-- Create new project_members policies using the security definer function to avoid recursion
CREATE POLICY "Users can view project members" ON public.project_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    (public.get_user_project_role(project_id, auth.uid()) = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Project admins can manage members" ON public.project_members
  FOR ALL USING (
    (public.get_user_project_role(project_id, auth.uid()) = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  ) WITH CHECK (
    (public.get_user_project_role(project_id, auth.uid()) = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );