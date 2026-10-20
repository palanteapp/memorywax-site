/* The app's dotted gradient, drawn once for the whole length of the page so it runs top to bottom with no seams or edges.
   Same idea as halftone() in the app: dots shrink smoothly until they disappear. Large near the top and the bottom, a quiet scatter in between,
   smaller toward the middle of the page where the text sits. Without JavaScript the page keeps its plain red gradient. */
(function () {
  var cv = document.createElement('canvas'), ro, tid, last = '';
  cv.id = 'dots'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);

  var ease = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  function draw() {
    var W = document.documentElement.clientWidth, H = Math.round(Math.max(document.body.getBoundingClientRect().height, window.innerHeight));   // the page's own height, not the canvas's
    var key = W + 'x' + H; if (key === last) return; last = key;
    // Keep the canvas under ~12 million pixels so long pages stay light on phones.
    var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(12e6 / (W * H)));
    cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);

    var step = W < 600 ? 13 : 16, reach = Math.min(1000, H * .45), floor = .28;
    x.fillStyle = 'rgba(176,52,50,.5)'; x.beginPath();
    for (var r = 0, y = 0; y <= H; r++, y = r * step / 2) {
      var v = Math.max(floor, ease(1 - y / reach), ease(1 - (H - y) / reach));          // strong at both ends, quiet between
      for (var px = (r % 2) * step / 2 - step; px <= W + step; px += step) {                     // one extra column past each side, so no gap shows at the screen edge
        var edge = Math.min(1, Math.abs(2 * px / W - 1));                                               // 0 in the middle, 1 at the sides
        var f = v * (.5 + .5 * Math.pow(edge, 1.1));
        var rad = Math.pow(f, 1.15) * step * .62;
        if (rad >= .6) { x.moveTo(px + rad, y); x.arc(px, y, rad, 0, 6.2832); }
      }
    }
    x.fill();
  }

  function later() { clearTimeout(tid); tid = setTimeout(draw, 120); }
  draw();
  window.addEventListener('resize', later);
  window.addEventListener('load', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);          // fonts change the page height
  if (window.ResizeObserver) { ro = new ResizeObserver(later); ro.observe(document.body); }
})();
