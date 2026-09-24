import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/navbar/Navbar';
import { CardCourt } from '../../components/card-court/CardCourt';
import styles from './ClientDashboard.module.css';

const MOCK_COURTS = [
  {
    id: 1,
    name: 'Fútbol 5',
    location: 'Sede Principal',
    price: 30,
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80',
    features: ['Fútbol', '10', 'Iluminación LED'],
  },
  {
    id: 2,
    name: 'Fútbol 11',
    location: 'Sede Norte',
    price: 50,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    features: ['Fútbol 11', '12', 'Reflectores halógenos'],
  },
  {
    id: 3,
    name: 'Vóley',
    location: 'Sede Principal',
    price: 50,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80',
    features: ['Vóley', '12', 'Iluminación LED'],
  },
];

export default function ClientPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState({
    name: 'Usuario',
    role: 'Cliente',
    initials: 'US',
  });

  useEffect(() => {
    // Obtenemos los datos del usuario logueado desde localStorage (o tu gestor de estado)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Unimos nombre y apellido si vienen separados, o usamos el nombre por defecto
        const firstName = parsedUser.firstName || parsedUser.name || '';
        const lastName = parsedUser.lastName || '';
        const fullName = lastName ? `${firstName} ${lastName}`.trim() : (firstName || 'Usuario');
        
        // Calculamos las iniciales automáticamente (ej: "Juan Pérez" -> "JP")
        const calculatedInitials = fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        setCurrentUser({
          name: fullName,
          role: parsedUser.role || 'Cliente',
          initials: calculatedInitials || 'US',
        });
      } catch (error) {
        console.error('Error al parsear el usuario del localStorage:', error);
      }
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDetails = (id) => {
    console.log(`Ver detalles de la cancha ID: ${id}`);
  };

  const handleReserve = (id) => {
    console.log(`Reservar cancha ID: ${id}`);
  };

  const filteredCourts = MOCK_COURTS.filter((court) =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.dashboard}>
      <Navbar user={currentUser} />

      <main className={styles.mainContent}>
        <section className={styles.welcomeSection}>
          <h2 className={styles.greeting}>
            Hola, {currentUser.name} <span aria-hidden="true">👋</span>
          </h2>
          <div className={styles.searchContainer}>
            <label htmlFor="search-court" className={styles.srOnly}>
              Buscar por tipo de cancha
            </label>
            <input
              id="search-court"
              type="text"
              placeholder="Buscar por tipo de cancha..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
        </section>

        <section className={styles.courtsSection}>
          <h3 className={styles.sectionTitle}>Nuestras canchas</h3>
          
          {filteredCourts.length > 0 ? (
            <div className={styles.cardsGrid}>
              {filteredCourts.map((court) => (
                <CardCourt
                  key={court.id}
                  court={court}
                  onDetails={handleDetails}
                  onReserve={handleReserve}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No se encontraron canchas disponibles para tu búsqueda.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}