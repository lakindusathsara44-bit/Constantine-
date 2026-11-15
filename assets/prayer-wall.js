(() => {
  'use strict';

  const SUPABASE_URL = 'https://mukfnzyysofrvdyzldhk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_HG2I09heOflfm1eE3EIH2Q_fTySOcvF';
  const API = SUPABASE_URL + '/rest/v1';
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  const form = document.getElementById('prayer-form');
  const feed = document.getElementById('prayer-list');
  const status = document.getElementById('prayer-status');
  const search = document.getElementById('prayer-search');
  const filter = document.getElementById('prayer-filter');
  const refreshButton = document.getElementById('prayer-refresh');
  const message = document.getElementById('prayer-text');
  const charCount = document.getElementById('prayer-char-count');
  const submitButton = document.getElementById('prayer-submit');

  if (!form || !feed) return;

  let prayers = [];

  function visitorToken() {
    const key = 'constantine_prayer_visitor';
    try {
      let token = localStorage.getItem(key);
      if (!token) {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
          token = window.crypto.randomUUID();
        } else {
          const bytes = new Uint8Array(16);
          window.crypto.getRandomValues(bytes);
          token = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
          token = token.slice(0, 8) + '-' + token.slice(8, 12) + '-4' + token.slice(13, 16) + '-a' + token.slice(17, 20) + '-' + token.slice(20);
        }
        localStorage.setItem(key, token);
      }
      return token;
    } catch (_) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
        const random = Math.random() * 16 | 0;
        return (char === 'x' ? random : (random & 3 | 8)).toString(16);
      });
    }
  }

  function hasPrayed(id) {
    try { return localStorage.getItem('constantine_prayed_' + id) === 'yes'; }
    catch (_) { return false; }
  }

  function markPrayed(id) {
    try { localStorage.setItem('constantine_prayed_' + id, 'yes'); }
    catch (_) {}
  }

  function showStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle('show', Boolean(text) && !isError);
    status.classList.toggle('prayer-error', Boolean(isError));
    if (isError) status.style.display = 'block';
    else status.style.display = '';
  }

  function showFeedMessage(text, isError) {
    feed.innerHTML = '';
    const item = document.createElement('div');
    item.className = isError ? 'prayer-error' : 'prayer-empty';
    item.textContent = text;
    feed.appendChild(item);
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function render() {
    const term = (search.value || '').trim().toLowerCase();
    const category = filter.value;
    const visible = prayers.filter(prayer => {
      const matchesCategory = !category || prayer.category === category;
      const haystack = [prayer.prayer_text, prayer.display_name, prayer.country, prayer.category].join(' ').toLowerCase();
      return matchesCategory && (!term || haystack.includes(term));
    });

    feed.innerHTML = '';
    if (!visible.length) {
      showFeedMessage(prayers.length ? 'No prayer requests match your search.' : 'There are no prayer requests yet. You can be the first to share one.');
      return;
    }

    visible.forEach(prayer => {
      const card = document.createElement('article');
      card.className = 'prayer-card';
      const author = prayer.display_name && prayer.display_name.trim() ? prayer.display_name.trim() : 'Anonymous';
      const country = prayer.country && prayer.country.trim() ? ' · ' + prayer.country.trim() : '';
      const count = Number(prayer.prayer_count || 0);
      const prayed = hasPrayed(prayer.id);
      card.innerHTML =
        '<div class="prayer-card-top">' +
          '<div><div class="prayer-author">' + escapeHtml(author) + '</div>' +
          '<div class="prayer-meta">' + escapeHtml(country.replace(/^ · /, '')) + (country ? ' · ' : '') + escapeHtml(formatDate(prayer.created_at)) + '</div></div>' +
          '<span class="prayer-category">' + escapeHtml(prayer.category) + '</span>' +
        '</div>' +
        '<p class="prayer-message">' + escapeHtml(prayer.prayer_text) + '</p>' +
        '<div class="prayer-card-bottom">' +
          '<button class="prayed-button' + (prayed ? ' is-prayed' : '') + '" type="button" data-prayer-id="' + escapeHtml(prayer.id) + '"' + (prayed ? ' disabled' : '') + '>' +
            (prayed ? '✓ Prayed' : '🙏 I prayed') + ' <span aria-label="prayer count">· ' + count + '</span>' +
          '</button>' +
          '<span class="prayer-card-date">You are welcome to pray for this intention.</span>' +
        '</div>';
      feed.appendChild(card);
    });
  }

  async function loadPrayers() {
    showFeedMessage('Loading prayer requests…');
    try {
      const response = await fetch(API + '/rpc/get_prayer_wall', {
        method: 'POST',
        headers,
        body: '{}'
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || 'Could not load prayer requests.');
      }
      prayers = await response.json();
      render();
    } catch (error) {
      showFeedMessage('The Prayer Wall could not connect. Please check your connection and try again.', true);
      console.error('Prayer Wall load error:', error);
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    const prayerText = message.value.trim();
    if (prayerText.length < 10 || prayerText.length > 1200) {
      showStatus('Please write between 10 and 1,200 characters.', true);
      return;
    }

    const displayName = document.getElementById('prayer-name').value.trim();
    const country = document.getElementById('prayer-country').value.trim();
    const category = document.getElementById('prayer-category').value;
    const payload = {
      prayer_text: prayerText,
      category,
      display_name: displayName || null,
      country: country || null
    };

    submitButton.disabled = true;
    submitButton.textContent = 'SHARING…';
    showStatus('', false);

    try {
      const response = await fetch(API + '/prayer_requests', {
        method: 'POST',
        headers: Object.assign({}, headers, { Prefer: 'return=minimal' }),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const detail = await response.text();
        if (response.status === 429) throw new Error('Too many submissions from this connection. Please wait a little and try again.');
        throw new Error(detail || 'Your prayer could not be submitted.');
      }
      form.reset();
      charCount.textContent = '0 / 1,200';
      showStatus('Your prayer request has been shared. Thank you. May God bless you.', false);
      await loadPrayers();
    } catch (error) {
      showStatus(error.message || 'Something went wrong. Please try again.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'SHARE PRAYER REQUEST';
    }
  });

  feed.addEventListener('click', async event => {
    const button = event.target.closest('[data-prayer-id]');
    if (!button || button.disabled) return;
    const id = button.getAttribute('data-prayer-id');
    button.disabled = true;
    try {
      const response = await fetch(API + '/prayer_reactions', {
        method: 'POST',
        headers: Object.assign({}, headers, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ prayer_id: id, visitor_token: visitorToken() })
      });
      if (!response.ok && response.status !== 409) {
        const detail = await response.text();
        if (response.status === 429) throw new Error('You have reached the prayer reaction limit. Please try again later.');
        throw new Error(detail || 'Could not record your prayer.');
      }
      markPrayed(id);
      const prayer = prayers.find(item => item.id === id);
      if (prayer && response.status !== 409) prayer.prayer_count = Number(prayer.prayer_count || 0) + 1;
      render();
    } catch (error) {
      button.disabled = false;
      showStatus(error.message || 'Could not record your prayer. Please try again.', true);
    }
  });

  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  refreshButton.addEventListener('click', loadPrayers);
  message.addEventListener('input', () => {
    charCount.textContent = message.value.length + ' / 1,200';
  });

  loadPrayers();
})();