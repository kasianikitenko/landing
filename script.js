(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollToPlugin) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const projectNames = ['qualtrics', 'travel', 'investing', 'clinical'];
  const projects = projectNames.map(name => document.querySelector(`[data-project="${name}"]`));
  const bars = projects.map(project => project.querySelector('.project-bar'));
  const cases = projects.map(project => project.querySelector('.project-case'));
  const workStage = document.getElementById('workStage');
  const GEOM = 'sine.inOut';
  const REVEAL = 'power2.out';
  let workTL;
  let navigating = false;
  let navUnlockTimer = 0;

  function scaleStages() {
    const scale = Math.min(1, window.innerWidth / 1440, window.innerHeight / 900);
    gsap.set('.design-stage', { scale, transformOrigin: '50% 50%' });
  }

  scaleStages();

  // Landing entrance: reveal the headline as two written lines rather than showing it immediately.
  if (window.scrollY < 8 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const introTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    introTL
      .fromTo('.hero-intro', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .65 }, .05)
      .fromTo('.hero-title span:first-child',
        { clipPath: 'inset(0 100% 0 0)', x: -18 },
        { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.05, ease: 'power2.inOut' }, .18)
      .fromTo('.hero-title span:last-child',
        { clipPath: 'inset(0 100% 0 0)', x: -18 },
        { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.02, ease: 'power2.inOut' }, .58)
      .fromTo('.hero-about', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .75 }, .95)
      .fromTo('.scroll-cta', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, 1.12);
  }

  // Very subtle affordance movement only.
  gsap.to('.scroll-cta span', { y: 3, duration: 1.65, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--bottom', { y: 3, duration: 1.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--top', { y: -3, duration: 1.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // HERO: short, continuous exit. It stays visually present until Work takes over, avoiding a blank phase.
  const heroTL = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'heroPin',
      trigger: '.hero-chapter',
      start: 'top top',
      end: '+=78%',
      pin: '.hero-viewport',
      scrub: .45,
      anticipatePin: 1
    }
  });

  heroTL
    .to('.hero-intro', { y: -38, opacity: .68, ease: GEOM }, 0)
    .to('.hero-title span:first-child', { x: -62, y: -54, ease: GEOM }, 0)
    .to('.hero-title span:last-child', { x: 48, y: -20, ease: GEOM }, 0)
    .to('.hero-about', { y: 45, opacity: .72, ease: GEOM }, .04)
    .to('.scroll-cta', { y: 24, opacity: .35, ease: GEOM }, .08);

  gsap.set(cases, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
  gsap.set('.project-case > .case-lead, .project-case > .case-visual, .project-case > .case-grid', { opacity: 0, y: 18 });

  const card = {
    qualtrics: { top: 48, height: 723 },
    travel: { top: 126, height: 649 },
    investing: { top: 126, height: 754 },
    clinical: { top: 116, height: 764 }
  };
  const baseY = { qualtrics: 405, travel: 500, investing: 595, clinical: 690 };
  const absY = (name, absoluteTop) => absoluteTop - baseY[name];
  const hold = Array.from({ length: 4 }, () => ({ v: 0 }));

  workTL = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'workPin',
      trigger: '.work-chapter',
      start: 'top top',
      end: '+=430%',
      pin: '.work-viewport',
      scrub: .5,
      anticipatePin: 1,
      onUpdate: self => updateActiveProject(self.progress)
    }
  });

  workTL.addLabel('work', 0);

  function revealCase(index, at, duration = .72) {
    workTL
      .to(cases[index], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration, ease: GEOM }, at)
      .to(cases[index].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .52, ease: REVEAL }, at + .12)
      .to(cases[index].querySelector('.case-visual'), { y: 0, opacity: 1, duration: .62, ease: REVEAL }, at + .16)
      .to(cases[index].querySelector('.case-grid'), { y: 0, opacity: 1, duration: .52, ease: REVEAL }, at + .22);
  }

  function hideCase(index, at) {
    workTL
      .to(cases[index].querySelector('.case-lead'), { y: -14, opacity: 0, duration: .35, ease: GEOM }, at)
      .to(cases[index].querySelector('.case-visual'), { y: -18, opacity: .15, duration: .42, ease: GEOM }, at)
      .to(cases[index].querySelector('.case-grid'), { y: -14, opacity: 0, duration: .35, ease: GEOM }, at + .02)
      .to(cases[index], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: .5, ease: GEOM }, at + .18);
  }

  // Work list -> Qualtrics.
  workTL
    .to('.work-heading', { y: -58, opacity: .25, duration: .65, ease: GEOM }, 0)
    .to('.work-copy', { y: -42, opacity: .22, duration: .65, ease: GEOM }, 0)
    .to(projects[0], { x: -196, y: absY('qualtrics', card.qualtrics.top), width: 1392, height: card.qualtrics.height, backgroundColor: '#fff', opacity: 1, filter: 'blur(0px)', duration: .82, ease: GEOM }, .02)
    .to(bars[0], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: .78, ease: GEOM }, .02)
    .to(bars[0].querySelector('.chev'), { rotation: 180, duration: .6, ease: GEOM }, .16)
    .to(projects[1], { y: 285, filter: 'blur(2px)', opacity: .5, duration: .78, ease: GEOM }, .04)
    .to(projects[2], { y: 247, filter: 'blur(2px)', opacity: .45, duration: .78, ease: GEOM }, .05)
    .to(projects[3], { y: 210, filter: 'blur(2px)', opacity: .4, duration: .78, ease: GEOM }, .06);
  revealCase(0, .34);
  workTL.addLabel('qualtrics').to(hold[0], { v: 1, duration: .52 });

  // Qualtrics -> Travel.
  let t = workTL.duration();
  hideCase(0, t);
  workTL
    .to(projects[0], { x: 0, y: absY('qualtrics', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2px)', opacity: .42, duration: .78, ease: GEOM }, t + .12)
    .to(bars[0], { paddingLeft: 0, paddingRight: 0, borderColor: '#000', duration: .7, ease: GEOM }, t + .12)
    .to(bars[0].querySelector('.chev'), { rotation: 0, duration: .55, ease: GEOM }, t + .14)
    .to(projects[1], { x: -196, y: absY('travel', card.travel.top), width: 1392, height: card.travel.height, backgroundColor: '#fff', filter: 'blur(0px)', opacity: 1, duration: .84, ease: GEOM }, t + .08)
    .to(bars[1], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: .78, ease: GEOM }, t + .08)
    .to(bars[1].querySelector('.chev'), { rotation: 180, duration: .58, ease: GEOM }, t + .2)
    .to(projects[2], { y: 200, opacity: .45, filter: 'blur(2px)', duration: .75, ease: GEOM }, t + .12)
    .to(projects[3], { y: 165, opacity: .4, filter: 'blur(2px)', duration: .75, ease: GEOM }, t + .13);
  revealCase(1, t + .42);
  workTL.addLabel('travel').to(hold[1], { v: 1, duration: .52 });

  // Travel -> Investing.
  t = workTL.duration();
  hideCase(1, t);
  workTL
    .to(projects[0], { y: absY('qualtrics', -72), opacity: .08, filter: 'blur(6px)', duration: .65, ease: GEOM }, t + .08)
    .to(projects[1], { x: 0, y: absY('travel', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2px)', opacity: .42, duration: .78, ease: GEOM }, t + .12)
    .to(bars[1], { paddingLeft: 0, paddingRight: 0, borderColor: '#000', duration: .7, ease: GEOM }, t + .12)
    .to(bars[1].querySelector('.chev'), { rotation: 0, duration: .55, ease: GEOM }, t + .14)
    .to(projects[2], { x: -196, y: absY('investing', card.investing.top), width: 1392, height: card.investing.height, backgroundColor: '#fff', filter: 'blur(0px)', opacity: 1, duration: .84, ease: GEOM }, t + .08)
    .to(bars[2], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: .78, ease: GEOM }, t + .08)
    .to(bars[2].querySelector('.chev'), { rotation: 180, duration: .58, ease: GEOM }, t + .2)
    .to(projects[3], { y: 115, opacity: .42, filter: 'blur(2px)', duration: .75, ease: GEOM }, t + .13);
  revealCase(2, t + .42);
  workTL.addLabel('investing').to(hold[2], { v: 1, duration: .52 });

  // Investing -> Clinical. Leave Clinical fully present at the end: no empty outro.
  t = workTL.duration();
  hideCase(2, t);
  workTL
    .to(projects[1], { y: absY('travel', -72), opacity: .08, filter: 'blur(6px)', duration: .65, ease: GEOM }, t + .08)
    .to(projects[2], { x: 0, y: absY('investing', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2px)', opacity: .42, duration: .78, ease: GEOM }, t + .12)
    .to(bars[2], { paddingLeft: 0, paddingRight: 0, borderColor: '#000', duration: .7, ease: GEOM }, t + .12)
    .to(bars[2].querySelector('.chev'), { rotation: 0, duration: .55, ease: GEOM }, t + .14)
    .to(projects[3], { x: -196, y: absY('clinical', card.clinical.top), width: 1392, height: card.clinical.height, backgroundColor: '#fff', filter: 'blur(0px)', opacity: 1, duration: .84, ease: GEOM }, t + .08)
    .to(bars[3], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: .78, ease: GEOM }, t + .08)
    .to(bars[3].querySelector('.chev'), { rotation: 180, duration: .58, ease: GEOM }, t + .2);
  revealCase(3, t + .42);
  workTL.addLabel('clinical').to(hold[3], { v: 1, duration: .64 });

  function updateActiveProject(progress) {
    if (!workTL) return;
    const labels = projectNames.map(name => ({ name, p: workTL.labels[name] / workTL.duration() }));
    let active = null;
    let dist = Infinity;
    labels.forEach(item => {
      const d = Math.abs(item.p - progress);
      if (d < dist) { dist = d; active = item.name; }
    });
    projects.forEach(project => project.classList.toggle('is-active', project.dataset.project === active && dist < .12));
  }

  // Approach appears directly from the previous state; no blank transition phase.
  const approachTL = gsap.timeline({
    scrollTrigger: {
      id: 'approachPin',
      trigger: '.approach-chapter',
      start: 'top top',
      end: '+=78%',
      pin: '.approach-viewport',
      scrub: .45,
      anticipatePin: 1
    }
  });
  approachTL
    .fromTo('.approach-mini', { y: 42, opacity: .25 }, { y: 0, opacity: 1, duration: .75, ease: GEOM }, 0)
    .fromTo('.approach-board-a', { y: 62, clipPath: 'inset(18% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', duration: .9, ease: GEOM }, .02)
    .fromTo('.approach-board-b', { y: 88, clipPath: 'inset(24% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', duration: .95, ease: GEOM }, .06)
    .fromTo('.approach-copy', { y: 26, opacity: .4 }, { y: 0, opacity: 1, duration: .7, ease: REVEAL }, .08);

  const teamsTL = gsap.timeline({
    scrollTrigger: {
      id: 'teamsPin',
      trigger: '.teams-chapter',
      start: 'top top',
      end: '+=55%',
      pin: '.teams-viewport',
      scrub: .4,
      anticipatePin: 1
    }
  });
  teamsTL
    .fromTo('.teams-photo-wrap', { clipPath: 'inset(0 100% 0 0)', x: -24 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: .78, ease: GEOM }, 0)
    .fromTo('.teams-photo', { scale: 1.035 }, { scale: 1, duration: .9, ease: GEOM }, 0)
    .fromTo('.teams-copy', { x: 38, opacity: .18 }, { x: 0, opacity: 1, duration: .68, ease: REVEAL }, .12)
    .fromTo('.contact', { y: 24, opacity: .25 }, { y: 0, opacity: 1, duration: .62, ease: REVEAL }, .18);

  function workLabelScroll(label) {
    const trigger = workTL.scrollTrigger;
    const labelTime = workTL.labels[label];
    if (labelTime == null || !trigger) return null;
    return trigger.start + (labelTime / workTL.duration()) * (trigger.end - trigger.start);
  }

  function getStateTargets() {
    const hero = ScrollTrigger.getById('heroPin');
    const work = ScrollTrigger.getById('workPin');
    const approach = ScrollTrigger.getById('approachPin');
    const teams = ScrollTrigger.getById('teamsPin');
    if (!hero || !work || !approach || !teams) return [];
    return [
      { name: 'hero', y: hero.start },
      { name: 'work', y: work.start },
      ...projectNames.map(name => ({ name, y: workLabelScroll(name) })),
      { name: 'approach', y: approach.start },
      { name: 'teams', y: teams.start }
    ].filter(item => Number.isFinite(item.y));
  }

  function nearestStateIndex(targets, y = window.scrollY) {
    let nearest = 0;
    for (let i = 1; i < targets.length; i++) {
      if (Math.abs(targets[i].y - y) < Math.abs(targets[nearest].y - y)) nearest = i;
    }
    return nearest;
  }

  function navigateToY(y, duration = .82) {
    navigating = true;
    clearTimeout(navUnlockTimer);
    gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        navUnlockTimer = setTimeout(() => { navigating = false; }, 120);
      }
    });
  }

  function navigateToState(name) {
    const target = getStateTargets().find(item => item.name === name);
    if (target) navigateToY(target.y);
  }

  // Desktop/trackpad: every deliberate scroll gesture resolves to one designed viewport state.
  const discreteInput = matchMedia('(min-width: 901px) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (discreteInput) {
    window.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) < 8) return;
      event.preventDefault();
      if (navigating) return;
      const targets = getStateTargets();
      if (!targets.length) return;
      const current = nearestStateIndex(targets);
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(targets.length - 1, current + direction));
      if (next !== current) navigateToY(targets[next].y);
    }, { passive: false });
  }

  document.addEventListener('click', event => {
    const project = event.target.closest('.js-project');
    if (project) {
      event.preventDefault();
      navigateToState(project.dataset.projectTarget);
      return;
    }

    const section = event.target.closest('.js-section');
    if (section) {
      event.preventDefault();
      navigateToState(section.dataset.section);
      return;
    }

    const step = event.target.closest('.js-work-step');
    if (step) {
      event.preventDefault();
      const targets = getStateTargets();
      const current = nearestStateIndex(targets);
      const direction = Number(step.dataset.direction);
      const next = Math.max(0, Math.min(targets.length - 1, current + direction));
      navigateToY(targets[next].y);
    }
  });

  // Keep pointer response restrained; no spring return.
  bars.forEach(bar => {
    const title = bar.querySelector('strong');
    const chev = bar.querySelector('.chev');
    bar.addEventListener('pointermove', event => {
      const r = bar.getBoundingClientRect();
      const nx = (event.clientX - r.left) / r.width - .5;
      gsap.to(title, { x: nx * 6, duration: .4, ease: 'power2.out', overwrite: true });
      gsap.to(chev, { x: nx * 4, duration: .4, ease: 'power2.out', overwrite: true });
    });
    bar.addEventListener('pointerleave', () => {
      gsap.to([title, chev], { x: 0, duration: .55, ease: 'power2.out', overwrite: true });
    });
  });

  if (workStage) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const pointerLoop = () => {
      currentX += (targetX - currentX) * .045;
      currentY += (targetY - currentY) * .045;
      workStage.style.setProperty('--mx', currentX.toFixed(3));
      workStage.style.setProperty('--my', currentY.toFixed(3));
      requestAnimationFrame(pointerLoop);
    };
    requestAnimationFrame(pointerLoop);
    workStage.addEventListener('pointermove', event => {
      const r = workStage.getBoundingClientRect();
      targetX = ((event.clientX - r.left) / r.width - .5) * 2;
      targetY = ((event.clientY - r.top) / r.height - .5) * 2;
    });
    workStage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  }

  window.addEventListener('resize', () => {
    scaleStages();
    ScrollTrigger.refresh();
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  ScrollTrigger.refresh();
})();
