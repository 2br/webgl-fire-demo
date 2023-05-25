export default function(canvas, Camera) {
    const MouseControl = {};


    MouseControl.init = function init() {
        document.addEventListener('wheel', mouseScroll.bind(this));
    };

    function mouseScroll(event) {
        const delta = event.deltaY > 0 ? 0.5 : -0.5;
        const currentZoom = Camera.toPosition[2];
        Camera.toPosition[2] = Math.max(0.9, Math.min(currentZoom + delta, 2));
    }
    return MouseControl;
}