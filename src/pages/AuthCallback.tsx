import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // MSAL handles the redirect automatically
    // This page just shows a loading state while it processes
    instance.handleRedirectPromise()
      .then((response) => {
        if (response) {
          // Successfully authenticated, redirect to home
          navigate('/', { replace: true });
        } else {
          // No response, might already be authenticated or failed
          navigate('/', { replace: true });
        }
      })
      .catch((error) => {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      });
  }, [instance, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Completing sign in...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
