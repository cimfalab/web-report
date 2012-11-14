/**
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.URL = window.URL ? window.URL :
             window.webkitURL ? window.webkitURL : null;

window.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame;

/*******************************************************************************
 * PREFLIGHT
 ******************************************************************************/
function hide(id) {
  util.query('#' + id)[0].classList.add('hidden');
}
function unhide(id) {
  util.query('#' + id)[0].classList.remove('hidden');
};
function checkWebGL() {
  try {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('experimental-webgl');
    if (context) {
      unhide('feature-webgl');
      return;
    }
  } catch(e) {}
  unhide('feature-no-webgl');
};
function checkBrowser() {
  if (util.isWK) {
    unhide('browser-webkit');
  } else if (util.isFF) {
    unhide('browser-mozilla');
  } else {
    unhide('browser-other');
  }
};
function checkFileAPIs() {
  if (!!window.File && !!window.FileList && !!window.FileReader) {
    unhide('feature-file');
  } else {
    unhide('feature-no-file');
  }
};
function checkFileSystem() {
  if (window.requestFileSystem) {
    // Attempt to create a folder to test if we can.
    window.requestFileSystem(TEMPORARY, 512, function(fs) {
      fs.root.getDirectory('slidestestquotaforfsfolder', {create: true}, function(dirEntry) {
       dirEntry.remove(); // If successfully created, just delete it.
       unhide('feature-filesystem');
     }, function(e) {
       if (e.code == FileError.QUOTA_EXCEEDED_ERR) {
         unhide('feature-filesystem-quota');
       }
     });
   });
  } else {
    unhide('feature-no-filesystem');
  }
};
function checkWebAudioAPI() {
  if (!!(window.AudioContext || window.webkitAudioContext)) {
    unhide('feature-web-audio');
  } else {
    unhide('feature-no-web-audio');
  }
};
var preflightRun = false;
function runPreflight(e) {
  if (!preflightRun) {
    preflightRun = true;
    checkBrowser();
    checkFileAPIs();
    checkFileSystem();
    checkWebGL();
    checkWebAudioAPI();
  }
};
document.addEventListener('DOMContentLoaded', runPreflight, false);
window.addEventListener('load', runPreflight, false);

/*******************************************************************************
 * SVG DOM
 ******************************************************************************/
(function() {
  var slide = document.getElementById('slide-svg');
  var input = slide.querySelector('input');
  input.addEventListener('input', function(evt) {
    var svgText = slide.querySelector('svg > text > * > tspan');
    svgText.textContent = this.value;
  }, true);
})();

/*******************************************************************************
 * GRAPHICS: LOTS OF CSS
 ******************************************************************************/
(function() {
  var slide = document.getElementById('slide-cssprops');
  var interval = null;
  function moveTransition() {
    var max = slide.getBoundingClientRect().width;
    var left = Math.round(Math.random() * max) * 0.8 + 0.1 * max;
    slide.querySelector('.demo-transition').style.left = left + 'px';
  };
  slide.addEventListener('slideIn', function() {
    if (!interval) {
      moveTransition();
      interval = window.setInterval(moveTransition, 3000);
    }
  }, false);
  slide.addEventListener('slideOut', function() {
    window.clearInterval(interval);
    interval = null;
  }, false);
})();

/*******************************************************************************
 * TWEENS
 ******************************************************************************/
window.addEventListener('load', function() {
  var slide = document.getElementById('slide-tween');
  var handler = new TweenSlide(400, 300, slide);
  handler.setBezier(0.9, 0.1, 0.1, 0.9);
}, false);

/*******************************************************************************
 * TWEENING
 ******************************************************************************/
function TweenSlide(w, h, slide) {
  this.domSlide = slide;
  this.domPre = slide.querySelector('pre');
  this.domCanvas = slide.querySelector('canvas');
  this.domLogo = slide.querySelector('.logo');
  this.domButton = slide.querySelector('button');
  this.domSelect = slide.querySelector('select');

  this.duration = 3; // Seconds
  this.elapsed = 0;
  this.started = 0;
  this.padding = 8.5;
  this.domCanvas.width = w;
  this.domCanvas.height = h;

  this.domCanvas.addEventListener('mousedown', this.onMouseDown.bind(this), 
      false);
  this.domCanvas.addEventListener('selectstart', this.onSelectStart, false);
  this.domSlide.addEventListener('mouseup', this.onMouseUp.bind(this), false);
  this.domButton.addEventListener('click', this.onClick.bind(this), false);
  this.domSelect.addEventListener('change', this.onSelect.bind(this), false);

  this.dragging = 0;
  this.moveListener = this.onMouseMove.bind(this);
  this.w = this.domCanvas.width - (2 * this.padding);
  this.h = this.domCanvas.height - (2 * this.padding);
};

TweenSlide.prototype.onSelect = function(evt) {
  switch (evt.target.value) {
    case 'linear':
      this.setBezier(0.0, 0.0, 1, 1);
      break;
    case 'default':
      this.setBezier(0.25, 0.1, 0.25, 1);
      break;
    case 'ease-in':
      this.setBezier(0.42, 0, 1, 1);
      break;
    case 'ease-out':
      this.setBezier(0, 0, 0.58, 1);
      break;
    case 'ease-in-out':
      this.setBezier(0.42, 0, 0.58, 1);
      break;
  }
};

