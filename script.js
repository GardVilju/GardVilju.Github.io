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

if (universe) {
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
}

// hashing helper
async function hashValue(value) {
  var data = new TextEncoder().encode(value);
  var hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('');
}

function getStoredPattern() {
  return localStorage.getItem('localPatternHash');
}

function saveStoredPattern(hash) {
  localStorage.setItem('localPatternHash', hash);
}

function showLoginMessage(text, success) {
  var message = document.getElementById('loginMessage');
  if (!message) return;
  message.textContent = text;
  message.style.color = success ? '#8ef7d9' : '#ff8aa3';
}

document.addEventListener('DOMContentLoaded', function () {
  var responsiveImage = document.querySelector('.responsive-image');
  var loginModal = document.querySelector('.login-modal');
  var closeBtn = document.querySelector('.close-btn');
  var patternLock = document.getElementById('patternLock');
  var patternCanvas = document.getElementById('patternCanvas');
  var patternInstructions = document.getElementById('patternInstructions');
  var patternDots = patternLock ? Array.from(patternLock.querySelectorAll('.pattern-dot')) : [];
  var currentPattern = [];
  var isDrawing = false;
  var currentPointer = null;
  var patternCtx = patternCanvas ? patternCanvas.getContext('2d') : null;

  function resizePatternCanvas() {
    if (!patternCanvas || !patternLock || !patternCtx) return;
    var rect = patternLock.getBoundingClientRect();
    var dpi = window.devicePixelRatio || 1;
    patternCanvas.width = rect.width * dpi;
    patternCanvas.height = rect.height * dpi;
    patternCanvas.style.width = rect.width + 'px';
    patternCanvas.style.height = rect.height + 'px';
    patternCtx.setTransform(dpi, 0, 0, dpi, 0, 0);
    drawPatternLines(currentPointer);
  }

  function getDotCenter(dot) {
    var rect = dot.getBoundingClientRect();
    var parentRect = patternLock.getBoundingClientRect();
    return {
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top + rect.height / 2
    };
  }

  function drawPatternLines(pointer) {
    if (!patternCtx) return;
    patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
    if (!currentPattern.length) return;

    patternCtx.save();
    patternCtx.strokeStyle = 'rgba(38,247,216,0.92)';
    patternCtx.lineWidth = 7;
    patternCtx.lineCap = 'round';
    patternCtx.lineJoin = 'round';
    patternCtx.shadowColor = 'rgba(38,247,216,0.24)';
    patternCtx.shadowBlur = 18;
    patternCtx.beginPath();

    currentPattern.forEach(function(index, i) {
      var center = getDotCenter(patternDots[index]);
      if (i === 0) {
        patternCtx.moveTo(center.x, center.y);
      } else {
        patternCtx.lineTo(center.x, center.y);
      }
    });

    if (pointer) {
      patternCtx.lineTo(pointer.x, pointer.y);
    }

    patternCtx.stroke();
    patternCtx.restore();
  }

  function getDotFromPointer(e) {
    var element = document.elementFromPoint(e.clientX, e.clientY);
    return element ? element.closest('.pattern-dot') : null;
  }

  function updatePointer(e) {
    if (!patternLock) return;
    var rect = patternLock.getBoundingClientRect();
    currentPointer = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    drawPatternLines(currentPointer);

    var dot = getDotFromPointer(e);
    if (dot) addDotToPattern(dot);
  }

  function addDotToPattern(dot) {
    if (!dot) return;
    var index = dot.dataset.index ? Number(dot.dataset.index) : null;
    if (index === null || currentPattern.includes(index)) return;
    currentPattern.push(index);
    dot.classList.add('active');
    drawPatternLines(currentPointer);
  }

  function resetPatternVisual(patternDots) {
    patternDots.forEach(function(dot) {
      dot.classList.remove('active');
    });
    currentPointer = null;
    if (patternCtx) {
      patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
    }
  }

  function updateInstructions() {
    var storedPattern = getStoredPattern();
    if (patternInstructions) {
      patternInstructions.textContent = storedPattern
        ? 'Draw your unlock pattern to sign in.'
        : 'Draw a new pattern to register it locally.';
    }
  }

  function openModal() {
    if (!loginModal) return;
    loginModal.classList.add('active');
    loginModal.setAttribute('aria-hidden', 'false');
    updateInstructions();
    showLoginMessage('Start by drawing your pattern.', true);
  }

  function closeModal() {
    if (!loginModal) return;
    loginModal.classList.remove('active');
    loginModal.setAttribute('aria-hidden', 'true');
    currentPattern = [];
    resetPatternVisual(patternDots);
  }

  function finishPattern() {
    if (!currentPattern.length) return;
    var patternString = currentPattern.join('-');
    currentPattern = [];

    hashValue(patternString).then(function(hashed) {
      var stored = getStoredPattern();
      if (!stored) {
        saveStoredPattern(hashed);
        showLoginMessage('Pattern saved locally. Use it next time to unlock.', true);
        if (patternInstructions) {
          patternInstructions.textContent = 'Pattern registered. Close and reopen to test.';
        }
      } else if (stored === hashed) {
        showLoginMessage('Pattern accepted. Login successful.', true);
        setTimeout(closeModal, 600);
      } else {
        showLoginMessage('Pattern incorrect. Try again.', false);
      }

      setTimeout(function() {
        resetPatternVisual(patternDots);
      }, 150);
    });
  }

  if (responsiveImage) {
    responsiveImage.addEventListener('click', openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (loginModal) {
    loginModal.addEventListener('click', function (e) {
      if (e.target === loginModal) closeModal();
    });
  }

  if (patternLock) {
    resizePatternCanvas();
    window.addEventListener('resize', resizePatternCanvas);

    patternLock.addEventListener('pointerdown', function (e) {
      isDrawing = true;
      var dot = getDotFromPointer(e);
      if (dot) addDotToPattern(dot);
      updatePointer(e);
      patternLock.setPointerCapture && patternLock.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    patternLock.addEventListener('pointermove', function (e) {
      if (!isDrawing) return;
      updatePointer(e);
    });

    document.addEventListener('pointerup', function () {
      if (!isDrawing) return;
      isDrawing = false;
      finishPattern();
    });

    patternLock.addEventListener('pointerleave', function () {
      if (!isDrawing) return;
      isDrawing = false;
      finishPattern();
    });
  }
});

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
