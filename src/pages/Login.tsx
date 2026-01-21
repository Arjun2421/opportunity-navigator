import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User, AlertCircle, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithMicrosoft, isDevMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithMicrosoft();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access the Opportunity Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Microsoft OAuth Login - Primary method */}
          <Button 
            onClick={handleMicrosoftLogin} 
            className="w-full gap-2" 
            size="lg"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft
          </Button>

          {/* Development mode login */}
          {isDevMode && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Development Mode Only
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? 'Signing in...' : 'Dev Sign In'}
                </Button>
              </form>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Dev Credentials:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Master:</strong> master@example.com / master123</p>
                  <p><strong>Admin:</strong> admin@example.com / admin123</p>
                  <p><strong>Basic:</strong> user@example.com / user123</p>
                </div>
              </div>
            </>
          )}

          {/* Role descriptions */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs font-medium mb-2">User Roles:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Master:</strong> Full control - Admin panel, role management, approval revert</p>
              <p><strong>Admin:</strong> Can approve tender values</p>
              <p><strong>Basic:</strong> View-only access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
