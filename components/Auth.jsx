'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Github, 
  Chrome, 
  Shield, 
  Sparkles, 
  Code2,
  Eye,
  Fingerprint,
  Server,
  Cpu,
  Zap,
  Globe,
  Lock,
  Unlock,
  User,
  Mail,
  Key,
  LogIn,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Auth() {
  const [mode, setMode] = useState('login'); // login, register, magic-link
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [features] = useState([
    { icon: <Cpu className="h-5 w-5" />, text: 'Real CS Program Execution', color: 'text-emerald-400' },
    { icon: <Terminal className="h-5 w-5" />, text: 'Advanced Terminal', color: 'text-cyan-400' },
    { icon: <Globe className="h-5 w-5" />, text: 'Global Deployment', color: 'text-blue-400' },
    { icon: <Zap className="h-5 w-5" />, text: '14-Minute Previews', color: 'text-yellow-400' },
    { icon: <Shield className="h-5 w-5" />, text: 'Enterprise Security', color: 'text-purple-400' },
    { icon: <Server className="h-5 w-5" />, text: 'Supabase Backend', color: 'text-pink-400' }
  ]);

  const handleAuth = async (provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/#@dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
      toast.success(`Signing in with ${provider}...`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      const { error } = mode === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: { username },
              emailRedirectTo: `${window.location.origin}/#@dashboard`
            }
          });
      
      if (error) throw error;
      
      toast.success(
        mode === 'login' 
          ? 'Welcome back!' 
          : 'Check your email for confirmation!'
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500" />
        </div>
        
        {/* Binary rain background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xs text-emerald-400/20 font-mono"
              initial={{ y: -20, x: Math.random() * 100 }}
              animate={{ 
                y: '100vh',
                transition: {
                  duration: 10 + Math.random() * 20,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Hero/Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <Terminal className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  GIT_OS
                </h1>
                <p className="text-gray-400">The Future of Code Execution</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Beyond GitHub. Beyond Limits.
              </h2>
              <p className="text-gray-300 text-lg">
                Experience the most advanced code execution platform with real-time 
                CS program execution, Electron app previews, and 14-minute interactive sessions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className={`p-2 rounded-lg bg-gray-900 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Live Stats</h3>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  <Sparkles className="h-3 w-3 mr-1" /> LIVE
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">1.2K</div>
                  <div className="text-xs text-gray-400">Active Labs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">4.7K</div>
                  <div className="text-xs text-gray-400">Executions Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">99.9%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Welcome to GIT_OS</CardTitle>
                    <CardDescription className="text-gray-400">
                      Secure login to the most advanced code platform
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <Lock className="h-3 w-3 mr-1" /> Secure
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-gray-800">
                    <TabsTrigger value="login" className="data-[state=active]:bg-gray-700">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-gray-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="developer@git-os.dev"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <Button
                      onClick={handleEmailAuth}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Username
                      </label>
                      <Input
                        type="text"
                        placeholder="coder42"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="developer@git-os.dev"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <Button
                      onClick={handleEmailAuth}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 text-center">Or continue with</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAuth('github')}
                      disabled={loading}
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAuth('google')}
                      disabled={loading}
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                    >
                      <Chrome className="h-5 w-5 mr-2" />
                      Google
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-emerald-400 mr-2" />
                    <span>End-to-end encrypted communication</span>
                  </div>
                  <div className="flex items-center">
                    <Fingerprint className="h-3 w-3 text-cyan-400 mr-2" />
                    <span>Biometric authentication support</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 text-blue-400 mr-2" />
                    <span>Zero-knowledge architecture</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3 border-t border-gray-800 pt-6">
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-emerald-400 hover:underline">Terms</a>{' '}
                  and{' '}
                  <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>
                </p>
                <Badge variant="outline" className="text-xs border-gray-700">
                  <Server className="h-3 w-3 mr-1" />
                  Powered by Supabase & Vercel
                </Badge>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
