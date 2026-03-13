import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VersionDisplay: React.FC = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await axios.get('/api/version');
        setVersion(response.data.version);
      } catch (error) {
        console.error('Failed to fetch version:', error);
      }
    };

    fetchVersion();
  }, []);

  if (!version) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        fontSize: '12px',
        color: 'rgba(128, 128, 128, 0.5)',
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'monospace',
        zIndex: 9999
      }}
    >
      v{version}
    </div>
  );
};

export default VersionDisplay;
