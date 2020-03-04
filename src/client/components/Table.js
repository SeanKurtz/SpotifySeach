import React from 'react';

const Table = ({ items }) => {
  const itemStrings = items.map(item => `${item.name}, ${item.popularity},  ${item.id}, ${item.genres.join(', ')}\n`);

  return (
    <p className="item-display">{itemStrings}</p>
  );
};

export default Table;
