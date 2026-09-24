import React from 'react';
import { Bell } from 'lucide-react';
import styles from './Navbar.module.css';

export function Navbar({ user }) {
  const userName = user?.name || 'Usuario';
  const userRole = user?.role || 'Cliente';
  const initials = user?.initials || 'A';

  return (
    <header className={styles.navbar}>
      <div className={styles.logoContainer}>
        <span className={styles.logoIcon}>⚽</span>
        <span className={styles.logoText}>Kanchay</span>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.notificationBtn} aria-label="Notificaciones">
          <Bell size={20} />
        </button>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {initials}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}