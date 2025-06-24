javascript:(function(){

    if(window._recorderRunning){alert("Already recording.");return;}
  
    window._recorderRunning=true;window._recordedActions=[];
  
    function getXPath(el){if(el.id)return`//*[@id="${el.id}"]`;const path=[];while(el&&el.nodeType===1){let i=1,sib=el.previousSibling;while(sib){if(sib.nodeType===1&&sib.nodeName===el.nodeName)i++;sib=sib.previousSibling;}path.unshift(`${el.nodeName.toLowerCase()}[${i}]`);el=el.parentNode;}return'/'+path.join('/');}
  
    function clickHandler(e){window._recordedActions.push({type:"click",xpath:getXPath(e.target)});}
  
    function inputHandler(e){window._recordedActions.push({type:"input",xpath:getXPath(e.target),value:e.target.value});}
  
    document.addEventListener("click",clickHandler,true);
  
    document.addEventListener("input",inputHandler,true);
  
    const btn=document.createElement("button");
  
    btn.innerText="Stop Recording";
  
    btn.style.position="fixed";btn.style.bottom="20px";btn.style.right="20px";btn.style.zIndex=9999;btn.style.padding="10px";btn.style.backgroundColor="red";btn.style.color="white";btn.style.border="none";btn.style.borderRadius="5px";btn.style.cursor="pointer";
  
    btn.onclick=function(){
  
      document.removeEventListener("click",clickHandler,true);
  
      document.removeEventListener("input",inputHandler,true);
  
      document.body.removeChild(btn);
  
      let script=`from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nimport time\n\ndriver = webdriver.Chrome()\ndriver.get("YOUR_URL_HERE")\ntime.sleep(2)\n\n`;
  
      window._recordedActions.forEach(a=>{if(a.type==="click"){script+=`driver.find_element(By.XPATH, "${a.xpath}").click()\n`;}else if(a.type==="input"){script+=`driver.find_element(By.XPATH, "${a.xpath}").send_keys("${a.value.replace(/"/g,'\\"')}")\n`;}script+="time.sleep(1)\n";});
  
      script+="\ndriver.quit()\n";
  
      const blob=new Blob([script],{type:"text/x-python"});
  
      const link=document.createElement("a");
  
      link.href=URL.createObjectURL(blob);
  
      link.download="recorded_script.py";
  
      link.click();
  
      alert("Recording stopped. Python script downloaded.");
  
      window._recorderRunning=false;
  
    };
  
    document.body.appendChild(btn);
  
    alert("Recording started. Click the red 'Stop Recording' button to end.");
  
  })();
   