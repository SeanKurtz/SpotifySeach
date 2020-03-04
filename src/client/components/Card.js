import React from 'react';

const Card = ({ name, popularity, genres }) => {
  const genreStr = genres.join(', ');
  return (
    <div className="list-group-item">
      <h5>{name}</h5>
      <h6>{`Popularity: ${popularity}`}</h6>
      <h6 className="d-inline">Genres: </h6>
      <p className="d-inline">{genreStr}</p>
    </div>
  );
};

/*
const Card = ({
  name, popularity, genres, display
}) => (
  <div className={`card-${display} gutter`}>
    <h4 className="gutter card-title">{name}</h4>
    <p>{`Popularity: ${popularity}`}</p>
    {genres.map((genre, i) => <li key={i.toString()}>{genre}</li>)}
  </div>
);
*/
export default Card;
