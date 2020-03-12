import React from 'react';

const Table = ({
  items
}) => (
  <table className="table table-sm table-responsive">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col" className="mr-2">Popularity</th>
        <th scope="col" className="mr-2">Followers</th>
        <th scope="col" className="mr-2">Spotify Id</th>
        <th scope="col">Genres</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i.toString()}>
          <td>{item.name}</td>
          <td className="text-right mr-2">{item.popularity}</td>
          <td className="text-right">{item.followers.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
          <td className="text-right">{item.id}</td>
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
export default Table;
