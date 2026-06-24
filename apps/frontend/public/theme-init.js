(function(){
  var t = localStorage.getItem('cs-theme') || 'dark';
  var root = document.documentElement;
  root.setAttribute('data-theme', t);
  root.style.colorScheme = t;
  var m = document.createElement('meta');
  m.name = 'theme-color';
  m.content = t === 'dark' ? '#080808' : '#F2EDE2';
  document.head.appendChild(m);
})();
