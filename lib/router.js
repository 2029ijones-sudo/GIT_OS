// Custom router for #@ routes
class GitOSRouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.listeners = new Set();
    
    // Predefined routes
    this.defineRoute('auth', 'Auth');
    this.defineRoute('dashboard', 'Dashboard');
    this.defineRoute('lab/:id', 'LabEditor');
    this.defineRoute('preview/:sessionId/:type', 'LabPreview');
    this.defineRoute('labs', 'LabsList');
    this.defineRoute('execute/:labId/:language', 'ExecutionTerminal');
    this.defineRoute('deploy/:labId', 'DeploymentView');
    
    // Initialize
    this.parseCurrentHash();
    
    // Listen for hash changes
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.parseCurrentHash());
    }
  }
  
  defineRoute(pattern, component) {
    this.routes.set(pattern, {
      component,
      regex: this.patternToRegex(pattern)
    });
  }
  
  patternToRegex(pattern) {
    const regexPattern = pattern.replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${regexPattern}$`);
  }
  
  parseCurrentHash() {
    const hash = window.location.hash;
    
    if (!hash.startsWith('#@')) {
      this.currentRoute = { component: 'Dashboard', params: {} };
      this.notifyListeners();
      return;
    }
    
    const routePath = hash.substring(2); // Remove '#@'
    
    for (const [pattern, route] of this.routes.entries()) {
      const match = routePath.match(route.regex);
      
      if (match) {
        // Extract params
        const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
        const params = {};
        
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        this.currentRoute = {
          component: route.component,
          params,
          fullPath: routePath
        };
        
        this.notifyListeners();
        return;
      }
    }
    
    // Default to dashboard if no match
    this.currentRoute = { component: 'Dashboard', params: {} };
    this.notifyListeners();
  }
  
  navigateTo(pattern, ...params) {
    let routePath = pattern;
    
    // Replace params in pattern
    const paramValues = [...params];
    routePath = routePath.replace(/:\w+/g, () => paramValues.shift() || '');
    
    window.location.hash = `#@${routePath}`;
  }
  
  // Quick navigation methods
  toDashboard() {
    this.navigateTo('dashboard');
  }
  
  toLab(labId) {
    this.navigateTo('lab/:id', labId);
  }
  
  toPreview(sessionId, type = 'cs') {
    this.navigateTo('preview/:sessionId/:type', sessionId, type);
  }
  
  toExecute(labId, language) {
    this.navigateTo('execute/:labId/:language', labId, language);
  }
  
  addListener(listener) {
    this.listeners.add(listener);
  }
  
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentRoute));
  }
  
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Singleton instance
const router = new GitOSRouter();
export default router;
