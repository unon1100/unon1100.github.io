import {flattened, showImage} from "./script.js";

let color = "#000000";

const lightColor = "#F7F7F7";
const darkColor = "#404040";


export const tools = [
    /**
     * doesn't do anything
     */
    class Cursor {

        static get doNothing() {
            return true;
        }

        static get name() {
            return "Cursor"
        }

        static get icon() {
            return "mouse-pointer";
        }

        static get cursor() {
            return "default";
        }
    },

    /**
     * brush that brushes
     */
    class Brush {
        static get name() {
            return "Brush"
        }

        static get icon() {
            return "paint-brush";
        }

        static get cursor() {
            return "pointer";
        }

        static mousedown(e, canvas) {
            const ctx = canvas.getContext('2d');
            Brush.lastX = e.offsetX;
            Brush.lastY = e.offsetY;

            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 7;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        }

        static mousedrag(e, canvas) {
            const ctx = canvas.getContext('2d');

            const x = e.offsetX;
            const y = e.offsetY;

            ctx.beginPath();
            ctx.moveTo(Brush.lastX, Brush.lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();

            Brush.lastX = x;
            Brush.lastY = y;
        }

        static mouseup(e, canvas) {
            Brush.mousedrag(e, canvas);
        }
    },

    /**
     * line tool makes nice straight lines
     */
    class Line {
        static get name() {
            return "Line"
        }

        static get icon() {
            return "minus";
        }

        static get cursor() {
            return "crosshair";
        }

        static mousedown(e, canvas) {
            const ctx = canvas.getContext('2d');

            const x = e.offsetX;
            const y = e.offsetY;

            Line.startX = x;
            Line.startY = y;

            ctx.strokeStyle = color;
            ctx.lineCap = 'round';
            ctx.lineWidth = 7;
        }

        static mousedrag(e, canvas) {
            const ctx = canvas.getContext('2d');
            const x = e.offsetX;
            const y = e.offsetY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(Line.startX, Line.startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        static mouseup(e, canvas) {
            Line.mousedrag(e, canvas);
        }
    },

    /**
     * Crops an image (irreversable)
     */
    class Crop {
        static get name() {
            return "Crop"
        }

        static get icon() {
            return "crop";
        }

        static get cursor() {
            return "crosshair";
        }

        static mousedown(e, canvas) {
            const ctx = canvas.getContext('2d');

            Crop.startX = e.offsetX;
            Crop.startY = e.offsetY;

            ctx.fillStyle = "rgba(0, 0, 0, .5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        static mousedrag(e, canvas) {
            const ctx = canvas.getContext('2d');

            Crop.endX = e.offsetX;
            Crop.endY = e.offsetY;

            ctx.fillStyle = "rgba(0, 0, 0, .5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "red";
            ctx.clearRect(Crop.startX, Crop.startY, e.offsetX - Crop.startX, e.offsetY - Crop.startY);
            ctx.strokeRect(Crop.startX, Crop.startY, e.offsetX - Crop.startX, e.offsetY - Crop.startY);
        }

        static mouseup(e, canvas) {
            Crop.mousedrag(e, canvas);

            if (confirm("Are you sure? Cropping cannot be undone!")) {
                canvas.getContext('2d').clearRect(Crop.startX, Crop.startY, e.offsetX - Crop.startX, e.offsetY - Crop.startY);
                const flat = flattened();

                const $newCan = $("<canvas>");

                const start = {
                    x: Math.min(Crop.startX, Crop.endX),
                    y: Math.min(Crop.startY, Crop.endY)
                };
                const end = {
                    x: Math.max(Crop.startX, Crop.endX),
                    y: Math.max(Crop.startY, Crop.endY)
                };
                $newCan.attr({
                    width: end.x - start.x,
                    height: end.y - start.y
                });
                $newCan[0].getContext('2d').drawImage(
                    flat,               // image
                    start.x,            // source x
                    start.y,            // source y
                    end.x - start.x,    // source width
                    end.y - start.y,    // source height
                    0,                  // dest x
                    0,                  // dest y
                    end.x - start.x,    // dest width
                    end.y - start.y     // dest height
                );

                showImage($newCan[0].toDataURL("image/png"));
            } else {
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    },

    /**
     * censor tool pixelates stuff behind it
     */
    class Censor {
        static get name() {
            return "Censor"
        }

        static get icon() {
            return "times-rectangle";
        }

        static get cursor() {
            return "crosshair";
        }

        static mousedown(e, canvas) {
            const ctx = canvas.getContext('2d');

            Censor.startX = e.offsetX;
            Censor.startY = e.offsetY;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.moveTo(e.offsetX, e.offsetY);
        }

        static mousedrag(e, canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeRect(Censor.startX, Censor.startY, e.offsetX - Censor.startX, e.offsetY - Censor.startY)
        }

        static mouseup(e, canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const start = {x: Censor.startX, y: Censor.startY};
            const change = {x: e.offsetX - start.x, y: e.offsetY - start.y};

            if (change.x < 0) {
                start.x += change.x;
                change.x = -change.x;
            }
            if (change.y < 0) {
                start.y += change.y;
                change.y = -change.y;
            }
            change.x = Math.min(change.x, canvas.width - start.x);
            change.y = Math.min(change.y, canvas.height - start.y);

            const flat = flattened();
            const flatctx = flat.getContext('2d');

            const data = flatctx.getImageData(start.x, start.y, change.x, change.y).data;

            // start(X|Y) represent the start of a pixellated part
            for (let startX = start.x; startX < start.x + change.x; startX += 10) {
                for (let startY = start.y; startY < start.y + change.y; startY += 10) {

                    const avg = [0, 0, 0]; // average r, g, b, a

                    const regionX = startX - start.x;
                    const regionY = startY - start.y;

                    const width = Math.min(10, start.x + change.x - startX);
                    const height = Math.min(10, start.y + change.y - startY);

                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {
                            const index = 4 * ((regionY + y) * change.x + (regionX + x));

                            avg[0] += data[index];     // red
                            avg[1] += data[index + 1]; // green
                            avg[2] += data[index + 2]; // blue
                            // index + 3 is alpha. not needed.
                        }
                    }

                    for (let i = 0; i < avg.length; i++) {
                        avg[i] /= (width * height);
                        avg[i] = Math.round(avg[i]);
                    }

                    // cant use a simple way as a hex code 0xFF00FF would print as 0xFF0FF.
                    // instead this is a good solution that takes up few lines
                    const rgb = (avg[0] << 16) | (avg[1] << 8) | avg[2];
                    ctx.fillStyle = '#' + (0x1000000 + rgb).toString(16).slice(1);
                    ctx.fillRect(startX, startY, width, height);
                }
            } // end loop
        }
    },

    class Color {
        static get name() {
            return "Color";
        }

        static get cursor() {
            return "default"
        }

        static get icon() {
            return "circle";
        }

        /**
         * Special property of Color - when clicked it doesn't
         * stay selected.
         *
         * @returns {boolean}
         */
        static get noSticky() {
            return true;
        }

        static init() {
            $("#Color").find("> .buttonSpan").css({
                backgroundColor: color,
                color: lightColor,
                borderColor: lightColor
            });
        }

        static onSelect() {
            Color.showPicker();
            $("#Color").click(() => {
                Color.showPicker();
            });
        }

        static showPicker() {
            Color.$picker = $("<input type='color' id='picker' value='" + color + "'>");
            const picker = Color.$picker;

            picker.change((newColor) => {
                color = newColor.target.value;
                const intColor = parseInt(color.substring(1), 16);
                const red = intColor & 0x0000FF;
                const green = (intColor >> 8) & 0x0000FF;
                const blue = (intColor >> 16) & 0x0000FF;
                const avgColor = (red + green + blue) / 3;
                const secondColor = avgColor < 128 ? lightColor : darkColor;

                $("#Color").find("> .icon").css({
                    backgroundColor: color,
                    color: secondColor,
                    borderColor: secondColor
                });

                console.log("changing color");
            });

            picker.trigger("click");
        }
    }
];