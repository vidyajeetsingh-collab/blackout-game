const Renderer = {
    init() {
        console.log("RENDERER INIT");
    },

    render() {
        const canvas = document.getElementById("gameCanvas");

        if (!canvas) {
            alert("CANVAS NOT FOUND");
            return;
        }

        canvas.style.background = "red";
        canvas.style.display = "block";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";

        console.log(
            "CANVAS:",
            canvas.width,
            canvas.height,
            canvas.clientWidth,
            canvas.clientHeight
        );
    }
};
