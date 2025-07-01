/*
  # Quality Sensei - Complete Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `projects` - Testing projects
    - `project_members` - Project membership with roles
    - `epics` - High-level project epics
    - `user_stories` - User stories within epics
    - `test_cases` - Test cases linked to user stories
    - `automation_scripts` - Automation scripts for test cases
    - `test_executions` - Test execution results
    - `bugs` - Bug reports from test executions
    - `scraped_pages` - Web scraping data for RAG enhancement
    - `ai_generation_logs` - AI generation activity logs
    - `activity_logs` - General activity tracking

  2. Security
    - Enable RLS on all tables
    - Create safe policies that avoid infinite recursion
    - Use security definer functions where needed

  3. Enums
    - Define all necessary enum types for status fields
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'qa_lead', 'qa_engineer', 'developer', 'viewer');
CREATE TYPE project_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE epic_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
CREATE TYPE story_status AS ENUM ('draft', 'in_progress', 'ready_for_testing', 'completed', 'cancelled');
CREATE TYPE test_case_status AS ENUM ('draft', 'active', 'obsolete');
CREATE TYPE test_execution_status AS ENUM ('not_run', 'passed', 'failed', 'blocked', 'skipped');
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE bug_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'rejected');

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'qa_engineer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  app_url TEXT,
  status project_status DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'qa_engineer',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create epics table
CREATE TABLE IF NOT EXISTS epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  status epic_status DEFAULT 'draft',
  priority INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_stories table
CREATE TABLE IF NOT EXISTS user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES epics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  story_points INTEGER,
  priority INTEGER DEFAULT 0,
  status story_status DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create test_cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_story_id UUID REFERENCES user_stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  preconditions TEXT,
  test_steps JSONB,
  expected_results TEXT,
  priority INTEGER DEFAULT 0,
  status test_case_status DEFAULT 'draft',
  generated_by_ai BOOLEAN DEFAULT false,
  rag_enhanced BOOLEAN DEFAULT false,
  automation_script_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create automation_scripts table
CREATE TABLE IF NOT EXISTS automation_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  script_content TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  framework TEXT DEFAULT 'playwright',
  self_healing_enabled BOOLEAN DEFAULT false,
  last_execution_status test_execution_status DEFAULT 'not_run',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to test_cases
ALTER TABLE test_cases ADD CONSTRAINT fk_automation_script 
  FOREIGN KEY (automation_script_id) REFERENCES automation_scripts(id) ON DELETE SET NULL;

-- Create test_executions table
CREATE TABLE IF NOT EXISTS test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
  automation_script_id UUID REFERENCES automation_scripts(id) ON DELETE CASCADE,
  status test_execution_status DEFAULT 'not_run',
  execution_details JSONB,
  execution_time INTEGER, -- in milliseconds
  executed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- Create bugs table
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
  test_execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reproduction_steps TEXT,
  severity bug_severity DEFAULT 'medium',
  status bug_status DEFAULT 'open',
  environment_info JSONB,
  screenshots JSONB,
  video_url TEXT,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create scraped_pages table
CREATE TABLE IF NOT EXISTS scraped_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  content_chunks JSONB,
  dom_elements JSONB,
  screenshots JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_generation_logs table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL, -- 'test_cases', 'automation_scripts', 'bug_analysis', etc.
  input_data JSONB,
  output_data JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time INTEGER, -- in milliseconds
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT, -- 'project', 'test_case', 'bug', etc.
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON epics(project_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_epic_id ON user_stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_user_story_id ON test_cases(user_story_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_test_case_id ON test_executions(test_case_id);
CREATE INDEX IF NOT EXISTS idx_bugs_test_case_id ON bugs(test_case_id);
CREATE INDEX IF NOT EXISTS idx_scraped_pages_project_id ON scraped_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to safely check user roles
CREATE OR REPLACE FUNCTION get_user_project_role(project_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role_result TEXT;
BEGIN
  -- First check if user is project creator
  SELECT 'admin' INTO user_role_result
  FROM projects 
  WHERE id = project_uuid AND created_by = user_uuid;
  
  IF user_role_result IS NOT NULL THEN
    RETURN user_role_result;
  END IF;
  
  -- Then check project membership
  SELECT role::text INTO user_role_result
  FROM project_members 
  WHERE project_id = project_uuid AND user_id = user_uuid;
  
  RETURN COALESCE(user_role_result, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they have access to" ON projects
  FOR SELECT USING (
    created_by = auth.uid() OR
    get_user_project_role(id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Project creators can delete projects" ON projects
  FOR DELETE USING (created_by = auth.uid());

-- Project members policies (safe from recursion)
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators and admins can manage members" ON project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_members.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- Epics policies
CREATE POLICY "Users can view epics in accessible projects" ON epics
  FOR SELECT USING (
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can create epics in accessible projects" ON epics
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can update epics in accessible projects" ON epics
  FOR UPDATE USING (
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

-- User stories policies
CREATE POLICY "Users can view user stories in accessible projects" ON user_stories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM epics e 
      WHERE e.id = user_stories.epic_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can create user stories in accessible projects" ON user_stories
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM epics e 
      WHERE e.id = user_stories.epic_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can update user stories in accessible projects" ON user_stories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM epics e 
      WHERE e.id = user_stories.epic_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

-- Test cases policies
CREATE POLICY "Users can view test cases in accessible projects" ON test_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_stories us
      JOIN epics e ON e.id = us.epic_id
      WHERE us.id = test_cases.user_story_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can create test cases in accessible projects" ON test_cases
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM user_stories us
      JOIN epics e ON e.id = us.epic_id
      WHERE us.id = test_cases.user_story_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can update test cases in accessible projects" ON test_cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_stories us
      JOIN epics e ON e.id = us.epic_id
      WHERE us.id = test_cases.user_story_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

-- Automation scripts policies
CREATE POLICY "Users can view automation scripts for accessible test cases" ON automation_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = automation_scripts.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can create automation scripts for accessible test cases" ON automation_scripts
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = automation_scripts.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can update automation scripts for accessible test cases" ON automation_scripts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = automation_scripts.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

-- Test executions policies
CREATE POLICY "Users can view test executions for accessible test cases" ON test_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = test_executions.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can create test executions for accessible test cases" ON test_executions
  FOR INSERT WITH CHECK (
    auth.uid() = executed_by AND
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = test_executions.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

-- Bugs policies
CREATE POLICY "Users can view bugs for accessible test cases" ON bugs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = bugs.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can create bugs for accessible test cases" ON bugs
  FOR INSERT WITH CHECK (
    auth.uid() = reported_by AND
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = bugs.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

CREATE POLICY "Users can update bugs for accessible test cases" ON bugs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM test_cases tc
      JOIN user_stories us ON us.id = tc.user_story_id
      JOIN epics e ON e.id = us.epic_id
      WHERE tc.id = bugs.test_case_id 
      AND get_user_project_role(e.project_id, auth.uid()) != 'none'
    )
  );

-- Scraped pages policies
CREATE POLICY "Users can view scraped pages for accessible projects" ON scraped_pages
  FOR SELECT USING (
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can create scraped pages for accessible projects" ON scraped_pages
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

-- AI generation logs policies
CREATE POLICY "Users can view AI logs for accessible projects" ON ai_generation_logs
  FOR SELECT USING (
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can create AI logs for accessible projects" ON ai_generation_logs
  FOR INSERT WITH CHECK (
    auth.uid() = generated_by AND
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

-- Activity logs policies
CREATE POLICY "Users can view activity logs for accessible projects" ON activity_logs
  FOR SELECT USING (
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

CREATE POLICY "Users can create activity logs for accessible projects" ON activity_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    get_user_project_role(project_id, auth.uid()) != 'none'
  );

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_stories_updated_at BEFORE UPDATE ON user_stories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_automation_scripts_updated_at BEFORE UPDATE ON automation_scripts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON bugs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();