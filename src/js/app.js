console.log('JS loaded');

$(() => {
  //testing the API
  //Returns a section of the 3m x 3m what3words grid for a given area.
  const settings = {
    'async': true,
    'crossDomain': true,
    'url': 'https://api.what3words.com/v2/grid?bbox=52.208867%2C0.117540%2C52.207988%2C0.116126&key=E0MJL3VQ&format=json',
    method: 'GET',
    'headers': {}
  };

  $.ajax(settings).done((response) => {
    console.log(response);
  });
});
