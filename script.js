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

// Create the stars and fix their positioning
for (var i = 0; i < starCount; ++i) {
  var xpos = Math.round(Math.random() * width);
  // FIX: Using full height instead of just a top band
  var ypos = Math.round(Math.random() * height); 
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

// Interactive Orb & Password Logic
var orbBtn = document.getElementById('orb-button');
var modal = document.getElementById('password-modal');
var submitBtn = document.getElementById('submit-password');
var errorMsg = document.getElementById('error-message');

// Show modal when Orb is clicked
orbBtn.addEventListener('click', function() {
    modal.style.display = 'flex';
});

// Check password when submitted
submitBtn.addEventListener('click', function() {
    var pwd = document.getElementById('app-password').value;
    
    // Change "admin123" to whatever password you want to use
    if (pwd === 'admin123') { 
        // Correct Password: Go to your App Builder Interface
        // You can change the URL below to wherever your dashboard page is located.
        window.location.href = 'app-builder.html'; 
    } else {
        // Incorrect Password
        errorMsg.style.display = 'block';
    }
});

// Close modal if user clicks outside of the box
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
        errorMsg.style.display = 'none'; // reset error
        document.getElementById('app-password').value = ''; // clear input
    }
};
