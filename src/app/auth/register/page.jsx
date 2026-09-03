import React, { useState } from 'react';
import styles from './register.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register data:', formData);
  };

  return (
    <div className={styles.registerContainer}>
      
      {/* Placeholder Esquina Superior Izquierda */}
      <div className={styles.topLeftPlaceholder}>
        <span>Imagen</span>
      </div>

      {/* Icono Superior */}
      <div className={styles.registerIconWrapper}>
        <svg className={styles.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>

      {/* Títulos */}
      <h1 className={styles.registerTitle}>Crear cuenta</h1>
      <p className={styles.registerSubtitle}>Completa el formulario para registrarte</p>

      {/* Tarjeta del Formulario */}
      <div className={styles.registerCard}>
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          
          {/* Nombre y Apellido */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Apellido</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Pérez"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>
          </div>

          {/* DNI */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>DNI</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
                </svg>
              </span>
              <input
                type="text"
                name="dni"
                placeholder="Ingrese su DNI"
                value={formData.dni}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Fecha de nacimiento</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Correo electrónico */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Teléfono</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="+51 900 000 000"
                value={formData.phone}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirmar contraseña</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className={styles.iconSmall} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className={styles.termsWrapper}>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={styles.termsCheckbox}
              required
            />
            <span>
              Acepto los <a href="#" className={styles.termsLink}>términos y condiciones</a> y la <a href="#" className={styles.termsLink}>política de privacidad</a>
            </span>
          </div>

          {/* Botón Crear cuenta */}
          <button type="submit" className={styles.submitButton}>
            Crear cuenta
          </button>
        </form>

        {/* Enlace a Login */}
        <div className={styles.loginText}>
          ¿Ya tienes una cuenta?{' '}
          <a href="#" className={styles.loginLink}>
            Inicia sesión
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.registerFooter}>
        Sistema de Reservas de Canchas Deportivas
      </footer>
    </div>
  );
}