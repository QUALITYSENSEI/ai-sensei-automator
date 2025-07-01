import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  Bug, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Brain,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectCreation from './ProjectCreation';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  app_url?: string;
}

interface DashboardStats {
  projects: number;
  testCases: number;
  executions: number;
  bugs: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    testCases: 0,
    executions: 0,
    bugs: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data for user:', user?.id);
      
      // Load projects where user is a member
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(user_id)
        `)
        .eq('project_members.user_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Projects error:', projectsError);
        throw projectsError;
      }

      console.log('Projects loaded:', projectsData);
      setProjects(projectsData || []);
      
      // Load stats (simplified for now)
      setStats({
        projects: projectsData?.length || 0,
        testCases: 0,
        executions: 0,
        bugs: 0
      });

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        variant: "destructive",
        title: "Error loading dashboard",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of Quality Sensei.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Quality Sensei...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <TestTube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quality Sensei</h1>
                <p className="text-sm text-slate-500">AI Testing Automation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">Active testing projects</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.testCases}</div>
              <p className="text-xs text-muted-foreground">AI-generated test cases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.executions}</div>
              <p className="text-xs text-muted-foreground">Automated test runs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bugs}</div>
              <p className="text-xs text-muted-foreground">Issues identified</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="ai-features">AI Features</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
              <ProjectCreation onProjectCreated={loadDashboardData} />
            </div>
            
            {projects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TestTube className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
                  <p className="text-slate-600 mb-4">Create your first testing project to get started with Quality Sensei</p>
                  <ProjectCreation onProjectCreated={loadDashboardData} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                      {project.app_url && (
                        <div className="text-sm text-blue-600 hover:text-blue-800">
                          <a href={project.app_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            View App
                          </a>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai-features" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">AI-Powered Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <CardTitle>AI Test Generation</CardTitle>
                  </div>
                  <CardDescription>Generate comprehensive test cases using Google Gemini AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Generate Test Cases
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <CardTitle>Web Scraping & RAG</CardTitle>
                  </div>
                  <CardDescription>Enhance tests with real-time app data using Playwright</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Scrape & Enhance
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-green-600" />
                    <CardTitle>Self-Healing Scripts</CardTitle>
                  </div>
                  <CardDescription>Auto-repair automation scripts when UI changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Configure Auto-Heal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Test Automation</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Scripts</CardTitle>
                  <CardDescription>Manage your Playwright automation scripts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No automation scripts yet</p>
                    <Button variant="outline">Create Script</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Executions</CardTitle>
                  <CardDescription>View recent test execution results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No test executions yet</p>
                    <Button variant="outline">Run Tests</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage Report</CardTitle>
                <CardDescription>Comprehensive overview of your testing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
                  <p className="text-slate-600 mb-4">Start testing to see detailed reports and analytics</p>
                  <Button variant="outline">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
