import { Button, Checkbox, FormField, Input, Label, Loading, PasswordInput } from '@/components/ui';
import { AuthLayout } from '../components/auth-layout';
import { TermsModal } from '../components/terms-modal';
import { useRegisterForm } from '../hooks/use-register-form';
import type { AuthSession } from '@/types';

export interface RegisterPageProps {
  onRegisterSuccess?: (session: AuthSession) => void;
  onNavigateToLogin?: () => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigateToLogin }: RegisterPageProps) {
  const {
    formData,
    errors,
    errorMessage,
    loading,
    termsModalTitle,
    setTermsModalTitle,
    handleChange,
    handleSubmit,
  } = useRegisterForm({ onRegisterSuccess });

  return (
    <AuthLayout>
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Crear cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa tus datos para comenzar a reservar en CanchaYa
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}

      <TermsModal title={termsModalTitle} onClose={() => setTermsModalTitle(null)} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="firstName" label="Nombre" error={errors.firstName} required>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Juan"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.firstName}
            />
          </FormField>

          <FormField id="lastName" label="Apellido" error={errors.lastName} required>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Pérez"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.lastName}
            />
          </FormField>

          <FormField id="dni" label="DNI" error={errors.dni} required>
            <Input
              id="dni"
              name="dni"
              inputMode="numeric"
              maxLength={8}
              placeholder="8 dígitos"
              autoComplete="off"
              value={formData.dni}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.dni}
            />
          </FormField>

          <FormField id="birthDate" label="Fecha de nacimiento" error={errors.birthDate} required>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              autoComplete="bday"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.birthDate}
            />
          </FormField>

          <FormField id="phone" label="Teléfono" error={errors.phone} required>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={9}
              placeholder="999 999 999"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.phone}
            />
          </FormField>

          <FormField id="email" label="Correo electrónico" error={errors.email} required>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.email}
            />
          </FormField>

          <FormField id="password" label="Contraseña" error={errors.password} required>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.password}
            />
          </FormField>

          <FormField
            id="confirmPassword"
            label="Confirmar contraseña"
            error={errors.confirmPassword}
            required
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.confirmPassword}
            />
          </FormField>
        </div>

        <div className="pt-2 space-y-1">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.acceptTerms}
              className="mt-0.5"
            />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <Label
                htmlFor="acceptTerms"
                className="cursor-pointer font-normal text-xs text-muted-foreground mr-1"
              >
                Acepto los
              </Label>
              <button
                type="button"
                onClick={() => setTermsModalTitle('Términos y Condiciones de Uso')}
                className="font-semibold text-primary hover:underline underline-offset-2 cursor-pointer"
              >
                términos y condiciones
              </button>
              {' y la '}
              <button
                type="button"
                onClick={() => setTermsModalTitle('Política de Privacidad y Protección de Datos')}
                className="font-semibold text-primary hover:underline underline-offset-2 cursor-pointer"
              >
                política de privacidad
              </button>
              .
            </div>
          </div>
          {errors.acceptTerms && (
            <p role="alert" className="text-xs text-destructive font-medium pl-6">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-base font-bold shadow-md hover:shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? <Loading label="Creando cuenta..." /> : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground pt-1">
        ¿Ya tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          disabled={loading}
          className="font-bold text-primary hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
        >
          Inicia sesión
        </button>
      </p>
    </AuthLayout>
  );
}