TweenSlide.prototype.stopAnimation = function() {
  this.started = 0;
  this.elapsed = 0;
  this.domLogo.style.webkitAnimation = '';
  this.domLogo.style.MozAnimation = '';
};

TweenSlide.prototype.onClick = function(evt) {
  this.stopAnimation();
  var self = this;
  window.setTimeout(function() {
    var animation = [
      'chromelogo-spin ', self.duration, 's 1 cubic-bezier(',
      self.x1, ', ', self.y1, ', ', self.x2, ', ', self.y2, ')'
    ].join('');
    self.domLogo.style.webkitAnimation = animation;
    self.domLogo.style.MozAnimation = animation;
    self.started = new Date().getTime();
    self.animate();
  }, 0);
};

TweenSlide.prototype.onSelectStart = function(evt) {
  evt.preventDefault();
};

TweenSlide.prototype.onMouseMove = function(evt) {
  var x = (evt.offsetX - this.padding) / this.w;
  var y = (this.h - evt.offsetY + this.padding) / this.h;
  this.domSelect.selectedIndex = 0; // Cubic bezier
  if (this.dragging == 1) {
    this.setBezier(x, y, this.x2, this.y2);
  } else {
    this.setBezier(this.x1, this.y1, x, y);
  }
};

TweenSlide.prototype.onMouseDown = function(evt) {
  var x = evt.offsetX;
  var y = evt.offsetY;

  if (x >= this.mx1 - this.padding &&
      x <= this.mx1 + this.padding &&
      y >= this.my1 - this.padding &&
      y <= this.my1 + this.padding) {
    this.dragging = 1;
  }
  if (x >= this.mx2 - this.padding &&
      x <= this.mx2 + this.padding &&
      y >= this.my2 - this.padding &&
      y <= this.my2 + this.padding) {
    this.dragging = 2;
  }
  if (this.dragging > 0) {
    this.domCanvas.addEventListener('mousemove', this.moveListener, false);
  }
};

TweenSlide.prototype.onMouseUp = function(evt) {
  this.dragging = 0;
  this.domCanvas.removeEventListener('mousemove', this.moveListener, false);
};

TweenSlide.prototype.clamp = function(val) {
  return Math.round(100.0 * Math.min(1.0, Math.max(0.0, val))) / 100.0;
};

TweenSlide.prototype.clear = function(ctx) {
  ctx.clearRect(0, 0, this.domCanvas.width, this.domCanvas.height);
  ctx.beginPath()
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.strokeRect(this.padding, this.padding, this.w, this.h);
  ctx.closePath();
};

TweenSlide.prototype.setBezier = function(x1, y1, x2, y2) {
  this.stopAnimation();
  this.x1 = this.clamp(x1);
  this.x2 = this.clamp(x2);
  this.y1 = this.clamp(y1);
  this.y2 = this.clamp(y2);

  this.domValues = this.domPre.querySelectorAll('.val');
  this.domValues[0].textContent = this.x1;
  this.domValues[1].textContent = this.y1;
  this.domValues[2].textContent = this.x2;
  this.domValues[3].textContent = this.y2;

  this.mx1 = this.x1 * this.w + this.padding;
  this.my1 = (1 - this.y1) * this.h + this.padding;
  this.mx2 = this.x2 * this.w + this.padding;
  this.my2 = (1 - this.y2) * this.h + this.padding;

  this.draw();
};

TweenSlide.prototype.animate = function() {
  this.elapsed = new Date().getTime() - this.started;
  if (this.elapsed < this.duration * 1000) {
    this.draw();
    window.requestAnimationFrame(this.animate.bind(this));
  } else {
    this.stopAnimation();
  }
};

TweenSlide.prototype.draw = function() {
  var ctx = this.domCanvas.getContext('2d');
  var boxD = this.padding * 2;
  var progress = this.elapsed / (this.duration * 1000);
  var progressX = progress * this.w + this.padding;

  this.clear(ctx);

  ctx.beginPath();
  ctx.moveTo(this.padding, this.h + this.padding);
  ctx.strokeStyle = '#36b';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.bezierCurveTo(this.mx1 + this.padding, this.my1 + this.padding,
                    this.mx2 + this.padding, this.my2 + this.padding,
                    this.w + this.padding, this.padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#0a0';
  ctx.fillStyle = '#0a0';
  ctx.lineWidth = 2;
  ctx.moveTo(this.padding, this.h + this.padding);
  ctx.lineTo(this.mx1, this.my1);
  ctx.moveTo(this.w + this.padding, this.padding);
  ctx.lineTo(this.mx2, this.my2);
  ctx.fillRect(this.mx1 - this.padding, this.my1 - this.padding, boxD, boxD);
  ctx.fillRect(this.mx2 - this.padding, this.my2 - this.padding, boxD, boxD);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#d00';
  ctx.lineWidth = 2;
  ctx.moveTo(progressX, 0);
  ctx.lineTo(progressX, this.domCanvas.height);
  ctx.stroke();
};


