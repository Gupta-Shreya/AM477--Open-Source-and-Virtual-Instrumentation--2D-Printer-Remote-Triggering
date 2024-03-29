const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use('/public', express.static('public')); // expose public
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));

app.get('/', async (req, res) => {
  res.sendFile('file:///C:/Users/Tarun/Documents/tarun/AM477/codepen_pqKWpP/image2gcode-master/image2gcode-master/draw/index.html', {root: __dirname}, (err) => {
    if (err) {
      res.send(`ERROR: ${err}`);
    }
  });
});

app.post('/gcode', (request, response) => {
  request.socket.setTimeout(1200000); // 20 min
  let fileType;
  // only support png and jpeg
  switch (request.body.type) {
    case 'image/jpeg':
      fileType = '.jpeg';
      break;
    case 'image/png':
      fileType = '.png';
      break;
    default:
      response.status(400).send('Unrecognized file type');
      return;
  }

  // validate options
  const requestOptions = request.body.options;
  const responseOptions = {};
  let optionsError = false;

  if (!requestOptions.hasOwnProperty('toolDiameter')) {
    response.status(400).send('Tool Diameter is necessary');
    return;
  }

  const toolDiameter = parseInt(Number(requestOptions.toolDiameter));
  let feed = null;
  let retract = null;
  let height = null;
  let width = null;

  if (requestOptions.hasOwnProperty('feed')) {
    feed = parseInt(Number(requestOptions.feed));
  }

  if (requestOptions.hasOwnProperty('retract')) {
    retract = parseInt(Number(requestOptions.retract));
  }

  if (requestOptions.hasOwnProperty('height')) {
    height = parseInt(Number(requestOptions.height));
  }

  if (requestOptions.hasOwnProperty('width')) {
    width = parseInt(Number(requestOptions.width));
  }

  // Mandatory
  if (toolDiameter !== NaN && toolDiameter > 0 && toolDiameter <= 8) {
    responseOptions.toolDiameter = toolDiameter;
  } else {
    optionsError = true;
  }

  // Not mandatory
  if (feed !== null && feed !== NaN && feed > 0 && feed <= 100) {
    responseOptions.feed = feed;
  } else if (feed !== null) {
    optionsError = true;
  }

  if (retract !== null && retract != NaN && retract >= 0 && retract <= 100) {
    responseOptions.retract = retract;
  } else if (retract !== null) {
    optionsError = true;
  }

  if (width !== null && width != NaN && width >= 0 && width <= 2000) {
    responseOptions.width = width;
  } else if (width !== null) {
    optionsError = true;
  }
  if (height !== null && height != NaN && height >= 0 && height <= 2000) {
    responseOptions.height = height;
  } else if (height !== null) {
    optionsError = true;
  }

  if (optionsError) {
    res.status(400).send('Incorrect options supplied');
    return;
  }

  const filePath = require('path').resolve(`./temp/${Date.now()}${fileType}`);
  fs.writeFile(filePath, request.body.data, 'binary', async (err) => {
    if (err) {
      response.status(400).send(`error: ${err}`);
    } else {
      const gcodeGenerator = require('file:///C:/Users/Tarun/Documents/tarun/AM477/codepen_pqKWpP/image2gcode-master/image2gcode-master/src/gcodegenerator');
      console.log(responseOptions);
      const gcode = await gcodeGenerator
          .generateGCode(filePath, responseOptions);
      response.send(gcode);
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
