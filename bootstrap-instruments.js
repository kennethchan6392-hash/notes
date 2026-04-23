(function () {
  var el = document.querySelector("script[data-app-bootstrap]");
  var base = el && el.src ? new URL(".", el.src) : new URL("./", location.href);
  function loadApp() {
    var s = document.createElement("script");
    s.src = new URL("script.js", base).href;
    s.defer = true;
    document.body.appendChild(s);
  }
  Promise.all([
    fetch(new URL("data/instrument-bank.json", base)),
    fetch(new URL("data/instrument-structure.json", base)),
  ])
    .then(function (rs) {
      return Promise.all(
        rs.map(function (r) {
          if (!r.ok) throw new Error(r.status + " " + r.statusText);
          return r.json();
        })
      );
    })
    .then(function (data) {
      window.__INSTRUMENT_BANK__ = data[0];
      window.__INSTRUMENT_STRUCTURE__ = data[1];
      loadApp();
    })
    .catch(function (e) {
      console.error("[bootstrap-instruments]", e);
      window.__INSTRUMENT_BANK__ = [];
      window.__INSTRUMENT_STRUCTURE__ = {};
      loadApp();
    });
})();
