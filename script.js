(() => {
  const names = ['hero','work','qualtrics','travel','investing','clinical','approach','teams'];
  const scenes = names.map(name => document.querySelector(`[data-scene="${name}"]`));
  const stage = document.getElementById('stage');
  let snapTimer = 0;
  let raf = 0;
  let programmatic = false;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const smoother = t => { t = clamp(t); return t*t*t*(t*(t*6-15)+10); };
  const step = () => window.innerHeight * 1.4;
  const indexFor = name => names.indexOf(name);
  const topFor = name => Math.max(0, indexFor(name) * step());

  function scaleStage() {
    const scale = Math.min(1, window.innerWidth / 1440, window.innerHeight / 900);
    stage.style.transform = `scale(${scale})`;
  }

  function sceneBase(scene) {
    scene.style.opacity = '0';
    scene.style.filter = 'none';
    scene.style.transform = 'none';
    scene.style.clipPath = 'none';
    scene.style.zIndex = '0';
    scene.classList.remove('is-active');
  }

  function show(scene, z = 10) {
    scene.style.opacity = '1';
    scene.style.transform = 'none';
    scene.style.filter = 'none';
    scene.style.clipPath = 'none';
    scene.style.zIndex = String(z);
    scene.classList.add('is-active');
  }

  function setTransform(el, value) {
    if (el) el.style.transform = value;
  }

  function setOpacity(el, value) {
    if (el) el.style.opacity = String(clamp(value));
  }

  function resetInner(scene) {
    if (!scene) return;
    scene.querySelectorAll('.hero-title,.hero-intro,.hero-about,.scroll-cta,.project-list,.project-row,.focus-card,.qualtrics-gallery,.travel-gallery,.invest-gallery,.clinical-gallery,.ghost-list,.approach-copy,.approach-mini,.approach-board,.corner,.teams-photo,.teams-copy,.contact,.scene-heading').forEach(el => {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.filter = '';
      el.style.clipPath = '';
    });
  }

  function rest(i) {
    const scene = scenes[i];
    show(scene, 20);
  }

  function heroToWork(t) {
    const a = scenes[0], b = scenes[1];
    const e = smoother(t);
    show(a, 10); show(b, 20);

    // Hero physically leaves upward at different speeds.
    setTransform(a.querySelector('.hero-intro'), `translateY(${-80 * e}px)`);
    setTransform(a.querySelector('.hero-title'), `translateY(${-210 * e}px) scale(${1 - .025*e})`);
    setTransform(a.querySelector('.hero-about'), `translateY(${-95 * e}px)`);
    setTransform(a.querySelector('.scroll-cta'), `translateY(${-45 * e}px)`);
    a.style.opacity = String(1 - smooth(clamp((t - .28) / .72)));

    // Selected work rises in from below instead of cross-fading in place.
    b.style.opacity = String(smooth(clamp((t - .08) / .72)));
    b.style.transform = `translateY(${120 * (1-e)}px)`;
    b.style.filter = `blur(${4 * (1-e)}px)`;
    setTransform(b.querySelector('.scene-heading'), `translateY(${28 * (1-e)}px)`);
    setTransform(b.querySelector('.work-copy'), `translateY(${50 * (1-e)}px)`);
    setTransform(b.querySelector('.project-list'), `translateY(${85 * (1-e)}px)`);
  }

  function workToQualtrics(t) {
    const a = scenes[1], b = scenes[2];
    const e = smoother(t);
    show(a, 10); show(b, 20);

    // Keep the list as the physical origin of the first opening card.
    a.style.opacity = String(1 - smooth(clamp((t - .58) / .42)) * .86);
    const list = a.querySelector('.project-list');
    setTransform(list, `translateY(${-72 * e}px)`);
    const rows = [...a.querySelectorAll('.project-row')];
    rows.forEach((row, idx) => {
      if (idx === 0) {
        setTransform(row, `translateY(${-18 * e}px) scale(${1 + .012*e})`);
        row.style.filter = `blur(${1.5 * clamp((t-.55)/.45)}px)`;
        setOpacity(row, 1 - .48 * smooth(clamp((t-.55)/.45)));
      } else {
        const shift = -18 * e * (idx + .35);
        setTransform(row, `translateY(${shift}px)`);
        row.style.filter = `blur(${3 * e}px)`;
        setOpacity(row, 1 - .62 * e);
      }
    });

    b.style.opacity = String(smooth(clamp((t - .06) / .7)));
    const card = b.querySelector('.focus-card');
    const open = smoother(clamp((t - .08) / .82));
    setTransform(card, `translateY(${335 * (1-open)}px) scaleX(${.73 + .27*open}) scaleY(${.16 + .84*open})`);
    card.style.transformOrigin = '50% 0%';
    card.style.clipPath = `inset(0 0 ${82 * (1-open)}% 0 round ${6*(1-open)}px)`;
    setOpacity(b.querySelector('.ghost-list'), smooth(clamp((t-.58)/.42)));
  }

  function caseToCase(fromIndex, toIndex, t) {
    const a = scenes[fromIndex], b = scenes[toIndex];
    const e = smoother(t);
    show(a, 10); show(b, 20);

    // Outgoing case travels UP and defocuses. Incoming case rises from below.
    a.style.opacity = String(1 - smooth(clamp((t - .36) / .64)));
    a.style.transform = `translateY(${-190 * e}px) scale(${1 - .035*e})`;
    a.style.filter = `blur(${8 * e}px)`;

    const aCard = a.querySelector('.focus-card');
    const aGallery = a.querySelector('.qualtrics-gallery,.travel-gallery,.invest-gallery,.clinical-gallery');
    setTransform(aCard, `translateY(${-24 * e}px)`);
    setTransform(aGallery, `translateY(${-42 * e}px)`);
    a.querySelectorAll('.ghost-list').forEach(g => setTransform(g, `translateY(${-68 * e}px)`));

    b.style.opacity = String(smooth(clamp((t - .18) / .66)));
    b.style.transform = `translateY(${210 * (1-e)}px) scale(${.965 + .035*e})`;
    b.style.filter = `blur(${7 * (1-e)}px)`;

    const bCard = b.querySelector('.focus-card');
    const bGallery = b.querySelector('.qualtrics-gallery,.travel-gallery,.invest-gallery,.clinical-gallery');
    setTransform(bCard, `translateY(${34 * (1-e)}px)`);
    setTransform(bGallery, `translateY(${46 * (1-e)}px)`);
    b.querySelectorAll('.ghost-list').forEach(g => setTransform(g, `translateY(${45 * (1-e)}px)`));
  }

  function clinicalToApproach(t) {
    const a = scenes[5], b = scenes[6];
    const e = smoother(t);
    show(a, 10); show(b, 20);

    // Deliberate break from the case-study mechanism.
    a.style.opacity = String(1 - smooth(clamp((t - .2) / .65)));
    a.style.transform = `translateY(${-260 * e}px) scale(${1 - .055*e})`;
    a.style.filter = `blur(${12 * e}px)`;

    b.style.opacity = String(smooth(clamp((t - .18) / .62)));
    b.style.transform = `translateY(${145 * (1-e)}px)`;
    b.style.clipPath = `inset(${72 * (1-e)}% 0 0 0)`;

    setTransform(b.querySelector('.approach-mini'), `translateY(${80 * (1-e)}px)`);
    setTransform(b.querySelector('.approach-board-a'), `translateY(${125 * (1-e)}px) rotate(${-1.5*(1-e)}deg)`);
    setTransform(b.querySelector('.approach-board-b'), `translateY(${165 * (1-e)}px) rotate(${1.2*(1-e)}deg)`);
    setOpacity(b.querySelector('.approach-copy'), smooth(clamp((t-.35)/.55)));
  }

  function approachToTeams(t) {
    const a = scenes[6], b = scenes[7];
    const e = smoother(t);
    show(a, 10); show(b, 20);

    a.style.opacity = String(1 - smooth(clamp((t - .28) / .62)));
    a.style.transform = `translateY(${-90 * e}px) scale(${1 - .045*e})`;
    setTransform(a.querySelector('.approach-board-a'), `translateY(${-75 * e}px)`);
    setTransform(a.querySelector('.approach-board-b'), `translateY(${55 * e}px)`);
    setTransform(a.querySelector('.approach-mini'), `translateY(${-35 * e}px)`);

    // Editorial lateral reveal rather than vertical card movement.
    b.style.opacity = String(smooth(clamp((t - .12) / .7)));
    b.style.clipPath = `inset(0 ${82 * (1-e)}% 0 0)`;
    setTransform(b.querySelector('.teams-photo'), `translateX(${-150 * (1-e)}px) scale(${.94 + .06*e})`);
    setTransform(b.querySelector('.teams-copy'), `translateX(${120 * (1-e)}px)`);
    setTransform(b.querySelector('.contact'), `translateY(${85 * (1-e)}px)`);
    setOpacity(b.querySelector('.contact'), smooth(clamp((t-.42)/.5)));
  }

  function render() {
    raf = 0;
    scenes.forEach((scene, i) => { sceneBase(scene); resetInner(scene); });

    const raw = window.scrollY / step();
    const max = names.length - 1;
    const position = clamp(raw, 0, max);
    const i = Math.min(max, Math.floor(position));
    const t = position - i;

    if (i === max || t < .001) {
      rest(i);
      return;
    }

    if (i === 0) heroToWork(t);
    else if (i === 1) workToQualtrics(t);
    else if (i >= 2 && i <= 4) caseToCase(i, i + 1, t);
    else if (i === 5) clinicalToApproach(t);
    else if (i === 6) approachToTeams(t);
  }

  function requestRender() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function go(name, behavior = 'smooth') {
    const i = indexFor(name);
    if (i < 0) return;
    programmatic = true;
    clearTimeout(snapTimer);
    window.scrollTo({ top: topFor(name), behavior });
    setTimeout(() => { programmatic = false; }, behavior === 'smooth' ? 1100 : 0);
  }

  function settle() {
    if (programmatic) return;
    const position = clamp(window.scrollY / step(), 0, names.length - 1);
    const nearest = Math.round(position);
    if (Math.abs(position - nearest) > .025) go(names[nearest]);
  }

  document.addEventListener('click', e => {
    const target = e.target.closest('.js-go');
    if (!target) return;
    e.preventDefault();
    go(target.dataset.go);
  });

  window.addEventListener('scroll', () => {
    requestRender();
    clearTimeout(snapTimer);
    snapTimer = setTimeout(settle, 300);
  }, { passive: true });

  window.addEventListener('resize', () => {
    scaleStage();
    requestRender();
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  scaleStage();
  render();
})();
