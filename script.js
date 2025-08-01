var layerCount = 4;
var starCount = 500;
var maxTime = 31;
var universe = document.getElementById('universe');
var w = window;
var d = document;
var e = d.documentElement;
var g = d.getElementsByTagName('body')[0];
var width = w.innerWidth || e.clientWidth || g.clientWidth;
var height = w.innerHeight || e.clientHeight || g.clientHeight;
var topBandHeight = height * 0.10;

for (var i = 0; i < starCount; ++i) {
  var xpos = Math.round(Math.random() * width);
  var ypos = Math.round(Math.random() * topBandHeight);

  var star = document.createElement('div');
  var speed = 1000 * (Math.random() * maxTime + 1);

  star.setAttribute('class', 'star' + (3 - Math.floor((speed / 1000) / 8)));
  star.style.backgroundColor = 'white';

  universe.appendChild(star);

  star.animate(
    [
      { transform: 'translate3d(' + xpos + 'px, ' + ypos + 'px, 0)' },
      { transform: 'translate3d(-' + (Math.random() * 256 + (star.offsetWidth || 0)) + 'px, ' + ypos + 'px, 0)' }
    ],
    {
      delay: Math.random() * -speed,
      duration: speed,
      iterations: 1000
    }
  );
}

//Ripple Effect Code 
var waves = [];
var duration = 450;

function Wave(x, y) {
  waves.push(this);
  this.element = document.createElement('div');
  this.element.className = 'ripple-wave';
  this.element.style.left = 'calc(' + x + 'px - 150px)';
  this.element.style.top = 'calc(' + y + 'px - 150px)';
  this.element.setAttribute('touch-action', 'none');
  this.element.addEventListener('up', up);
  var hue = Math.random() * 360;
  this.element.style.backgroundColor = 'hsl(' + hue + ', 85%, 67%)';

  document.body.appendChild(this.element);

  this.scale = this.element.animate(
    [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
    {
      duration: duration,
      easing: 'cubic-bezier(.22,.67,.52,.92)',
      fill: 'forwards',
    }
  );
}

Wave.prototype = {
  up: function () {
    this.up = function () {};
    this.opacity = this.element.animate(
      [{ opacity: 0.66 }, { opacity: 0 }],
      {
        duration: duration,
        fill: 'forwards',
      }
    );
    this.opacity.onfinish = function () {
      this.element.remove();
      waves.splice(waves.indexOf(this), 1);
    }.bind(this);
  },
};


document.body.addEventListener('down', function (e) {
  waves.forEach(function (wave) {
    wave.up();
  });
  new Wave(e.clientX, e.clientY);
});

function up() {
  waves.forEach(function (wave) {
    wave.up();
  });
}

document.body.addEventListener('up', up);
