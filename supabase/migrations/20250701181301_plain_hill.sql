/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Circular dependency between projects and project_members policies
    - Projects policy checks project_members table
    - Project_members policy checks projects table
    - This creates infinite recursion

  2. Solution
    - Use the security definer function get_user_project_role to break the cycle
    - This function bypasses RLS when checking roles
    - Update project_members policies to use this function instead of joining tables

  3. Changes
    - Replace project_members SELECT policy to use get_user_project_role function
    - Replace project_members FOR ALL policy to use get_user_project_role function
    - Keep projects policies as they are since they don't cause recursion when project_members is fixed
*/

-- Drop the problematic project_members policies
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Project creators and admins can manage members" ON public.project_members;

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