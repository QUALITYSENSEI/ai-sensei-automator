
-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_user_project_role(project_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role::text FROM public.project_members 
  WHERE project_id = project_uuid AND user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Project admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;

-- Create new safe policies using the security definer function
CREATE POLICY "Users can view project members" ON public.project_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators and admins can manage members" ON public.project_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- Also fix the projects policy to avoid potential issues
DROP POLICY IF EXISTS "Users can view projects they're members of" ON public.projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.projects;

CREATE POLICY "Users can view projects they're members of" ON public.projects
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can update projects" ON public.projects
  FOR UPDATE USING (created_by = auth.uid());

-- Fix epics policies too
DROP POLICY IF EXISTS "Users can view epics in their projects" ON public.epics;
DROP POLICY IF EXISTS "Users can create epics in their projects" ON public.epics;
DROP POLICY IF EXISTS "Users can update epics in their projects" ON public.epics;

CREATE POLICY "Users can view epics in their projects" ON public.epics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = epics.project_id 
      AND (
        p.created_by = auth.uid() OR
        p.id IN (
          SELECT project_id FROM public.project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create epics in their projects" ON public.epics
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = epics.project_id 
      AND (
        p.created_by = auth.uid() OR
        p.id IN (
          SELECT project_id FROM public.project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update epics in their projects" ON public.epics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = epics.project_id 
      AND (
        p.created_by = auth.uid() OR
        p.id IN (
          SELECT project_id FROM public.project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );
