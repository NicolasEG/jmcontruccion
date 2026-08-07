
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.querySelector(".loader");
    setTimeout(() => loader?.classList.add("hide"), 850);

    const header = document.querySelector(".header");
    const nav = document.querySelector(".nav");
    const menuBtn = document.querySelector(".menu-btn");

    window.addEventListener("scroll", () => {
        header?.classList.toggle("scrolled", window.scrollY > 40);
    });

    menuBtn?.addEventListener("click", () => {
        nav?.classList.toggle("open");
        document.body.classList.toggle("no-scroll");
    });

    document.querySelectorAll(".nav a").forEach(link => {
        link.addEventListener("click", () => {
            nav?.classList.remove("open");
            document.body.classList.remove("no-scroll");
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add("visible");
            }
        });
    }, { threshold:.18 });

    document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

    initCounters();
    initLightbox();
    initParticles();
});

function initCounters(){
    const counters = document.querySelectorAll(".counter");
    if(!counters.length) return;

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(!entry.isIntersecting || entry.target.dataset.done) return;

            const el = entry.target;
            const target = Number(el.dataset.target || 0);
            const suffix = el.dataset.suffix || "";
            const duration = 1500;
            const start = performance.now();

            function update(now){
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(target * eased).toLocaleString("es-AR") + suffix;
                if(progress < 1) requestAnimationFrame(update);
            }

            el.dataset.done = "true";
            requestAnimationFrame(update);
        });
    }, { threshold:.45 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function initLightbox(){
    const items = [...document.querySelectorAll("[data-lightbox]")];
    const lightbox = document.querySelector(".lightbox");
    const content = document.querySelector(".lightbox-content");
    const close = document.querySelector(".lightbox-close");
    const prev = document.querySelector(".lightbox-prev");
    const next = document.querySelector(".lightbox-next");
    let index = 0;

    if(!items.length || !lightbox || !content) return;

    function open(i){
        index = i;
        const img = items[index].dataset.img || items[index].style.getPropertyValue("--img");
        content.style.setProperty("--img", img);
        lightbox.classList.add("show");
        document.body.classList.add("no-scroll");
    }

    function closeBox(){
        lightbox.classList.remove("show");
        document.body.classList.remove("no-scroll");
    }

    function move(step){
        index = (index + step + items.length) % items.length;
        open(index);
    }

    items.forEach((item, i) => item.addEventListener("click", () => open(i)));
    close?.addEventListener("click", closeBox);
    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));

    lightbox.addEventListener("click", e => {
        if(e.target === lightbox) closeBox();
    });

    document.addEventListener("keydown", e => {
        if(!lightbox.classList.contains("show")) return;
        if(e.key === "Escape") closeBox();
        if(e.key === "ArrowRight") move(1);
        if(e.key === "ArrowLeft") move(-1);
    });
}

function initParticles(){
    const canvas = document.createElement("canvas");
    const wrap = document.getElementById("particles-js");
    if(!wrap) return;

    wrap.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const amount = window.innerWidth < 768 ? 34 : 70;
        particles = Array.from({length:amount}, () => ({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            r:Math.random()*1.8 + .4,
            vx:(Math.random()-.5)*.35,
            vy:(Math.random()-.5)*.35,
            red:Math.random() > .68
        }));
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        particles.forEach((p,i) => {
            p.x += p.vx;
            p.y += p.vy;

            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle = p.red ? "rgba(217,4,41,.75)" : "rgba(255,255,255,.45)";
            ctx.fill();

            for(let j=i+1;j<particles.length;j++){
                const q = particles[j];
                const dx = p.x-q.x;
                const dy = p.y-q.y;
                const d = Math.sqrt(dx*dx+dy*dy);
                if(d < 115){
                    ctx.beginPath();
                    ctx.moveTo(p.x,p.y);
                    ctx.lineTo(q.x,q.y);
                    ctx.strokeStyle = `rgba(255,255,255,${(1-d/115)*.08})`;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
}
