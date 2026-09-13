import React, { useState } from 'react';
import styles from './register.module.css';
import { registerApi } from '../../services/auth-service'; 
import { User, IdCard, Calendar, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'Obligatorio.';
    else if (!nameRegex.test(formData.firstName)) newErrors.firstName = 'Solo letras.';

    if (!formData.lastName.trim()) newErrors.lastName = 'Obligatorio.';
    else if (!nameRegex.test(formData.lastName)) newErrors.lastName = 'Solo letras.';

    if (!formData.dni.trim()) newErrors.dni = 'DNI obligatorio.';
    else if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'Debe tener 8 dígitos.';

    if (!formData.birthDate) newErrors.birthDate = 'Obligatorio.';

    if (!formData.phone.trim()) newErrors.phone = 'Teléfono obligatorio.';
    else if (!/^\d{9}$/.test(formData.phone)) newErrors.phone = 'Debe tener 9 dígitos.';

    if (!formData.email.trim()) newErrors.email = 'Correo obligatorio.';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Correo inválido.';

    if (!formData.password) newErrors.password = 'Contraseña obligatoria.';
    else if (!passwordRegex.test(formData.password)) newErrors.password = 'Mínimo 8 caracteres, mayúscula, minúscula y número.';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña.';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';

    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dni: formData.dni.trim(),
        birthDate: formData.birthDate,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const data = await registerApi(payload);
      if (onRegisterSuccess) onRegisterSuccess(data);
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fieldErrorStyle = {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '0.2rem',
    display: 'block',
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </div>
            <span className={styles.logoText}>
              Cancha<span className={styles.logoGreen}>Ya</span>
            </span>
          </div>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Completa el formulario para registrarte</p>
        </div>

        {errorMessage && (
          <div style={{ color: '#ef4444', marginBottom: '0.8rem', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* DOS BLOQUES SUPERIORES */}
          <div className={styles.topSectionsGrid}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.greenDot}></span>
                INFORMACIÓN PERSONAL
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.inputGroup}>
                  <label>Nombre</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  {errors.firstName && <span style={fieldErrorStyle}>{errors.firstName}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Apellido</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Pérez"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  {errors.lastName && <span style={fieldErrorStyle}>{errors.lastName}</span>}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>DNI</label>
                <div className={styles.inputWrapper}>
                  <IdCard className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    name="dni"
                    maxLength={8}
                    placeholder="Ingrese su DNI"
                    value={formData.dni}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                {errors.dni && <span style={fieldErrorStyle}>{errors.dni}</span>}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.greenDot}></span>
                DATOS DE CONTACTO Y CUENTA
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.inputGroup}>
                  <label>Fecha de nac.</label>
                  <div className={styles.inputWrapper}>
                    <Calendar className={styles.inputIcon} size={18} />
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  {errors.birthDate && <span style={fieldErrorStyle}>{errors.birthDate}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Teléfono</label>
                  <div className={styles.inputWrapper}>
                    <Phone className={styles.inputIcon} size={18} />
                    <input
                      type="tel"
                      name="phone"
                      maxLength={9}
                      placeholder="+51 *** *** ***"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  {errors.phone && <span style={fieldErrorStyle}>{errors.phone}</span>}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Correo electrónico</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                {errors.email && <span style={fieldErrorStyle}>{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* BLOQUE INFERIOR DE SEGURIDAD */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.greenDot}></span>
              SEGURIDAD
            </div>

            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span style={fieldErrorStyle}>{errors.password}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Confirmar contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={fieldErrorStyle}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.termsWrapper}>
            <label className={styles.termsLabel}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>Acepto los <span className={styles.termsLink}>términos y condiciones</span> y la <span className={styles.termsLink}>política de privacidad</span></span>
            </label>
            {errors.acceptTerms && <span style={fieldErrorStyle}>{errors.acceptTerms}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Cargando...' : 'Crear cuenta ➔'}
          </button>

          <div className={styles.divider}><span>o</span></div>

          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <button type="button" onClick={onNavigateToLogin} className={styles.linkBtn}>
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}