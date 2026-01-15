// Browser bundle for chess.js
(function() {
  'use strict';
  
  // We'll use a simple inline implementation or load from a working source
  // For now, let's try using a different CDN approach
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js';
  script.onload = function() {
    if (typeof Chess !== 'undefined') {
      window.Chess = Chess;
      console.log('Chess.js loaded from CDN');
    }
  };
  script.onerror = function() {
    console.error('Failed to load chess.js from CDN');
    // Fallback: try to load from another source or show error
    loadChessFallback();
  };
  document.head.appendChild(script);
  
  function loadChessFallback() {
    // Try jsdelivr
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/chess.js@0.13.4/chess.min.js';
    script2.onload = function() {
      if (typeof Chess !== 'undefined') {
        window.Chess = Chess;
        console.log('Chess.js loaded from jsdelivr');
      }
    };
    document.head.appendChild(script2);
  }
})();
