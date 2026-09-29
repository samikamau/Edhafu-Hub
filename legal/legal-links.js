/* =====================================================================
   EDHAFU LEGAL LINKS AND TICK BOXES
   Load on any page:  <script src="/legal/legal-links.js" defer></script>

   1. FOOTER LINKS: added automatically at the bottom of every page.
      To place them somewhere specific, add an empty element:
        <div data-legal-footer></div>
      To switch them off on a page:  <div data-legal-footer="off"></div>

   2. TICK BOXES: add ONE attribute to the button that submits the form:
        data-legal="account"   create account / start free trial / sign up
        data-legal="pay"       Pay Subscription button
        data-legal="privacy"   demo request, contact or enquiry forms
      A required tick box appears above the button. The button does
      nothing until the box is ticked.
   ===================================================================== */
(function () {
  const BASE = 'https://edhafu.com/legal/';
  const L = {
    terms:   '<a href="' + BASE + 'terms/" target="_blank" rel="noopener">Terms of Service</a>',
    privacy: '<a href="' + BASE + 'privacy/" target="_blank" rel="noopener">Privacy Policy</a>',
    dpa:     '<a href="' + BASE + 'dpa/" target="_blank" rel="noopener">Data Processing Agreement</a>',
    billing: '<a href="' + BASE + 'billing/" target="_blank" rel="noopener">Billing and Refund Policy</a>',
    aup:     '<a href="' + BASE + 'aup/" target="_blank" rel="noopener">Acceptable Use Policy</a>'
  };
  const TEXT = {
    account: 'I agree to the ' + L.terms + ', ' + L.privacy + ', ' + L.dpa + ', ' + L.billing + ' and ' + L.aup + '.',
    pay:     'I agree to the ' + L.billing + ' and understand that subscription fees are non-refundable once a period starts, except as the policy states.',
    privacy: 'I agree that Edhafu may use my details to respond to this request, as described in the ' + L.privacy + '.'
  };
  const MSG = 'Please tick the box to continue.';

  function css() {
    if (document.getElementById('edhafu-legal-css')) return;
    const s = document.createElement('style');
    s.id = 'edhafu-legal-css';
    s.textContent =
      '.edl-tick{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:13px;line-height:1.5;text-align:left;cursor:pointer}' +
      '.edl-tick input{width:17px;height:17px;margin-top:2px;flex:none;accent-color:#0F2452;cursor:pointer}' +
      '.edl-tick a{color:#0F2452;font-weight:600;text-decoration:underline}' +
      '.edl-msg{color:#CF1B30;font-size:12.5px;margin:-6px 0 10px;display:none;text-align:left}' +
      '.edl-blocked{opacity:.55;cursor:not-allowed !important}' +
      '.edl-footer{font-size:12.5px;line-height:1.6;color:#6b7385;text-align:center;padding:18px 12px 24px}' +
      '.edl-footer a{color:inherit;text-decoration:underline;margin:0 8px;white-space:nowrap}';
    document.head.appendChild(s);
  }

  function addTick(btn) {
    if (btn.dataset.edlReady) return;
    btn.dataset.edlReady = '1';
    const kind = btn.getAttribute('data-legal');
    if (!TEXT[kind]) return;
    const id = 'edl-' + Math.random().toString(36).slice(2, 8);
    const label = document.createElement('label');
    label.className = 'edl-tick';
    label.innerHTML = '<input type="checkbox" id="' + id + '"><span>' + TEXT[kind] + '</span>';
    const msg = document.createElement('p');
    msg.className = 'edl-msg';
    msg.textContent = MSG;
    btn.parentNode.insertBefore(label, btn);
    btn.parentNode.insertBefore(msg, btn);
    btn.dataset.edlBox = id;
    btn.classList.add('edl-blocked');
    const box = label.querySelector('input');
    box.addEventListener('change', function () {
      btn.classList.toggle('edl-blocked', !box.checked);
      if (box.checked) msg.style.display = 'none';
    });
  }

  function ticked(btn) {
    const box = document.getElementById(btn.dataset.edlBox || '');
    return !box || box.checked;
  }

  function block(e, btn) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const box = document.getElementById(btn.dataset.edlBox);
    const msg = box && box.closest('.edl-tick').nextElementSibling;
    if (msg) msg.style.display = 'block';
    if (box) box.focus();
  }

  // Runs before the page's own click handlers, so unticked clicks never reach them.
  document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('[data-legal]');
    if (btn && !ticked(btn)) block(e, btn);
  }, true);

  // Stops Enter-key form submission too.
  document.addEventListener('submit', function (e) {
    const btn = e.target.querySelector && e.target.querySelector('[data-legal]');
    if (btn && !ticked(btn)) block(e, btn);
  }, true);

  function footer() {
    const slot = document.querySelector('[data-legal-footer]');
    if (slot && slot.getAttribute('data-legal-footer') === 'off') return;
    if (document.querySelector('.edl-footer')) return;
    const f = document.createElement('div');
    f.className = 'edl-footer';
    f.innerHTML =
      '<a href="' + BASE + 'terms/" target="_blank" rel="noopener">Terms of Service</a>' +
      '<a href="' + BASE + 'privacy/" target="_blank" rel="noopener">Privacy Policy</a>' +
      '<a href="' + BASE + '" target="_blank" rel="noopener">All legal documents</a>';
    if (slot) slot.appendChild(f);
    else (document.querySelector('main') || document.body).appendChild(f);
  }

  function scan() { document.querySelectorAll('[data-legal]').forEach(addTick); }

  function start() {
    css();
    footer();
    scan();
    // Buttons drawn later (popups, single-page screens) get their tick box too.
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
