(function(){
  'use strict';
  const KEY='constantine-language';
  const LANGS=['en','it','si','ta','hi','es','fr','tl','nl','pt','ar','ru'];
  const read=()=>{try{return localStorage.getItem(KEY)||'en'}catch(e){return 'en'}};
  const writeCookie=value=>{
    const cookie='googtrans=/en/'+value+';path=/;max-age=31536000;SameSite=Lax';
    document.cookie=cookie;
    try{document.cookie=cookie+';domain='+location.hostname}catch(e){}
    try{document.cookie=cookie+';domain=.apokolips.xyz'}catch(e){}
  };
  const apply=value=>{
    if(!LANGS.includes(value)) value='en';
    try{localStorage.setItem(KEY,value)}catch(e){}
    if(value==='si'){
      // Remove any previous Google Translate state; Sinhala is rendered natively.
      document.cookie='googtrans=;path=/;max-age=0';
      try{document.cookie='googtrans=;domain=.apokolips.xyz;path=/;max-age=0'}catch(e){}
    }else if(value!=='en') writeCookie(value);
    else{
      document.cookie='googtrans=;path=/;max-age=0';
      try{document.cookie='googtrans=;domain=.apokolips.xyz;path=/;max-age=0'}catch(e){}
    }
    location.reload();
  };
  window.ConstantineLanguage={get:read,set:apply,languages:LANGS};
  const selected=read();
  if(selected==='si'){
    document.documentElement.lang='si';
    const script=document.createElement('script');
    script.src='assets/sinhala.js';
    script.defer=true;
    document.head.appendChild(script);
    return;
  }
  if(selected!=='en') writeCookie(selected);
  window.googleTranslateElementInit=function(){
    if(!window.google||!google.translate||!google.translate.TranslateElement)return;
    new google.translate.TranslateElement({
      pageLanguage:'en',includedLanguages:LANGS.filter(x=>x!=='si').join(','),
      autoDisplay:false,multilanguagePage:true
    },'google_translate_element');
    const sync=()=>{
      const combo=document.querySelector('.goog-te-combo');
      if(combo&&combo.value!==selected){combo.value=selected;combo.dispatchEvent(new Event('change'));}
    };
    setTimeout(sync,500);setTimeout(sync,1400);
  };
  const style=document.createElement('style');
  style.textContent='.goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-tooltip,.goog-tooltip:hover{display:none!important}body{top:0!important}.skiptranslate{display:none!important}#google_translate_element{display:none!important}';
  document.head.appendChild(style);
  if(selected!=='en'){
    const loader=document.createElement('script');
    loader.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    loader.async=true;document.head.appendChild(loader);
  }
})();