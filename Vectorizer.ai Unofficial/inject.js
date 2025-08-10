//Vrex.js vist: https://github.com/sanz-s/Vrex.js 
class Vrex extends Path2D {
    constructor() {
        super();
        this.pathData = '';
        this.currentX = null;
        this.currentY = null;
        this.lastCmd = '';
    }

    _updatePoint(x, y, cmd) {
        this.currentX = x;
        this.currentY = y;
        this.lastCmd = cmd;
    }

    moveTo(x, y) {
        super.moveTo(x, y);
        this.pathData += `M${x} ${y} `;
        this._updatePoint(x, y, 'M');
    }

    lineTo(x, y) {
        super.lineTo(x, y);
        this.pathData += `L${x} ${y} `;
        this._updatePoint(x, y, 'L');
    }

    closePath() {
        super.closePath();
        this.pathData += 'Z ';
        this.currentX = this.currentY = null;
        this.lastCmd = 'Z';
    }

    arc(x, y, r, a0, a1, ccw) {
        super.arc(x, y, r, a0, a1, ccw);
        const startX = x + r * Math.cos(a0);
        const startY = y + r * Math.sin(a0);
        const endX = x + r * Math.cos(a1);
        const endY = y + r * Math.sin(a1);
        let da = a1 - a0;
        if (!ccw && da < 0) da += 2 * Math.PI;
        if (ccw && da > 0) da -= 2 * Math.PI;
        const largeArcFlag = Math.abs(da) > Math.PI ? 1 : 0;
        const sweepFlag = ccw ? 0 : 1;
        if (this.currentX === null || this.lastCmd === 'Z') {
            this.pathData += `M${startX} ${startY} `;
        } else if (Math.hypot(this.currentX - startX, this.currentY - startY) > 1e-6) {
            this.pathData += `L${startX} ${startY} `;
        }
        this.pathData += `A${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;
        this._updatePoint(endX, endY, 'A');
    }

    arcTo(x1, y1, x2, y2, r) {
        super.arcTo(x1, y1, x2, y2, r);
        if (this.currentX === null || this.currentY === null) {
            this.moveTo(x1, y1);
            this.lineTo(x2, y2);
            return;
        }
        const x0 = this.currentX;
        const y0 = this.currentY;
        const dx1 = x0 - x1;
        const dy1 = y0 - y1;
        const dx2 = x2 - x1;
        const dy2 = y2 - y1;
        const len1 = Math.hypot(dx1, dy1);
        const len2 = Math.hypot(dx2, dy2);
        if (len1 === 0 || len2 === 0 || r === 0) {
            this.lineTo(x1, y1);
            return;
        }
        const v1x = dx1 / len1;
        const v1y = dy1 / len1;
        const v2x = dx2 / len2;
        const v2y = dy2 / len2;
        const dot = v1x * v2x + v1y * v2y;
        const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
        if (angle === 0) {
            this.lineTo(x1, y1);
            return;
        }
        const tanDist = r / Math.tan(angle / 2);
        if (tanDist > len1 || tanDist > len2) {
            this.lineTo(x1, y1);
            return;
        }
        const t1x = x1 + v1x * tanDist;
        const t1y = y1 + v1y * tanDist;
        const t2x = x1 + v2x * tanDist;
        const t2y = y1 + v2y * tanDist;
        const bisX = v1x + v2x;
        const bisY = v1y + v2y;
        const bisLen = Math.hypot(bisX, bisY);
        const bisNx = bisX / bisLen;
        const bisNy = bisY / bisLen;
        const sinHalfAngle = Math.sin(angle / 2);
        const length = r / sinHalfAngle;
        const cross = v1x * v2y - v1y * v2x;
        const clockwise = cross < 0;
        const centerX = x1 + bisNx * length * (clockwise ? -1 : 1);
        const centerY = y1 + bisNy * length * (clockwise ? -1 : 1);
        const sweepFlag = clockwise ? 1 : 0;
        this.lineTo(t1x, t1y);
        this.pathData += `A${r} ${r} 0 0 ${sweepFlag} ${t2x} ${t2y} `;
        this._updatePoint(t2x, t2y, 'A');
    }

    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
        super.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
        this.pathData += `C${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y} `;
        this._updatePoint(x, y, 'C');
    }

    quadraticCurveTo(cx, cy, x, y) {
        super.quadraticCurveTo(cx, cy, x, y);
        this.pathData += `Q${cx} ${cy} ${x} ${y} `;
        this._updatePoint(x, y, 'Q');
    }

    rect(x, y, w, h) {
        super.rect(x, y, w, h);
        this.pathData += `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z `;
        this.currentX = this.currentY = null;
        this.lastCmd = 'Z';
    }

    roundRect(x, y, w, h, r) {
        super.roundRect(x, y, w, h, r);
        if (typeof r === 'number') {
            r = {
                tl: r,
                tr: r,
                br: r,
                bl: r
            };
        } else {
            r = Object.assign({
                tl: 0,
                tr: 0,
                br: 0,
                bl: 0
            }, r);
        }
        const maxRadius = Math.min(w, h) / 2;
        r.tl = Math.min(r.tl, maxRadius);
        r.tr = Math.min(r.tr, maxRadius);
        r.br = Math.min(r.br, maxRadius);
        r.bl = Math.min(r.bl, maxRadius);
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        if (r.tr > 0) this.pathData += `A${r.tr} ${r.tr} 0 0 1 ${x + w} ${y + r.tr} `;
        this.lineTo(x + w, y + h - r.br);
        if (r.br > 0) this.pathData += `A${r.br} ${r.br} 0 0 1 ${x + w - r.br} ${y + h} `;
        this.lineTo(x + r.bl, y + h);
        if (r.bl > 0) this.pathData += `A${r.bl} ${r.bl} 0 0 1 ${x} ${y + h - r.bl} `;
        this.lineTo(x, y + r.tl);
        if (r.tl > 0) this.pathData += `A${r.tl} ${r.tl} 0 0 1 ${x + r.tl} ${y} `;
        this.closePath();
    }

    ellipse(cx, cy, rx, ry, rot, a0, a1, ccw) {
        super.ellipse(cx, cy, rx, ry, rot, a0, a1, ccw);
        const rotDeg = (rot * 180) / Math.PI;
        const cosRot = Math.cos(rot);
        const sinRot = Math.sin(rot);
        const startX = cx + rx * Math.cos(a0) * cosRot - ry * Math.sin(a0) * sinRot;
        const startY = cy + rx * Math.cos(a0) * sinRot + ry * Math.sin(a0) * cosRot;
        const endX = cx + rx * Math.cos(a1) * cosRot - ry * Math.sin(a1) * sinRot;
        const endY = cy + rx * Math.cos(a1) * sinRot + ry * Math.sin(a1) * cosRot;
        let da = a1 - a0;
        if (!ccw && da < 0) da += 2 * Math.PI;
        if (ccw && da > 0) da -= 2 * Math.PI;
        const largeArcFlag = Math.abs(da) > Math.PI ? 1 : 0;
        const sweepFlag = ccw ? 0 : 1;
        if (this.currentX === null || this.lastCmd === 'Z') {
            this.pathData += `M${startX} ${startY} `;
        } else if (Math.hypot(this.currentX - startX, this.currentY - startY) > 1e-6) {
            this.pathData += `L${startX} ${startY} `;
        }
        this.pathData += `A${rx} ${ry} ${rotDeg} ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;
        this._updatePoint(endX, endY, 'A');
    }

