const daobansima="aHR0cHM6Ly9ibG9nLnlhcmlhLnRvcA==";
const gobackplease=decodeURIComponent(escape(window.atob(daobansima)))
if(!(document.location.href.startsWith('http://localhost')||document.location.href.startsWith(gobackplease)||document.location.href.startsWith("https://0v0.my"))){
    document.location.href=gobackplease+document.location.pathname;
}