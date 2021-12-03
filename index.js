const express = require("express");
const app = express();

var data = // 0 = off, 1 = on
{
  "relay_1": { "status": 0, "start": [], "end": [] },
  "relay_2": { "status": 0, "start": [], "end": [] },
  "relay_3": { "status": 0, "start": [], "end": [] },
  "relay_4": { "status": 0, "start": [], "end": [] }
}




app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/node', (req, res) => res.json(data));

app.get('/status', (req, res) => {
  var status_arr = JSON.parse(JSON.stringify(data))

  for (x in status_arr){
    delete status_arr[x].start
    delete status_arr[x].end
  }


  res.json(status_arr)
});

app.get('/switch', function(req, res) {
  const relay = req.query.relay;
  const status = parseInt(req.query.status);

  data[relay].status = status

  console.log(data)

  res.send('recieved')
});

app.get('/timer', function(req, res) {
  const relay = req.query.relay;
  const start = req.query.start;
  const end = req.query.end;

  data[relay].start.push(start)
  data[relay].end.push(end)

  console.log(data[relay])
  console.log('-----')

  res.redirect('/');
});

app.listen(3000, () => {
  console.log("Started on PORT 3000");
})

setInterval(function() {

  let options = {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  },
  formatter = new Intl.DateTimeFormat([], options);

  var cur = formatter.format(new Date())

  for (const x in data) { //cycle each relay

    if (data[x].start.length > 0) {

      let start = data[x].start[0]
      let end = data[x].end[0]

      //console.log(`cur:${cur}\nstart: ${start}\nend:${end}`)

      if (cur >= start && cur <= end) {
        data[x].status = 1
      } else {
        data[x].status = 0
      }

      if (cur > end) {
        data[x].start.push(data[x].start[0])
        data[x].end.push(data[x].end[0])
        data[x].start.shift()
        data[x].end.shift()
      }

    }
  }

}, 1000)