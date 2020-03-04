# spotify-search
An application that helps music producers scrape the Spotify API for data on spotify's genre system.
Can search by genre and output a table of artists that have an exact match of that genre under their list of genres.
This is better than the default genre search behavior in the spotify client, which returns inexact matches, and does not
list the other genres present on a particular artist. We achieve this through making multiple requests to spotify's search
endpoint. These requests are performed asynchronously from an array of Promises that is built up after the first request of 50 items. The application gets the total number of items, and then builds the array of requests based on the appropriate offsets for the given total number of results. In this manner we can page through the results from the spotify API. Additionally, this application filters the results to only allow exact matches. For example:
a search for the metal genre will return artists that do not have metal listed under their genres field, but instead have subgenres that contain the word metal, like speed metal. This application filters out those results.