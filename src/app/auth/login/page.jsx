import React, { useState } from 'react';
import styles from './login.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
    console.log('Login data:', formData);
  };

  return (
    <div className={styles.loginContainer}>
      
      {/* Placeholder Esquina Superior Izquierda */}
      <div className={styles.topLeftPlaceholder}>
        <span>Imagen</span>
      </div>

      {/* Icono Superior */}
      <div className={styles.loginIconWrapper}>
        <svg className={styles.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      </div>

      {/* Títulos */}
      <h1 className={styles.loginTitle}>Bienvenido</h1>
      <p className={styles.loginSubtitle}>Ingresa a tu cuenta para continuar</p>

      {/* Tarjeta del Formulario */}
      <div className={styles.loginCard}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          
          {/* Correo */}
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
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Recordarme y Link */}
          <div className={styles.formOptions}>
            <label className={styles.rememberLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className={styles.rememberCheckbox}
              />
              Recordarme
            </label>
            <a href="#" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón Iniciar Sesión */}
          <button type="submit" className={styles.submitButton}>
            Iniciar sesión
          </button>
        </form>

        {/* Registro */}
        <div className={styles.registerText}>
          ¿No tienes una cuenta?{' '}
          <a href="#" className={styles.registerLink}>
            Regístrate aquí
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.loginFooter}>
        Sistema de Reservas de Canchas Deportivas
      </footer>
    </div>
  );
}