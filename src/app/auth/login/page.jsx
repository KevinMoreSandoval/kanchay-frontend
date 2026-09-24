import { useState } from 'react';
import styles from './login.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  }

  return errors;
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        className={`${styles.input} ${error ? styles.inputInvalid : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <span id={`${id}-error`} className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = validate(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onLoginSuccess?.({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
    } catch (err) {
      setServerError(err.message || 'Error al conectar con el servidor. Revisa tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.visualPanel}>
        <div className={styles.brandOverlay}>
          <img src="/assets/svg/banner.svg" alt="" aria-hidden="true" className={styles.banner} />
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.containerLogo}>
            <img src="/assets/img/logo-court.png" alt="Court" className={styles.img} />
          </div>
          <h1 className={styles.title}>Tu deporte, más cerca que nunca</h1>
          <p className={styles.tagline}>Encuentra, reserva y juega.</p>
          <p className={styles.subtitle}>
            Ingresa tus datos para <strong>iniciar sesión.</strong>
          </p>

          {serverError && (
            <div className={styles.alertError} role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Field
              id="email"
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              error={errors.email}
              required
            />

            <Field
              id="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              error={errors.password}
              required
            />

            <div className={styles.optionsRow}>
              <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={styles.checkbox}
                />
                Recordarme
              </label>

              <button
                type="button"
                className={styles.forgotButton}
                onClick={() => alert('Próximamente disponible.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿No tienes una cuenta?{' '}
            <button type="button" onClick={onNavigateToRegister} className={styles.linkButton}>
              Regístrate aquí
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
