
export default class KBResizeObserver {
    observedElement: Element;
    bufferInterval: number;
    onResize: (width: number, height: number) => void;

    resizeObserver: ResizeObserver;
    width: number;
    height: number;
    resizes: number;
    bufferTimer: number | null;
    constructor(
        el: Element,
        bufferInterval: number,
        onResize: (width: number, height: number) => void
    ) {
        this.observedElement = el;
        this.bufferInterval = bufferInterval;
        this.onResize = onResize;

        this.resizeObserver = new window.ResizeObserver(this.onResized.bind(this));

        const { width, height } = this.outerDimensions(this.observedElement);
        this.width = width;
        this.height = height;

        this.bufferTimer = null;
        this.resizes = 0;
        this.resizeObserver.observe(this.observedElement);
    }

    outerDimensions(el: Element) {
        const rect = el.getBoundingClientRect();
        const width = Math.ceil(rect.right - rect.left);
        const height = Math.ceil(rect.bottom - rect.top);
        return {
            width,
            height,
        };
    }

    onResized(entries: Array<ResizeObserverEntry>, observer: ResizeObserver) {
        // for (const entry of entries) {
        //   console.log('entry', entry);
        // }
        const { width, height } = this.outerDimensions(this.observedElement);
        this.width = width;
        this.height = height;
        this.resizes += 1;
        if (this.bufferTimer) {
            return;
        }
        this.bufferTimer = window.setTimeout(this.resizeTriggered.bind(this), this.bufferInterval);
    }

    resizeTriggered() {
        this.bufferTimer = null;
        this.onResize(this.width, this.height);
        this.resizes = 0;
    }

    done() {
        this.resizeObserver.unobserve(this.observedElement);
    }
}
