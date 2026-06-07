(function(){
  var t = localStorage.getItem('cs-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  var m = document.createElement('meta');
  m.name = 'theme-color';
  m.content = t === 'dark' ? '#080808' : '#F2EDE2';
  document.head.appendChild(m);
})();