    addPath(path, transform) {
        super.addPath(path, transform);
        this.pathData += `/* addPath(...) */ `;
    }

    getPathData() {
        return this.pathData.trim();
    }
};

window.Path2D = Vrex;
const origFill = CanvasRenderingContext2D.prototype.fill;
const origStroke = CanvasRenderingContext2D.prototype.stroke;
const progress = document.querySelector("#App-Progress-Download-Bar");
function serializePath(path, ctx) {
    const d = path.getPathData().trim();
    const t = ctx.getTransform();
    const m = [t.a, t.b, t.c, t.d, t.e, t.f].join(' ');
    return {
        d,
        m
    };
}
CanvasRenderingContext2D.prototype.fill = function(path) {
    if (arguments.length) origFill.call(this, path);
    else origFill.call(this);
    if (path instanceof Path2D && window.getComputedStyle(progress).width != "100%") {
        const {
            d,
            m
        } = serializePath(path, this);
        window.svgmaker.push({
            type: 'path',
            d,
            transform: `matrix(${m})`,
            fill: this.fillStyle,
            'fill-opacity': this.globalAlpha
        });
    }
};

CanvasRenderingContext2D.prototype.stroke = function(path) {
    if (arguments.length) origStroke.call(this, path);
    else origStroke.call(this);
    if (path instanceof Path2D && window.getComputedStyle(progress).width != "100%") {
        const {
            d,
            m
        } = serializePath(path, this);
        window.svgmaker.push({
            type: 'path',
            d,
            transform: `matrix(${m})`,
            fill: 'none',
            stroke: this.strokeStyle,
        });
    }
};

const SVG_NS = 'http://www.w3.org/2000/svg';
if (!window.svgmaker) window.svgmaker = [];
window.down = function(e) {
    e.preventDefault();
    window.isActivated = "done";
    const svgEl = document.createElementNS(SVG_NS, 'svg');
    svgEl.setAttribute('xmlns', SVG_NS);
    window.svgmaker.forEach(obj => {
        const el = document.createElementNS(SVG_NS, obj.type);
        for (let key in obj) {
            if (key !== 'type') el.setAttribute(key, obj[key]);
        }
        svgEl.appendChild(el);
    });
    console.log(svgEl.outerHTML);
    var name = document.querySelector("title").textContent.split("-")[0].trim().split(".");
    name[name.length-1] = "svg";
    downloadSVG(name.join("."),svgEl.outerHTML);
}

function downloadSVG(filename, svgXml) {
  const blob = new Blob([svgXml], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.querySelector('#App-DownloadLink').style.background='#03c12d';
document.querySelector('#App-DownloadLink .showPaid').style.display='none';
document.querySelector('#App-DownloadLink .showFree').style.display='inline';
document.querySelector('#App-DownloadLink').onclick = down;
document.querySelector('#App-DownloadLink').onmouseover = ()=>{
    document.querySelector('#App-DownloadLink').removeAttribute("href");
};

window.isActivated = "true";