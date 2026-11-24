const cursor = document.querySelector('.cursor');
const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursor && hasMouse) {
    document.documentElement.classList.add('has-cursor');

    let x = 0, y = 0, cx = 0, cy = 0;

    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });

    (function follow() {
        cx += (x - cx) * 0.25;
        cy += (y - cy) * 0.25;
        cursor.style.transform = `translate(${cx}px, ${cy}px)`;
        requestAnimationFrame(follow);
    })();

    document.querySelectorAll('.image-container, .slider, .band').forEach((projet) => {
        projet.addEventListener('mouseenter', (e) => {
            x = cx = e.clientX; y = cy = e.clientY;
            cursor.classList.add('is-visible');
        });
        projet.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    });

    document.querySelectorAll('.slider__btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => cursor.classList.remove('is-visible'));
        btn.addEventListener('mouseleave', () => cursor.classList.add('is-visible'));
    });
}

const navItems = document.querySelectorAll('.nav-item');

function closeAll(except) {
    navItems.forEach((item) => {
        if (item === except) return;
        item.querySelector('.popup').hidden = true;
        item.querySelector('.pill').setAttribute('aria-expanded', 'false');
    });
}

navItems.forEach((item) => {
    const bouton = item.querySelector('.pill');
    const popup = item.querySelector('.popup');

    bouton.addEventListener('click', () => {
        const ouvrir = popup.hidden;
        closeAll(item); // une seule fenêtre à la fois
        popup.hidden = !ouvrir;
        bouton.setAttribute('aria-expanded', String(ouvrir));
    });

    item.querySelector('.popup__close').addEventListener('click', () => {
        popup.hidden = true;
        bouton.setAttribute('aria-expanded', 'false');
        bouton.focus();
    });
});

document.addEventListener('click', (e) => { if (!e.target.closest('.nav-item')) closeAll(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });


let galerieActive = null;

document.querySelectorAll('[data-slider]').forEach((slider) => {
    const photos = Array.from(slider.querySelectorAll('.slide'));

    if (photos.length === 0) return;

    const prev = slider.querySelector('.slider__btn--prev');
    const next = slider.querySelector('.slider__btn--next');

    let courant = 0;

    function aller(pas) {
        courant = (courant + pas + photos.length) % photos.length;

        photos.forEach((photo, index) => {
            photo.classList.toggle('is-active', index === courant);
        });
    }

    if (prev) {
        prev.addEventListener('click', () => aller(-1));
    }

    if (next) {
        next.addEventListener('click', () => aller(1));
    }

    // Activation du carrousel courant
    if (!galerieActive) {
        galerieActive = aller;
    }

    ['mouseenter', 'pointerdown', 'focusin'].forEach((evt) => {
        slider.addEventListener(evt, () => {
            galerieActive = aller;
        });
    });
});

document.addEventListener('keydown', (e) => {
    if (!galerieActive) return;

    if (e.key === 'ArrowLeft') {
        galerieActive(-1);
    }

    if (e.key === 'ArrowRight') {
        galerieActive(1);
    }
});

document.addEventListener('keydown', (e) => {
    if (!galerieActive) return;
    if (e.key === 'ArrowLeft') galerieActive(-1);
    if (e.key === 'ArrowRight') galerieActive(1);
});

const alea = (min, max) => min + Math.random() * (max - min);

const zonesRonds = [
    { zone: document.querySelector('aside'), eviter: '.info-text' },];
const MARGE = 14;

const touche = (a, b, marge) =>
    a.left < b.right + marge && a.right > b.left - marge && a.top < b.bottom + marge && a.bottom > b.top - marge;

function creerRonds() {
    if (window.matchMedia('(max-width: 720px)').matches) return;
    const { zone } = zonesRonds[0];
    if (!zone) return;
    const total = 2 + Math.floor(Math.random() * 2);
    for (let k = 0; k < total; k++) {
        const rond = document.createElement('span');
        rond.className = 'dot';
        rond.setAttribute('aria-hidden', 'true');
        zone.appendChild(rond);
    }
}

function placerRonds(seulementConflits) {
    zonesRonds.forEach(({ zone, eviter }) => {
        if (!zone) return;
        const box = zone.getBoundingClientRect();
        const interdits = [...zone.querySelectorAll(eviter)].map((e) => e.getBoundingClientRect());
        const poses = [];

        zone.querySelectorAll(':scope > .dot').forEach((rond) => {
            const d = rond.offsetWidth;
            if (!d) return;

            if (seulementConflits) {
                const r = rond.getBoundingClientRect();
                if (!interdits.some((f) => touche(r, f, MARGE))) { poses.push(r); return; }
            }

            for (let essai = 0; essai < 100; essai++) {
                const left = alea(MARGE, box.width - d - MARGE);
                const top = alea(MARGE, box.height - d - MARGE);
                const r = { left: box.left + left, top: box.top + top, right: box.left + left + d, bottom: box.top + top + d };
                if (!interdits.some((f) => touche(r, f, MARGE)) && !poses.some((o) => touche(r, o, 30))) {
                    rond.style.setProperty('--x', (left / box.width * 100).toFixed(2) + '%');
                    rond.style.setProperty('--y', (top / box.height * 100).toFixed(2) + '%');
                    rond.style.visibility = '';
                    poses.push(r);
                    return;
                }
            }
            rond.style.visibility = 'hidden';
        });
    });
}

creerRonds();
placerRonds(false);
document.fonts.ready.then(() => placerRonds(true));
let minuteur;
window.addEventListener('resize', () => { clearTimeout(minuteur); minuteur = setTimeout(() => placerRonds(true), 200); });

document.querySelectorAll('.nom').forEach((nom) => {
    nom.setAttribute('aria-label', nom.textContent.replace(/\s+/g, ' ').trim());
    const envelopper = (parent) => {
        [...parent.childNodes].forEach((n) => {
            if (n.nodeType === 3) {
                const frag = document.createDocumentFragment();
                for (const ch of n.textContent) {
                    if (/\s/.test(ch)) { frag.append(ch); continue; }
                    const s = document.createElement('span');
                    s.className = 'l';
                    s.textContent = ch;
                    frag.append(s);
                }
                n.replaceWith(frag);
            } else if (n.nodeType === 1 && !n.matches('.v, .l, .square, br')) {
                envelopper(n);
            }
        });
    };
    envelopper(nom);
});

document.querySelectorAll('.square').forEach((carre) => {
    carre.addEventListener('click', () => {
        try { sessionStorage.removeItem('intro'); } catch (e) {}
    });
});