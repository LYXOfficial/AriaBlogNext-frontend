export default function throttling(fn:Function,wait:number,maxTimelong:number){
    var timeout:number=0,startTime=(new Date()).valueOf();
    return function() {
        if(timeout) clearTimeout(timeout);
        var curTime=(new Date()).valueOf();
        if(curTime-startTime>=maxTimelong) {
            fn();
            startTime=curTime;
        }
        else{
            timeout=setTimeout(fn, wait);
        }
    }
}