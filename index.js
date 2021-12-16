const express = require("express");
const app = express();

var data = // 0 = on, 1 = off
{
  "relay_1": { "status": 1, "start": [], "end": [] },
  "relay_2": { "status": 1, "start": [], "end": [] },
  "relay_3": { "status": 1, "start": [], "end": [] },
  "relay_4": { "status": 1, "start": [], "end": [] }
}




app.get('/', (req, res) => { //if '/' load index.html
  res.sendFile(__dirname + '/index.html');
});

app.get('/node', (req, res) => res.json(data));  //if 'node' load JSON data

app.get('/status', (req, res) => {  //if 'status' load object status only, this is what the arduino reads for data.
  var status_arr = JSON.parse(JSON.stringify(data))

  for (x in status_arr){
    delete status_arr[x].start
    delete status_arr[x].end
  }


  res.json(status_arr)
});

app.get('/switch', function(req, res) { // if server recieves GET 'switch' toggle specific relay status
  const relay = req.query.relay;
  const status = parseInt(req.query.status);

  data[relay].status = status

  console.log(data)

  res.send('recieved')
});

app.get('/timer', function(req, res) { // if server recieves GET 'time' set timer to JSON
  const relay = req.query.relay;
  const start = req.query.start;
  const end = req.query.end;

  data[relay].start.push(start)
  data[relay].end.push(end)

  console.log(data[relay])
  console.log('-----')

  res.redirect('/');
});

app.get('/delete', function(req, res) { //if server recieves GET 'delete' delete specific time for the specific relay
  const relay = req.query.relay;
  const index = req.query.time;

  data[relay].start.splice(index, 1)
  data[relay].end.splice(index, 1)

  console.log(data[relay])
  res.redirect('/');
});

app.get('/reset', function(req, res) { //if server recieves GET 'reset' clears all relay status and time
  for (x in data){
    data[x].start = []
    data[x].end = []
    data[x].status = 1
  }

  res.redirect('/');
});

app.listen(3000, () => {
  console.log("Started on PORT 3000");
})

setInterval(function() { //code repeats ever 1s (1000ms), Checks the start and end time for each relay, This is the part where it automatically toggles the relays ON or OFF if time is set on the relays.

  let options = {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  },
  formatter = new Intl.DateTimeFormat([], options);

  var cur = formatter.format(new Date()) //current time

  for (const x in data) { //cycle each relay

    if (data[x].start.length > 0) { // if there is time set in the relay

      let start = data[x].start[0] //gets the time in array start index 0 (first in line)
      let end = data[x].end[0] //gets the time in array end index 0 (first in line)

      if (cur >= start && cur <= end) { // If current time is greater than the start time in the array AND current time is less than the end time in the array
        data[x].status = 0 //turn on 
      } else {
        data[x].status = 1 //else, turn it off
      }

      if (cur > end) { // if current time is greater than end, move start and end time in index 0 to the end of the array.
        data[x].start.push(data[x].start[0])
        data[x].end.push(data[x].end[0])
        data[x].start.shift()
        data[x].end.shift()
      }

    }
  }

}, 1000)