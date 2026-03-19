import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) {
    return null;
  }
  
  return (
    <div className={styles.errorBox}>
      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-warning" />
      {error}
    </div>
  );
};

export default ErrorDisplay; 