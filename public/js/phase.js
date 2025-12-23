/* global window */
(function () {
  async function getPhase() {
    const res = await fetch('/api/phase');
    if (!res.ok) {
      throw new Error('Failed to fetch phase');
    }
    return res.json();
  }

  async function requirePhase(expected) {
    const data = await getPhase();
    if (expected === 'send' && data.phase !== 'send') {
      window.location.replace('/receive.html');
      return null;
    }
    if (expected === 'receive') {
      return data;
    }
    if (!expected) {
      window.location.replace(data.phase === 'send' ? '/send.html' : '/receive.html');
      return null;
    }
    return data;
  }

  window.Phase = {
    getPhase,
    requirePhase
  };
})();
