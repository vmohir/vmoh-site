/**
 * @param  {int}
 * @return {promise}
 */
export default function delay(delay) {
	var ctr, rej, p = new Promise(function (resolve, reject) {
        ctr = setTimeout(resolve, delay);
        rej = reject;
    });
    p.cancel = function(){ clearTimeout(ctr); rej(Error("Cancelled"))};
    return p;
}
