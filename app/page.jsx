'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import LabEditor from '@/components/LabEditor';
import LabPreview from '@/components/LabPreview';
import LabsList from '@/components/LabsList';

// Custom route parser for #@ format
function parseCustomRoute(url) {
  if (!url.includes('#@')) return null;
  
  const [, route] = url.split('#@');
  const [component, ...params] = route.split('/');
  
  return {
    component,
    params,
    isCustomRoute: true
  };
}

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [routeData, setRouteData] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Listen for hash changes (our custom #@ routes)
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      
      if (currentHash.startsWith('#@')) {
        const route = parseCustomRoute(currentHash);
        if (route) {
          setRouteData(route);
          
          // Map component to view
          const viewMap = {
            'auth': 'auth',
            'dashboard': 'dashboard',
            'lab': 'editor',
            'preview': 'preview',
            'labs': 'labs',
            'execute': 'execute',
            'deploy': 'deploy'
          };
          
          setCurrentView(viewMap[route.component] || 'dashboard');
        }
      } else {
        // Handle normal Next.js routes
        setCurrentView('dashboard');
        setRouteData(null);
      }
    };

    // Initial check
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom navigation function
  const navigateTo = (component, ...params) => {
    const route = `#@${component}${params.length ? '/' + params.join('/') : ''}`;
    window.location.hash = route;
  };

  // Render based on custom route
  const renderContent = () => {
    switch(currentView) {
      case 'auth':
        return <Auth onLogin={(user) => setUser(user)} />;
      
      case 'dashboard':
        return <Dashboard user={user} navigateTo={navigateTo} />;
      
      case 'editor':
        return routeData ? (
          <LabEditor 
            labId={routeData.params[0]} 
            user={user}
            navigateTo={navigateTo}
          />
        ) : <Dashboard user={user} navigateTo={navigateTo} />;
      
      case 'preview':
        return routeData ? (
          <LabPreview 
            sessionId={routeData.params[0]}
            type={routeData.params[1]}
            user={user}
            navigateTo={navigateTo}
          />
        ) : <Dashboard user={user} navigateTo={navigateTo} />;
      
      case 'labs':
        return <LabsList user={user} navigateTo={navigateTo} />;
      
      case 'execute':
        return routeData ? (
          <div className="execute-terminal">
            {/* Terminal execution view */}
            <h2>Executing: {routeData.params[0]}</h2>
            {/* Terminal component would go here */}
          </div>
        ) : <Dashboard user={user} navigateTo={navigateTo} />;
      
      default:
        return <Dashboard user={user} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Custom Navigation Bar */}
      <nav className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigateTo('dashboard')}
          >
            GIT_OS
          </h1>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigateTo('labs')}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              My Labs
            </button>
            {user ? (
              <button 
                onClick={() => navigateTo('auth')}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                New Lab
              </button>
            ) : (
              <button 
                onClick={() => navigateTo('auth')}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {renderContent()}
      </main>

      {/* Custom Route Debug (remove in production) */}
      {process.env.NODE_ENV === 'development' && routeData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 p-3 rounded text-xs">
          <div>Custom Route: {window.location.hash}</div>
          <div>Component: {routeData.component}</div>
          <div>Params: {JSON.stringify(routeData.params)}</div>
        </div>
      )}
    </div>
  );
}
