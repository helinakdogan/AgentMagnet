import React, { useState } from 'react';

interface ChocolateGridProps {
  items: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

const ChocolateGrid: React.FC<ChocolateGridProps> = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="chocolate-grid-container">
      <div className="chocolate-grid">
        {items.map((item, index) => (
          <div
            key={index}
            className={`chocolate-piece ${hoveredIndex !== null ? 'separated' : ''} ${
              hoveredIndex === index ? 'hovered' : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="chocolate-content">
              <div className="chocolate-icon">
                {item.icon}
              </div>
              <div className="chocolate-text">
                <h4 className="chocolate-title">{item.title}</h4>
                <p className="chocolate-description">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChocolateGrid; 