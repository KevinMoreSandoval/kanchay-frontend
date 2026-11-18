import { Button, FormField, Input, Loading, PasswordInput } from '@/components/ui';
import { AuthLayout } from '../components/auth-layout';
import { useLoginForm } from '../hooks/use-login-form';
import type { LoginCredentials } from '@/services/auth-service';
import type { AuthSession } from '@/types';

export interface LoginPageProps {
  onLoginSuccess?: (credentials: LoginCredentials) => Promise<AuthSession>;
  onNavigateToRegister?: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }: LoginPageProps) {
  const {
    formData,
    errors,
    canSubmit,
    handleBlur,
    isSubmitting,
    setForgotNotification,
    handleChange,
    handleSubmit,
  } = useLoginForm({ onLoginSuccess });

  return (
    <AuthLayout>
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Tu deporte, más cerca que nunca
        </h1>
        <p className="text-sm font-medium text-primary">Encuentra, reserva y juega.</p>
        <p className="text-sm text-muted-foreground pt-1">
          Ingresa tus datos para <strong className="text-foreground">iniciar sesión.</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField id="email" label="Correo electrónico" error={errors.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            error={!!errors.email}
          />
        </FormField>

        <FormField id="password" label="Contraseña" error={errors.password} required>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            error={!!errors.password}
          />
        </FormField>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() =>
              setForgotNotification(
                'Recuperación de contraseña en desarrollo. Por favor contacta al administrador.'
              )
            }
            className="text-xs font-semibold text-primary hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-base font-bold shadow-md hover:shadow-lg transition-all"
          disabled={!canSubmit}
        >
          {isSubmitting ? <Loading label="Iniciando sesión..." /> : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground pt-2">
        ¿No tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="font-bold text-primary hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
        >
          Regístrate aquí
        </button>
      </p>
    </AuthLayout>
  );
}
