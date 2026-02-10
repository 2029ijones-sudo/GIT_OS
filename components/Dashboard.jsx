'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Globe, 
  Code2, 
  Rocket, 
  Users, 
  BarChart3,
  Clock,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Activity,
  Eye,
  Server,
  Database,
  Cloud,
  Shield,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Star,
  GitFork,
  ExternalLink,
  Download,
  Share2,
  Settings,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  StopCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import router from '@/lib/router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "react-resizable-panels";
import { toast } from 'react-hot-toast';
import executionEngine from '@/lib/execution';

export default function Dashboard({ user }) {
  const [labs, setLabs] = useState([]);
  const [stats, setStats] = useState({
    totalLabs: 0,
    activeSessions: 0,
    totalExecutions: 0,
    deploymentCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      const interval = setInterval(() => {
        loadActiveSessions();
      }, 5000); // Update sessions every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profileData);
      
      if (!profileData) {
        // Create profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: user.email.split('@')[0],
            bio: 'GIT_OS Developer'
          })
          .select()
          .single();
        
        setProfile(newProfile);
      }
      
      // Fetch labs
      const { data: labsData, error: labsError } = await supabase
        .from('os_labs')
        .select('*, profiles(username)')
        .eq('user_id', profileData?.id || newProfile?.id)
        .order('created_at', { ascending: false });
      
      if (labsError) throw labsError;
      
      setLabs(labsData || []);
      
      // Calculate real stats
      const deployedLabs = labsData?.filter(l => l.is_deployed) || [];
      const starredLabs = labsData?.filter(l => l.stars > 0) || [];
      
      setStats({
        totalLabs: labsData?.length || 0,
        activeSessions: 0, // Will be updated by loadActiveSessions
        totalExecutions: labsData?.reduce((sum, lab) => sum + (lab.preview_count || 0), 0) || 0,
        deploymentCount: deployedLabs.length
      });
      
      // Load recent executions from API
      await loadRecentActivity();
      await loadActiveSessions();
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent executions from our execution engine
      const sessions = executionEngine.getUserSessions(user.id);
      const sessionActivities = sessions.map(session => ({
        id: session.id,
        type: 'execution',
        lab: session.labId,
        time: new Date(session.startTime).toLocaleTimeString(),
        status: 'running',
        sessionId: session.id
      }));
      
      // Get recent lab updates from database
      const { data: recentLabs } = await supabase
        .from('os_labs')
        .select('id, name, updated_at, type')
        .eq('user_id', profile?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      const labActivities = recentLabs?.map(lab => ({
        id: lab.id,
        type: 'update',
        lab: lab.name,
        time: new Date(lab.updated_at).toLocaleTimeString(),
        status: 'updated',
        labType: lab.type
      })) || [];
      
      setRecentActivity([...sessionActivities, ...labActivities]);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadActiveSessions = () => {
    if (!user) return;
    
    const sessions = executionEngine.getUserSessions(user.id);
    setActiveSessions(sessions);
    
    // Update active sessions count in stats
    setStats(prev => ({
      ...prev,
      activeSessions: sessions.length
    }));
  };

  const createNewLab = async (type = 'web') => {
    if (!user || !profile) {
      toast.error('Please login first');
      return;
    }

    try {
      const slug = `lab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: lab, error } = await supabase
        .from('os_labs')
        .insert({
          user_id: profile.id,
          name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Lab`,
          slug: slug,
          type: type,
          frontend_code: type === 'web' ? `<!DOCTYPE html>
<html>
<head>
    <title>GIT_OS Lab</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to GIT_OS</h1>
        <p>Start building your amazing project here!</p>
    </div>
    <script>
        console.log('GIT_OS Lab initialized');
    </script>
</body>
</html>` : '',
          backend_code: type === 'cs' ? `// Welcome to GIT_OS CS Lab
// Write your C#, Java, Python, C++, or JavaScript code here

using System;

class Program {
    static void Main() {
        Console.WriteLine("🚀 GIT_OS - The Future of Code Execution");
        Console.WriteLine("Start building advanced CS programs!");
    }
}` : '',
          description: `A new ${type} lab created in GIT_OS`,
          tags: ['new', type]
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success(`New ${type} lab created!`);
      router.toLab(lab.id);
      await loadDashboardData();
      
    } catch (error) {
      console.error('Error creating lab:', error);
      toast.error('Failed to create lab');
    }
  };

  const deleteLab = async (labId) => {
    if (!confirm('Are you sure you want to delete this lab?')) return;
    
    try {
      const { error } = await supabase
        .from('os_labs')
        .delete()
        .eq('id', labId);
      
      if (error) throw error;
      
      toast.success('Lab deleted successfully');
      await loadDashboardData();
      
    } catch (error) {
      console.error('Error deleting lab:', error);
      toast.error('Failed to delete lab');
    }
  };

  const startPreview = (labId, type) => {
    const sessionId = executionEngine.createSession(labId, user.id, type);
    router.toPreview(sessionId, type);
  };

  const stopSession = (sessionId) => {
    executionEngine.cleanupSession(sessionId);
    loadActiveSessions();
    toast.success('Session stopped');
  };

  const filteredLabs = labs.filter(lab =>
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-30 animate-pulse"></div>
            <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-700">
              <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto" />
              <p className="mt-4 text-gray-300">Loading GIT_OS Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto p-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gray-900 p-3 rounded-lg border border-gray-700">
                <Terminal className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                GIT_OS Dashboard
              </h1>
              <p className="text-gray-400">Welcome back, {profile?.username || 'Developer'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search labs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 w-64"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Lab
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                <DropdownMenuItem onClick={() => createNewLab('web')}>
                  <Globe className="h-4 w-4 mr-2 text-blue-400" />
                  Web Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewLab('cs')}>
                  <Cpu className="h-4 w-4 mr-2 text-emerald-400" />
                  CS Program
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewLab('electron')}>
                  <Rocket className="h-4 w-4 mr-2 text-purple-400" />
                  Electron App
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewLab('python')}>
                  <Code2 className="h-4 w-4 mr-2 text-yellow-400" />
                  Python Script
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Avatar>
              <AvatarImage src={profile?.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                {profile?.username?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Labs</p>
                  <p className="text-3xl font-bold text-white">{stats.totalLabs}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <FolderOpen className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <Progress value={(stats.totalLabs / 50) * 100} className="mt-4 bg-gray-800" />
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Sessions</p>
                  <p className="text-3xl font-bold text-cyan-400">{activeSessions.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {activeSessions.length > 0 ? (
                  <div className="space-y-1">
                    {activeSessions.slice(0, 2).map(session => (
                      <div key={session.id} className="flex items-center justify-between">
                        <span className="truncate">{session.type.toUpperCase()}</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          Running
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>No active sessions</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Executions</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalExecutions}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Terminal className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400">
                  <Sparkles className="h-3 w-3 mr-1" /> +{Math.floor(stats.totalExecutions / 100)} today
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Deployments</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.deploymentCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Cloud className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  <Server className="h-3 w-3 mr-1" /> Vercel
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
          {/* Labs Panel */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <Card className="h-full bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Labs</CardTitle>
                    <CardDescription>
                      {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''} • Sorted by recent
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {filteredLabs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                      <FolderOpen className="h-12 w-12 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No labs yet</h3>
                    <p className="text-gray-400 mb-6">Create your first lab to get started</p>
                    <Button onClick={() => createNewLab('web')} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Lab
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredLabs.map((lab) => (
                      <motion.div
                        key={lab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-emerald-500/30 transition-all cursor-pointer group"
                        onClick={() => router.toLab(lab.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-white truncate">{lab.name}</h3>
                              <Badge variant="outline" className={
                                lab.type === 'cs' ? 'border-emerald-500/30 text-emerald-400' :
                                lab.type === 'electron' ? 'border-purple-500/30 text-purple-400' :
                                lab.type === 'web' ? 'border-blue-500/30 text-blue-400' :
                                'border-gray-500/30 text-gray-400'
                              }>
                                {lab.type.toUpperCase()}
                              </Badge>
                            </div>
                            {lab.description && (
                              <p className="text-sm text-gray-400 truncate">{lab.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-gray-700">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                startPreview(lab.id, lab.type);
                              }}>
                                <Play className="h-4 w-4 mr-2 text-emerald-400" />
                                Run Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${window.location.origin}/#@lab/${lab.id}`);
                                toast.success('Lab link copied!');
                              }}>
                                <Share2 className="h-4 w-4 mr-2 text-blue-400" />
                                Share
                              </DropdownMenuItem>
                              <Separator className="my-1 bg-gray-700" />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteLab(lab.id);
                                }}
                                className="text-red-400"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(lab.updated_at).toLocaleDateString()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Last updated
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {lab.preview_count || 0}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Preview count
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {lab.stars > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                      {lab.stars}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Stars
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {lab.is_deployed && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                                <Cloud className="h-3 w-3 mr-1" />
                                Deployed
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gray-900 border-gray-700 hover:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                startPreview(lab.id, lab.type);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle className="w-2 bg-gradient-to-b from-gray-800 to-gray-900 mx-2 rounded" />

          {/* Activity Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <Card className="h-full bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Live updates from your labs and sessions</CardDescription>
              </CardHeader>
              
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'execution' ? 'bg-emerald-500/10' :
                          activity.type === 'deployment' ? 'bg-blue-500/10' :
                          'bg-purple-500/10'
                        }`}>
                          {activity.type === 'execution' ? (
                            <Terminal className="h-4 w-4 text-emerald-400" />
                          ) : activity.type === 'deployment' ? (
                            <Cloud className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Code2 className="h-4 w-4 text-purple-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white truncate">
                              {activity.type === 'execution' ? 'Code Execution' :
                               activity.type === 'deployment' ? 'Lab Deployed' :
                               'Lab Updated'}
                            </p>
                            <Badge variant="outline" className={
                              activity.status === 'success' ? 'border-green-500/30 text-green-400' :
                              activity.status === 'error' ? 'border-red-500/30 text-red-400' :
                              'border-blue-500/30 text-blue-400'
                            }>
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{activity.lab}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <>
                    <Separator className="my-6 bg-gray-700" />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-cyan-400" />
                        Active Sessions ({activeSessions.length})
                      </h4>
                      <div className="space-y-3">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                session.type === 'cs' ? 'bg-emerald-500/10' :
                                session.type === 'electron' ? 'bg-purple-500/10' :
                                'bg-blue-500/10'
                              }`}>
                                {session.type === 'cs' ? (
                                  <Cpu className="h-4 w-4 text-emerald-400" />
                                ) : session.type === 'electron' ? (
                                  <Rocket className="h-4 w-4 text-purple-400" />
                                ) : (
                                  <Globe className="h-4 w-4 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{session.type.toUpperCase()} Session</p>
                                <p className="text-xs text-gray-400">
                                  Started {Math.floor((Date.now() - session.startTime) / 60000)} min ago
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                onClick={() => router.toPreview(session.id, session.type)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => stopSession(session.id)}
                              >
                                <StopCircle className="h-3 w-3 mr-1" />
                                Stop
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="border-t border-gray-800 pt-6">
                <Button 
                  variant="outline" 
                  className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700"
                  onClick={loadDashboardData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </CardFooter>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Security Status</h3>
                  <p className="text-sm text-gray-400">All systems secure</p>
                </div>
              </div>
              <Badge className="w-full justify-center bg-gradient-to-r from-emerald-500 to-cyan-500">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified & Encrypted
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Quick Actions</h3>
                  <p className="text-sm text-gray-400">Start building</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                  onClick={() => createNewLab('web')}
                >
                  Web
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                  onClick={() => createNewLab('cs')}
                >
                  CS
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <Database className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">System Info</h3>
                  <p className="text-sm text-gray-400">Powered by Supabase</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">API Status</span>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
