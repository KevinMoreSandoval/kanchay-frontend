// src/app/pages/login/LoginPage.jsx

import React, { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (onLoginSuccess) {
        await onLoginSuccess({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      setServerError(err.message || "Error al conectar con el servidor. Revisa tu conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      {/* Panel Izquierdo Visual */}
      <div className={styles.visualPanel}>
        <div className={styles.brandOverlay}>
          <div className={styles.logoContainer}>
            <span className={styles.ballIcon}>⚽</span>
            <span className={styles.brandName}>
              Cancha<span className={styles.brandHighlight}>Ya</span>
            </span>
          </div>
        </div>

        <div className={styles.heroTextContainer}>
          <p className={styles.heroText}>
            Reserva tu cancha,<br />juega tu partido
          </p>
        </div>
      </div>

      {/* Panel Derecho - Formulario Real */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.topIconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Ingresa a tu cuenta para continuar</p>

          {serverError && (
            <div className={styles.alertError} role="alert" aria-live="assertive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${styles.input} ${errors.email ? styles.inputInvalid : ""}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <span id="email-error" className={styles.errorMessage}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${styles.input} ${errors.password ? styles.inputInvalid : ""}`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                required
              />
              {errors.password && (
                <span id="password-error" className={styles.errorMessage}>
                  {errors.password}
                </span>
              )}
            </div>

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
                onClick={() => alert("Próximamente disponible.")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className={styles.footer}>
            <span>¿No tienes una cuenta? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className={styles.linkButton}
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}