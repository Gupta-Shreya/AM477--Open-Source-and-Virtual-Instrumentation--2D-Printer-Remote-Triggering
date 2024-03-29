
//*********************************************************************************
var gcx;

var redo_list = [];
var undo_list = [];


//******************************************************************************************
saveState = function(canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if(!keep_redo) {
        redo_list = [];
      }
      
      (list || this.undo_list).push(canvas.toDataURL());   
    };

undo = function(canvas, ctx) {
      restoreState(canvas, ctx, undo_list, redo_list);
    };
    
redo = function(canvas, ctx) {
      restoreState(canvas, ctx, redo_list, undo_list);
};

restoreState = function(canvas, ctx,  pop, push) {
      if(pop.length) {
        this.saveState(canvas, push, true);
        var restore_state = pop.pop();
        var img = new Image(restore_state);
        ctx.clearRect(0,0,400,400);
        ctx.drawImage(img, 0, 0, 400, 400);        
     }
};
//****************************************************************

function createPaint(parent) {
  "use strict";
  var canvas = elt('canvas', {width: 400, height: 400}); 
  //var canvasSVGContext = new CanvasSVG.Deferred();
  //canvasSVGContent.wrapCanvas(canvas);
  var cx = canvas.getContext('2d');
  gcx = canvas.getContext('2d');


  var toolbar = elt('div', {class: 'toolbar'});
  
  for (var name in controls)
    toolbar.appendChild(controls[name](cx));
  
  var panel = elt('div', {class: 'picturepanel'}, canvas);
  parent.appendChild(elt('div', null, panel, toolbar));
}


function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    
    
    if (typeof child == 'string')
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}


function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}


function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener('mousemove', onMove);
    removeEventListener('mouseup', end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener('mousemove', onMove);
  addEventListener('mouseup', end);
}


function loadImageURL(cx, url)  {
  var image = document.createElement('img');
  image.addEventListener('load', function() {
    var color = cx.fillStyle, size = cx.lineWidth;
    cx.canvas.width = image.width;
    cx.canvas.height = image.height;
    cx.drawImage(image, 0, 0);
    cx.fillStyle = color;
    cx.strokeStyle = color;
    cx.lineWidth = size;
  });
  image.src = url;
}

function randomPointInRadius(radius) {
  for (;;) {
    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    if (x * x + y * y <= 1)
      return {x: x * radius, y: y * radius};
  }
}

var controls = Object.create(null);

controls.tool = function(cx) {

  var select = elt('select');
  

  for (var name in tools)
    select.appendChild(elt('option', null, name));
  
  
  cx.canvas.addEventListener('mousedown', function(event) {
    
    
    if (event.which == 1) {
      
      tools[select.value](event, cx);
      
      event.preventDefault();
    }
  });
  
  return elt('span', null, 'Tool: ', select);
};




controls.color = function(cx) {

  var input = elt('input', {type: 'color'});
  
  
  input.addEventListener('change', function() {
    cx.fillStyle = input.value;
    cx.strokeStyle = input.value;
  });
  return elt('span', null, 'Color: ', input);
};





controls.brushSize = function(cx) {

  var select = elt('select');
  
  
  var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
  
  
  sizes.forEach(function(size) {
    select.appendChild(elt('option', {value: size}, size + ' pixels'));
  });
  
  
  select.addEventListener('change', function() {
    cx.lineWidth = select.value;
  });
  return elt('span', null, 'Brush size: ', select);
};


var link;
controls.save = function(cx) {
  
  link = elt('a', {href: '/', target: '_blank'}, 'Save');
  function update() {
    try {
      link.href = cx.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      link.download = "Plotter.png";
       //**************************************************************************************
        
       //***************************************************************************************


  
    } catch(e) {
      
      if (e instanceof SecurityError)
        link.href = 'javascript:alert(' + 
          JSON.stringify('Can\'t save: ' + e.toString()) + ')';
      else
        window.alert("Nope.");
        throw e;
    }
  }
  link.addEventListener('mouseover', update);
  link.addEventListener('focus', update);
  
  return link;
};


controls.openFile = function(cx) {

  var input = elt('input', {type: 'file'});
  input.addEventListener('change', function() {
    if (input.files.length == 0) return;
    var reader = new FileReader();
    reader.addEventListener('load', function() {
      loadImageURL(cx, reader.result);
    });
    reader.readAsDataURL(input.files[0]);
  });
  return elt('div', null, 'Open file: ', input);
};


controls.openURL = function(cx) {
  var input = elt('input', {type: 'text'});
  var form = elt('form', null, 'Open URL: ', input, 
                 elt('button', {type: 'submit'}, 'load'));
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    loadImageURL(cx, form.querySelector('input').value);
  });
  return form;
};

controls.Undo = function(cx) {
  var input = elt('input', {type: 'button'});
  
  
  input.addEventListener('click',function(){undo(cx.canvas,cx)} );
  return elt('span', null, 'Undo: ', input);
};

