import React from 'react';
import { MapPin, CheckCircle, Info, Calendar } from 'lucide-react';
import styles from './CardCourt.module.css';

export function CardCourt({ court, onDetails, onReserve }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={court.image} alt={court.name} className={styles.image} />
        <span className={styles.priceTag}>S/ {court.price} / hora</span>
      </div>

      <div className={styles.contentContainer}>
        <h4 className={styles.courtTitle}>{court.name}</h4>
        
        <div className={styles.locationContainer}>
          <MapPin size={15} />
          <span>{court.location}</span>
        </div>

        <div className={styles.featuresContainer}>
          {court.features.map((feature, index) => (
            <span key={index} className={styles.featureBadge}>
              <CheckCircle size={13} />
              {feature}
            </span>
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <button 
            onClick={() => onDetails(court.id)} 
            className={styles.detailsBtn}
          >
            <Info size={14} /> Ver detalles
          </button>
          <button 
            onClick={() => onReserve(court.id)} 
            className={styles.reserveBtn}
          >
            <Calendar size={14} /> Reservar ahora
          </button>
        </div>
      </div>
    </div>
  );
}