import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './register.module.css';
import { registerApi } from '../../services/auth-service';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validate(data) {
  const errors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'El nombre es obligatorio.';
  } else if (!NAME_REGEX.test(data.firstName.trim())) {
    errors.firstName = 'Solo se permiten letras.';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio.';
  } else if (!NAME_REGEX.test(data.lastName.trim())) {
    errors.lastName = 'Solo se permiten letras.';
  }

  if (!data.dni.trim()) {
    errors.dni = 'El DNI es obligatorio.';
  } else if (!/^\d{8}$/.test(data.dni.trim())) {
    errors.dni = 'El DNI debe tener 8 dígitos.';
  }

  if (!data.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  }

  if (!data.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio.';
  } else if (!/^\d{9}$/.test(data.phone.trim())) {
    errors.phone = 'Debe tener 9 dígitos.';
  }

  if (!data.email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo válido.';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (!PASSWORD_REGEX.test(data.password)) {
    errors.password = 'Mínimo 8 caracteres, mayúscula, minúscula y número.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = 'Debes aceptar los términos y condiciones.';
  }

  return errors;
}

function Field({ id, label, error, action, ...inputProps }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          name={id}
          className={[
            styles.input,
            action ? styles.inputWithAction : '',
            error ? styles.inputInvalid : '',
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {action}
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
}

function PasswordField({ disabled, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      disabled={disabled}
      action={
        <button
          type="button"
          className={styles.togglePassword}
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}

export default function RegisterPage({ onRegisterSuccess, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const newErrors = validate(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await registerApi({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dni: formData.dni.trim(),
        birthDate: formData.birthDate,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      onRegisterSuccess?.(data);
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Props comunes a todos los campos
  const field = (id) => ({
    id,
    value: formData[id],
    onChange: handleChange,
    disabled: loading,
    error: errors[id],
  });

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
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Completa tus datos para comenzar</p>

          {errorMessage && (
            <div className={styles.alertError} role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.fieldsGrid}>
              <Field
                {...field('firstName')}
                label="Nombre"
                type="text"
                placeholder="Juan"
                autoComplete="given-name"
              />
              <Field
                {...field('lastName')}
                label="Apellido"
                type="text"
                placeholder="Pérez"
                autoComplete="family-name"
              />
              <Field
                {...field('dni')}
                label="DNI"
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="8 dígitos"
                autoComplete="off"
              />
              <Field
                {...field('birthDate')}
                label="Fecha de nacimiento"
                type="date"
                autoComplete="bday"
              />
              <Field
                {...field('phone')}
                label="Teléfono"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="999 999 999"
                autoComplete="tel"
              />
              <Field
                {...field('email')}
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
              <PasswordField
                {...field('password')}
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <PasswordField
                {...field('confirmPassword')}
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
              />
            </div>

            <div className={styles.termsWrapper}>
              <label htmlFor="acceptTerms" className={styles.termsLabel}>
                <input
                  id="acceptTerms"
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.checkbox}
                  aria-invalid={!!errors.acceptTerms}
                  aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
                />
                <span>
                  Acepto los{' '}
                  <button type="button" className={styles.termsLink}>
                    términos y condiciones
                  </button>{' '}
                  y la{' '}
                  <button type="button" className={styles.termsLink}>
                    política de privacidad
                  </button>
                </span>
              </label>

              {errors.acceptTerms && (
                <span id="acceptTerms-error" className={styles.errorMessage}>
                  {errors.acceptTerms}
                </span>
              )}
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className={styles.linkButton}
              disabled={loading}
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
