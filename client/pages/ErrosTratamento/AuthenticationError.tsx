import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function AuthenticationError() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-6 text-center text-2xl font-bold text-gray-900">
              {t('authentication_failed')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mt-2 text-sm text-gray-600 mb-6">
              {t('session_expired')}
            </p>
            <Button onClick={handleGoHome} className="w-full">
              {t('home')}
            </Button>
            <p className="mt-4 text-xs text-gray-500">
              Redirecionando automaticamente em 5 segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