controls.Redo = function(cx) {
  var input = elt('input', {type: 'button'});
  
  
  input.addEventListener('click', function() {
    redo(cx.canvas,cx);
  });
  return elt('span', null, 'Redo: ', input);
};

 

controls.Conv = function(cx){

  var input = elt('input',{type: 'button'});

  input.addEventListener('click',function(){         
 
  window.open('./image2gcode-master/image2gcode-master/index1.html','Convert');});
  return elt('span', null, 'Convert: ',input);
};






var tools = Object.create(null);


tools.Line = function(event, cx, onEnd) {
  gcx.save();
  cx.lineCap = 'round';
  
  
  var pos = relativePos(event, cx.canvas);
  trackDrag(function(event) {
    cx.beginPath();
    
    
    cx.moveTo(pos.x, pos.y);
    
    
    pos = relativePos(event, cx.canvas);
    
    
    cx.lineTo(pos.x, pos.y);
    
    
    cx.stroke();
    saveState(cx.canvas);
    
  }, onEnd);
};


tools.Erase = function(event, cx) {
  gcx.save();
  
  cx.globalCompositeOperation = 'destination-out';
  tools.Line(event, cx, function() {
    cx.globalCompositeOperation = 'source-over';
    saveState(cx.canvas);
  });
};


tools.Text = function(event, cx) {
 gcx.save();
  var text = prompt('Text:', '');
  if (text) {
    var pos = relativePos(event, cx.canvas);
    
    cx.font = Math.max(7, cx.lineWidth) + 'px sans-serif';
    cx.fillText(text, pos.x, pos.y);
    saveState(cx.canvas);
    
  }
}




tools.Rectangle = function(event, cx) {
  gcx.save();
  var leftX, rightX, topY, bottomY;
  var clientX = event.clientX,
      clientY = event.clientY;

  var initialPos = relativePos(event, cx.canvas);
  
  
  var xOffset = clientX - initialPos.x,
      yOffset = clientY - initialPos.y;
  
  trackDrag(function(event) {
    
    
    var currentPos = relativePos(event, cx.canvas);
    var startX = initialPos.x,
        startY = initialPos.y;
		
    
    if (startX < currentPos.x) {
      leftX = startX;
      rightX = currentPos.x;
    } else {
      leftX = currentPos.x;
      rightX = startX;
    }

    if (startY < currentPos.y) {
      topY = startY;
      bottomY = currentPos.y;
    } else {
      topY = currentPos.y;
      bottomY = startY;
    }
  
  }, function() {
    
    
    cx.rect(leftX, topY, rightX - leftX, bottomY - topY);
    cx.stroke();
    saveState(cx.canvas);
  	
   
  });
};



tools.Cirle = function(event, cx) {
  gcx.save();
  var startX,startY,finalX,finalY,radius;
  startX = event.clientX;
  startY = event.clientY;
  

  var initialPos = relativePos(event, cx.canvas);
  
  
  var xOffset = startX - initialPos.x,
      yOffset = startY - initialPos.y;
  
  
  trackDrag(function(event) {
   
    
    var currentPos = relativePos(event, cx.canvas);
    var startX = initialPos.x,
        startY = initialPos.y; 

    finalX = currentPos.x;
    finalY = currentPos.y;

    
    radius = Math.sqrt(Math.pow(startX-finalX,2)+Math.pow(startY-finalY,2));



    }, function() {
    
    
    startX = startX - xOffset;
    startY = startY - yOffset;
    cx.beginPath();
    cx.arc(startX, startY, radius, 0, 2 * Math.PI, false);
    cx.stroke();
    saveState(cx.canvas);

  });


};

tools.Elipse = function(event, cx) {
  gcx.save();
  var startX,startY,finalX,finalY,radius;
  startX = event.clientX;
  startY = event.clientY;
  

  var initialPos = relativePos(event, cx.canvas);
  
  
  var xOffset = startX - initialPos.x,
      yOffset = startY - initialPos.y;
  
  
  trackDrag(function(event) {
   
    
    var currentPos = relativePos(event, cx.canvas);
    var startX = initialPos.x,
        startY = initialPos.y; 

    finalX = currentPos.x;
    finalY = currentPos.y;

    
    radius = Math.sqrt(Math.pow(startX-finalX,2)+Math.pow(startY-finalY,2));



    }, function() {
    
    
    startX = startX - xOffset;
    startY = startY - yOffset;
    cx.beginPath();
    cx.ellipse(Math.min(startX,finalX) + (Math.abs(finalX-startX)/2),Math.min(startY,finalY) + (Math.abs(finalY-startY)/2),Math.abs(finalX-startX),Math.abs(finalY-startY),0, 0, 2 * Math.PI);
    cx.stroke();
    saveState(cx.canvas);

  });
};



var appDiv = document.querySelector('#paint-app');
createPaint(appDiv);




//***********************************************************************************************************
/*!!
 *  Canvas 2 Svg v1.0.19
 *  A low level canvas to SVG converter. Uses a mock canvas context to build an SVG document.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Kerry Liu
 *
 *  Copyright (c) 2014 Gliffy Inc.
 */
