(function () {
    const intro = document.getElementById('intro');
    if (!intro || document.documentElement.classList.contains('no-intro')) return;

    const page = document.querySelector('.page');
    if (page) page.inert = true;                       // le site reste inaccessible tant qu'on n'est pas entré

    const alea = (min, max) => min + Math.random() * (max - min);
    const touche = (a, b, m) => a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m;

    /* ---------- ENTRER ---------- */
    function entrer() {
        if (intro.classList.contains('is-leaving')) return;
        intro.classList.add('is-leaving');
        try { sessionStorage.setItem('intro', '1'); } catch (e) { }
        document.documentElement.classList.remove('intro-on');          // débloque le défilement
        if (page) page.inert = false;
        if (location.search) history.replaceState(null, '', location.pathname);   // enlève « ?intro » de l'adresse
        setTimeout(() => intro.remove(), 1100);                         // on retire la page d'entrée une fois partie
    }
    intro.addEventListener('click', entrer);
    intro.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrer(); } });

    /* ---------- RONDS : même taille, répartis au hasard (hors du nom), chacun flotte à son rythme ---------- */
    function decor() {
        const W = window.innerWidth, H = window.innerHeight;
        const nom = intro.querySelector('.intro__name').getBoundingClientRect();

        const sonde = document.createElement('span');                  // mesure la taille d'un rond (--dot-size)
        sonde.className = 'intro__dot';
        intro.appendChild(sonde);
        const d = sonde.offsetWidth;
        sonde.remove();

        const rects = [];
        const voulus = Math.round(alea(10, 15));
        for (let essai = 0; essai < 500 && rects.length < voulus; essai++) {
            const x = alea(12, W - d - 12), y = alea(12, H - d - 12);
            const r = { left: x, top: y, right: x + d, bottom: y + d };
            if (touche(r, nom, 24) || rects.some((o) => touche(r, o, 26))) continue;
            rects.push(r);
            const rond = document.createElement('span');
            rond.className = 'intro__dot';
            rond.setAttribute('aria-hidden', 'true');
            rond.style.setProperty('--x', (x / W * 100).toFixed(2) + '%');
            rond.style.setProperty('--y', (y / H * 100).toFixed(2) + '%');
            rond.style.setProperty('--dx', alea(-110, 110).toFixed(0) + 'px');
            rond.style.setProperty('--dy', alea(-110, 110).toFixed(0) + 'px');
            rond.style.setProperty('--dur', alea(8, 18).toFixed(1) + 's');
            rond.style.setProperty('--delay', '-' + alea(0, 18).toFixed(1) + 's');
            intro.appendChild(rond);
        }
    }

    document.fonts.ready.then(decor);                  // on attend les polices pour connaître la vraie taille du nom
})();