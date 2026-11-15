(function(){
  const KEY='constantine-language';
  const LANGS=['en','it','si','ta','hi','es','fr','tl','nl','pt','ar','ru'];
  const read=()=>{try{return localStorage.getItem(KEY)||'en'}catch(e){return 'en'}};
  const writeCookie=(value)=>{
    const cookie='googtrans=/en/'+value+';path=/;max-age=31536000;SameSite=Lax';
    document.cookie=cookie;
    try{document.cookie=cookie+';domain='+location.hostname}catch(e){}
    try{document.cookie=cookie+';domain=.apokolips.xyz'}catch(e){}
  };
  const apply=(value,reload)=>{
    if(!LANGS.includes(value)) value='en';
    try{localStorage.setItem(KEY,value)}catch(e){}
    writeCookie(value);
    if(reload) location.reload();
  };
  window.ConstantineLanguage={get:read,set:(value)=>apply(value,true),languages:LANGS};
  const selected=read();
  if(selected!=='en') writeCookie(selected);
  window.googleTranslateElementInit=function(){
    if(!window.google||!google.translate||!google.translate.TranslateElement)return;
    new google.translate.TranslateElement({
      pageLanguage:'en',
      includedLanguages:LANGS.join(','),
      autoDisplay:false,
      multilanguagePage:true
    },'google_translate_element');
    const sync=()=>{
      const combo=document.querySelector('.goog-te-combo');
      if(combo && combo.value!==selected){combo.value=selected;combo.dispatchEvent(new Event('change'));}
    };
    setTimeout(sync,500);
    setTimeout(sync,1400);
  };
  const style=document.createElement('style');
  style.textContent='.goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-tooltip,.goog-tooltip:hover{display:none!important}body{top:0!important}.skiptranslate{display:none!important}#google_translate_element{display:none!important}';
  document.head.appendChild(style);

  // Preferred Sinhala spelling: "ජේසුස්" instead of "යේසුස්".
  function correctSinhalaJesusSpelling(){
    if(read()!=='si' || !document.body) return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        const parent=node.parentElement;
        if(!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.includes('යේසුස්') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{node.nodeValue=node.nodeValue.replace(/යේසුස්/g,'ජේසුස්');});
  }
  if(read()==='si'){
    document.addEventListener('DOMContentLoaded',correctSinhalaJesusSpelling);
    const observer=new MutationObserver(correctSinhalaJesusSpelling);
    const observe=()=>{if(document.body) observer.observe(document.body,{childList:true,subtree:true,characterData:true});};
    observe();
    correctSinhalaJesusSpelling();
  }
  const loader=document.createElement('script');
  loader.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  loader.async=true;
  document.head.appendChild(loader);
})();