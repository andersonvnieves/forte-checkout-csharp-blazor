(function () {
  const loadedScripts = {};

  window.fco = {
    ensureScript: function (src) {
      if (!src || loadedScripts[src]) return;
      loadedScripts[src] = true;
      try {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        document.body.appendChild(s);
      } catch (e) {
        delete loadedScripts[src];
        console.error('Failed to load FCO script', e);
      }
    },

    /**
     * Wait until Forte Checkout JS has loaded. Call this before registerCallback / setButtonKey so the script
     * can bind the Pay button and modal/embedded UI (ensureScript alone is fire-and-forget async).
     */
    ensureScriptLoaded: function (src) {
      return new Promise(function (resolve, reject) {
        if (!src) {
          resolve();
          return;
        }

        function findForteScriptElement(wantedSrc) {
          var scripts = document.getElementsByTagName('script');
          for (var i = 0; i < scripts.length; i++) {
            var el = scripts[i];
            if (!el.src) continue;
            if (el.src === wantedSrc) return el;
            try {
              if (new URL(el.src).pathname === new URL(wantedSrc).pathname) return el;
            } catch (e) {}
          }
          return null;
        }

        function whenLoaded(el) {
          if (el) el.setAttribute('data-forte-loaded', '1');
          resolve();
        }

        function resourceAlreadyFinished(url) {
          try {
            var entries = performance.getEntriesByName(url, 'resource');
            return entries.length > 0 && entries[0].responseEnd > 0;
          } catch (e) {
            return false;
          }
        }

        var existing = findForteScriptElement(src);
        if (existing && existing.getAttribute('data-forte-loaded') === '1') {
          resolve();
          return;
        }

        function subscribe(el) {
          var settled = false;
          function finish() {
            if (settled) return;
            settled = true;
            whenLoaded(el);
          }
          el.addEventListener('load', finish, { once: true });
          el.addEventListener(
            'error',
            function () {
              if (settled) return;
              settled = true;
              reject(new Error('Forte script failed to load'));
            },
            { once: true }
          );
        }

        if (existing) {
          if (resourceAlreadyFinished(existing.src || src)) {
            whenLoaded(existing);
            return;
          }
          subscribe(existing);
          return;
        }

        if (loadedScripts[src]) {
          var n = 0;
          var poll = setInterval(function () {
            var el = findForteScriptElement(src);
            if (el) {
              clearInterval(poll);
              if (el.getAttribute('data-forte-loaded') === '1') resolve();
              else subscribe(el);
            } else if (++n > 150) {
              clearInterval(poll);
              resolve();
            }
          }, 20);
          return;
        }

        loadedScripts[src] = true;
        try {
          var s = document.createElement('script');
          s.src = src;
          s.async = true;
          subscribe(s);
          document.body.appendChild(s);
        } catch (e) {
          delete loadedScripts[src];
          reject(e);
        }
      });
    },

    fetchUtc: async function () {
      var r = await fetch('/api/utc');
      var txt = await r.text();
      var m = txt.match(/\((\d+)\)/);
      return m ? m[1] : '';
    },

    hmacSha256: async function (message, key) {
      var enc = new TextEncoder();
      var cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      var sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
      var bytes = new Uint8Array(sig);
      return Array.from(bytes, function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    },

    setButtonKey: function (element, key) {
      if (element && key) element.setAttribute('key', key);
    },

    /** Click-demo: Forte may consume the click before Blazor Server receives it — hide placeholder like fco-react-demo (native listener + optional sync). */
    registerPayClickPlaceholder: function (element, dotNetHelper) {
      if (!element || !dotNetHelper) return;
      element.addEventListener(
        'click',
        function () {
          var ph = document.getElementById('loading-placeholder');
          if (ph) ph.style.display = 'none';
          dotNetHelper.invokeMethodAsync('OnPayButtonClicked').catch(function (e) {
            console.error('OnPayButtonClicked failed', e);
          });
        },
        true
      );
    },

    clickElement: function (id) {
      var el = document.getElementById(id);
      if (el) el.click();
    },

    /** Subset of Forte callback JSON shown on /success and /error (matches forte-checkout-angular). */
    stashCallbackPayloadForResultPage: function (payload) {
      if (!payload) return;
      var stash = {
        event: payload.event,
        request_id: payload.request_id,
        response_code: payload.response_code,
        response_description: payload.response_description
      };
      try {
        sessionStorage.setItem('fco_callback_payload', JSON.stringify(stash));
      } catch (e) {}
    },

    /** Read and clear stashed callback payload (one-shot, like Angular FcoCallbackNavigationService.takeStashed). */
    takeCallbackPayload: function () {
      try {
        var raw = sessionStorage.getItem('fco_callback_payload');
        sessionStorage.removeItem('fco_callback_payload');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    registerCallback: function () {
      window.fcoCallback = function (response) {
        var data = response && response.data;
        var payload = null;
        if (data == null) payload = null;
        else if (typeof data === 'object') payload = data;
        else if (typeof data === 'string') {
          try {
            payload = JSON.parse(data);
          } catch (e) {
            payload = null;
          }
        }
        if (!payload) return;
        if (payload.event === 'success') {
          window.fco.stashCallbackPayloadForResultPage(payload);
          window.location.href = '/success';
        }
        if (payload.event === 'failure') {
          window.fco.stashCallbackPayloadForResultPage(payload);
          window.location.href = '/error';
        }
      };
    }
  };
})();
