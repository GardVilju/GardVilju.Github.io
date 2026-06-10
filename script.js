
var layerCount = 4;
var starCount = 500;
var maxTime = 31;
var universe = document.getElementById('universe');

// Get window dimensions reliably
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

// Login modal functionality
var responsiveImage = document.querySelector('.responsive-image');
var loginModal = document.querySelector('.login-modal');
var closeBtn = document.querySelector('.close-btn');

if (responsiveImage) {
  responsiveImage.addEventListener('click', function() {
    loginModal.classList.add('active');
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', function() {
    loginModal.classList.remove('active');
  });
}

// Close modal when clicking outside the login container
loginModal.addEventListener('click', function(e) {
  if (e.target === loginModal) {
    loginModal.classList.remove('active');
  }
});
