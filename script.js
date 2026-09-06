(() => {
  const names = ['hero','work','qualtrics','travel','investing','clinical','approach','teams'];
  const scenes = [...document.querySelectorAll('.scene')];
  const stage = document.getElementById('stage');
  let snapping = false;
  let snapTimer = 0;
  let raf = 0;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);
  const step = () => window.innerHeight * 1.4;
  const indexFor = name => names.indexOf(name);
  const topFor = name => Math.max(0, indexFor(name) * step());

  function scaleStage() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(1, vw / 1440, vh / 900);
    stage.style.transform = `scale(${scale})`;
  }

  function styleScene(scene, d, position) {
    const ad = Math.abs(d);
    const visible = clamp(1 - ad);
    const e = ease(visible);
    const dir = Math.sign(d);
    const name = scene.dataset.scene;

    let y = dir * 70 * (1 - e);
    let scale = .975 + .025 * e;
    let blur = (1 - e) * 8;
    let opacity = e;

    if (name === 'hero') {
      y = dir * 100 * (1 - e);
      scale = .94 + .06 * e;
    } else if (name === 'work') {
      y = dir * 45 * (1 - e);
      blur = (1 - e) * 4;
    } else if (['qualtrics','travel','investing','clinical'].includes(name)) {
      y = dir * 85 * (1 - e);
      scale = .96 + .04 * e;
      blur = (1 - e) * 7;
    } else if (name === 'approach') {
      y = dir * 130 * (1 - e);
      scale = .93 + .07 * e;
      blur = (1 - e) * 10;
    } else if (name === 'teams') {
      y = dir * 80 * (1 - e);
      scale = .965 + .035 * e;
    }

    scene.style.opacity = opacity.toFixed(4);
    scene.style.filter = `blur(${blur.toFixed(2)}px)`;
    scene.style.transform = `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
    scene.style.zIndex = String(100 - Math.round(ad * 10));
    scene.classList.toggle('is-active', ad < .56);

    const local = clamp(1 - ad);
    if (name === 'hero') {
      const title = scene.querySelector('.hero-title');
      const intro = scene.querySelector('.hero-intro');
      const about = scene.querySelector('.hero-about');
      const leaving = clamp(position);
      title.style.transform = `translateY(${-65 * leaving}px)`;
      intro.style.transform = `translateY(${-25 * leaving}px)`;
      about.style.transform = `translateY(${35 * leaving}px)`;
    }

    if (name === 'work') {
      const list = scene.querySelector('.project-list');
      const p = clamp(position - 1, 0, 4);
      list.style.transform = `translateY(${-18 * p}px)`;
    }

    if (['qualtrics','travel','investing','clinical'].includes(name)) {
      const card = scene.querySelector('.focus-card');
      const gallery = scene.querySelector('.qualtrics-gallery,.travel-gallery,.invest-gallery,.clinical-gallery');
      if (card) card.style.transform = `translateY(${(1-local) * dir * 28}px) scale(${.985 + local*.015})`;
      if (gallery) gallery.style.transform = `translateY(${dir * (1-local) * -18}px)`;
    }

    if (name === 'approach') {
      const a = scene.querySelector('.approach-board-a');
      const b = scene.querySelector('.approach-board-b');
      const mini = scene.querySelector('.approach-mini');
      a.style.transform = `translateY(${dir * (1-local) * 36}px)`;
      b.style.transform = `translateY(${dir * (1-local) * -28}px)`;
      mini.style.transform = `translateY(${dir * (1-local) * 18}px)`;
    }

    if (name === 'teams') {
      const photo = scene.querySelector('.teams-photo');
      const copy = scene.querySelector('.teams-copy');
      photo.style.transform = `translateX(${dir * (1-local) * -45}px) scale(${.98 + local*.02})`;
      copy.style.transform = `translateX(${dir * (1-local) * 35}px)`;
    }
  }

  function render() {
    raf = 0;
    const position = window.scrollY / step();
    scenes.forEach((scene, i) => styleScene(scene, position - i, position));
  }

  function requestRender() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function go(name, behavior = 'smooth') {
    const i = indexFor(name);
    if (i < 0) return;
    snapping = true;
    clearTimeout(snapTimer);
    window.scrollTo({ top: topFor(name), behavior });
    setTimeout(() => { snapping = false; }, behavior === 'smooth' ? 850 : 0);
  }

  function settle() {
    if (snapping) return;
    const position = window.scrollY / step();
    const nearest = Math.round(position);
    const bounded = Math.max(0, Math.min(names.length - 1, nearest));
    const delta = Math.abs(position - bounded);
    if (delta > .035) go(names[bounded]);
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
    snapTimer = setTimeout(settle, 180);
  }, { passive: true });

  window.addEventListener('resize', () => {
    scaleStage();
    requestRender();
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  scaleStage();
  render();
})();
