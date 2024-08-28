export default function debounce(fn:Function,wait:number):Function{
    var timeout:any=null;
    return function() {
        if(timeout!==null) clearTimeout(timeout);
        timeout=setTimeout(fn, wait);
    }
}