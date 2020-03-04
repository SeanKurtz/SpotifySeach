import React from 'react';

const Card = ({
  items
}) => (
  <table className="table table-sm">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Popularity</th>
        <th scope="col">Followers</th>
        <th scope="col">Spotify Id</th>
        <th scope="col">Genres</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.popularity}</td>
          <td>{item.followers}</td>
          <td>{item.id}</td>
          <td>{item.genres.join(', ')}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* fo
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
