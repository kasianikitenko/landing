(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollToPlugin) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const projectNames = ['qualtrics', 'travel', 'investing', 'clinical'];
  const projects = projectNames.map(name => document.querySelector(`[data-project="${name}"]`));
  const bars = projects.map(project => project.querySelector('.project-bar'));
  const cases = projects.map(project => project.querySelector('.project-case'));
  const workStage = document.getElementById('workStage');
  const holds = Array.from({ length: 6 }, () => ({ v: 0 }));
  const GEOM = 'sine.inOut';
  const REVEAL = 'power2.out';
  const EXIT = 'power2.in';
  let workTL;

  function scaleStages() {
    const scale = Math.min(1, window.innerWidth / 1440, window.innerHeight / 900);
    gsap.set('.design-stage', { scale, transformOrigin: '50% 50%' });
  }

  scaleStages();

  // Deliberately quiet affordance motion: no bounce/overshoot.
  gsap.to('.scroll-cta span', { y: 4, duration: 1.45, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--bottom', { y: 4, duration: 1.55, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--top', { y: -4, duration: 1.55, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // HERO — slow parallax separation rather than a single accelerated exit.
  const heroTL = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'heroPin',
      trigger: '.hero-chapter',
      start: 'top top',
      end: '+=185%',
      pin: '.hero-viewport',
      scrub: 1.25,
      anticipatePin: 1
    }
  });

  heroTL
    .to('.hero-intro', { y: -62, opacity: .28, ease: GEOM }, 0)
    .to('.hero-title span:first-child', { x: -105, y: -98, scale: 1.012, ease: GEOM }, 0)
    .to('.hero-title span:last-child', { x: 88, y: -38, scale: 1.018, ease: GEOM }, 0)
    .to('.hero-about', { y: 82, opacity: .28, filter: 'blur(3px)', ease: GEOM }, .05)
    .to('.scroll-cta', { y: 46, opacity: .08, ease: GEOM }, .08)
    .to('.hero-title', { filter: 'blur(4px)', opacity: .32, ease: GEOM }, .48);

  gsap.set(cases, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
  gsap.set('.project-case > .case-lead, .project-case > .case-visual, .project-case > .case-grid', { opacity: 0, y: 26 });

  const card = {
    qualtrics: { top: 48, height: 723 },
    travel: { top: 126, height: 649 },
    investing: { top: 126, height: 754 },
    clinical: { top: 116, height: 764 }
  };
  const baseY = { qualtrics: 405, travel: 500, investing: 595, clinical: 690 };
  const absY = (name, absoluteTop) => absoluteTop - baseY[name];

  function nearestWorkSnap(value) {
    if (!workTL) return value;
    const labels = ['work', 'qualtrics', 'travel', 'investing', 'clinical'];
    const points = labels.map(label => workTL.labels[label] / workTL.duration());
    return points.reduce((best, point) => Math.abs(point - value) < Math.abs(best - value) ? point : best, points[0]);
  }

  workTL = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'workPin',
      trigger: '.work-chapter',
      start: 'top top',
      end: '+=1120%',
      pin: '.work-viewport',
      scrub: 1.35,
      anticipatePin: 1,
      snap: {
        snapTo: nearestWorkSnap,
        duration: { min: .9, max: 1.45 },
        delay: .3,
        ease: 'sine.inOut',
        inertia: false
      },
      onUpdate: self => updateActiveProject(self.progress)
    }
  });

  workTL.addLabel('work', 0);

  // LIST -> QUALTRICS: geometry leads, content follows later.
  workTL
    .to('.work-heading', { y: -88, opacity: .12, filter: 'blur(4px)', duration: 1.2, ease: GEOM }, 0)
    .to('.work-copy', { y: -62, opacity: .12, filter: 'blur(3px)', duration: 1.15, ease: GEOM }, .08)
    .to(projects[0], { x: -196, y: absY('qualtrics', card.qualtrics.top), width: 1392, height: card.qualtrics.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.9, ease: GEOM }, .05)
    .to(bars[0], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.8, ease: GEOM }, .05)
    .to(bars[0].querySelector('.chev'), { rotation: 180, duration: 1.35, ease: GEOM }, .28)
    .to(projects[1], { y: 285, filter: 'blur(2px)', opacity: .5, duration: 1.85, ease: GEOM }, .08)
    .to(projects[2], { y: 247, filter: 'blur(2px)', opacity: .45, duration: 1.9, ease: GEOM }, .12)
    .to(projects[3], { y: 210, filter: 'blur(2px)', opacity: .4, duration: 1.95, ease: GEOM }, .16)
    .to(cases[0], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: 1.25, ease: REVEAL }, .72)
    .to(cases[0].querySelector('.case-lead'), { y: 0, opacity: 1, duration: 1.0, ease: REVEAL }, .9)
    .to(cases[0].querySelector('.case-visual'), { y: 0, opacity: 1, duration: 1.2, ease: REVEAL }, 1.02)
    .to(cases[0].querySelector('.case-grid'), { y: 0, opacity: 1, duration: 1.0, ease: REVEAL }, 1.16)
    .addLabel('qualtrics')
    .to(holds[0], { v: 1, duration: 1.25, ease: 'none' });

  // QUALTRICS -> TRAVEL: outgoing content glides away while the next row grows underneath.
  const qt = workTL.duration();
  workTL
    .to(cases[0].querySelector('.case-visual'), { y: -48, scale: 1.008, opacity: .28, duration: 1.05, ease: GEOM }, qt)
    .to(cases[0].querySelector('.case-lead'), { y: -22, opacity: .08, duration: .9, ease: GEOM }, qt + .06)
    .to(cases[0].querySelector('.case-grid'), { y: -26, opacity: .08, duration: .95, ease: GEOM }, qt + .08)
    .to(cases[0], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 1.2, ease: GEOM }, qt + .42)
    .to(projects[0], { x: 0, y: absY('qualtrics', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.2px)', opacity: .42, duration: 1.75, ease: GEOM }, qt + .34)
    .to(bars[0], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: 1.65, ease: GEOM }, qt + .34)
    .to(bars[0].querySelector('.chev'), { rotation: 0, duration: 1.25, ease: GEOM }, qt + .42)
    .to(projects[1], { x: -196, y: absY('travel', card.travel.top), width: 1392, height: card.travel.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.9, ease: GEOM }, qt + .24)
    .to(bars[1], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.8, ease: GEOM }, qt + .24)
    .to(bars[1].querySelector('.chev'), { rotation: 180, duration: 1.3, ease: GEOM }, qt + .52)
    .to(projects[2], { y: 200, filter: 'blur(2.2px)', opacity: .46, duration: 1.75, ease: GEOM }, qt + .34)
    .to(projects[3], { y: 165, filter: 'blur(2.2px)', opacity: .4, duration: 1.8, ease: GEOM }, qt + .38)
    .to(cases[1], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: 1.25, ease: REVEAL }, qt + .9)
    .to(cases[1].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .95, ease: REVEAL }, qt + 1.06)
    .to(cases[1].querySelector('.case-visual'), { y: 0, opacity: 1, duration: 1.15, ease: REVEAL }, qt + 1.14)
    .to(cases[1].querySelector('.case-grid'), { y: 0, opacity: 1, duration: 1.0, ease: REVEAL }, qt + 1.28)
    .addLabel('travel')
    .to(holds[1], { v: 1, duration: 1.3, ease: 'none' });

  // TRAVEL -> INVESTING: journey image wipes upward; phones enter with measured stagger, no rotation/overshoot.
  const ti = workTL.duration();
  workTL
    .to(cases[1].querySelector('.case-visual'), { y: -42, clipPath: 'inset(0 0 65% 0)', opacity: .24, duration: 1.05, ease: GEOM }, ti)
    .to(cases[1].querySelector('.case-lead'), { y: -20, opacity: .08, duration: .9, ease: GEOM }, ti + .05)
    .to(cases[1].querySelector('.case-grid'), { y: -24, opacity: .08, duration: .95, ease: GEOM }, ti + .06)
    .to(cases[1], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 1.15, ease: GEOM }, ti + .38)
    .to(projects[0], { y: absY('qualtrics', -80), opacity: .1, filter: 'blur(6px)', duration: 1.35, ease: GEOM }, ti + .28)
    .to(projects[1], { x: 0, y: absY('travel', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.2px)', opacity: .42, duration: 1.75, ease: GEOM }, ti + .3)
    .to(bars[1], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: 1.65, ease: GEOM }, ti + .3)
    .to(bars[1].querySelector('.chev'), { rotation: 0, duration: 1.2, ease: GEOM }, ti + .38)
    .to(projects[2], { x: -196, y: absY('investing', card.investing.top), width: 1392, height: card.investing.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.9, ease: GEOM }, ti + .22)
    .to(bars[2], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.8, ease: GEOM }, ti + .22)
    .to(bars[2].querySelector('.chev'), { rotation: 180, duration: 1.3, ease: GEOM }, ti + .5)
    .to(projects[3], { y: 115, filter: 'blur(2.2px)', opacity: .43, duration: 1.75, ease: GEOM }, ti + .32)
    .to(cases[2], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: 1.25, ease: REVEAL }, ti + .88)
    .to(cases[2].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .95, ease: REVEAL }, ti + 1.04)
    .to(cases[2].querySelector('.case-visual'), { y: 0, opacity: 1, duration: 1.1, ease: REVEAL }, ti + 1.12)
    .fromTo(cases[2].querySelectorAll('.invest-gallery img'), { y: 36, opacity: .35 }, { y: 0, opacity: 1, duration: .95, stagger: .075, ease: REVEAL }, ti + 1.18)
    .to(cases[2].querySelector('.case-grid'), { y: 0, opacity: 1, duration: 1.0, ease: REVEAL }, ti + 1.3)
    .addLabel('investing')
    .to(holds[2], { v: 1, duration: 1.35, ease: 'none' });

  // INVESTING -> CLINICAL: phones peel away gently; dashboards enter horizontally with weight.
  const ic = workTL.duration();
  workTL
    .to(cases[2].querySelectorAll('.invest-gallery img'), { y: -46, opacity: .12, stagger: .055, duration: .85, ease: GEOM }, ic)
    .to(cases[2].querySelector('.case-lead'), { y: -18, opacity: .08, duration: .88, ease: GEOM }, ic + .04)
    .to(cases[2].querySelector('.case-grid'), { y: -22, opacity: .08, duration: .92, ease: GEOM }, ic + .06)
    .to(cases[2], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 1.15, ease: GEOM }, ic + .38)
    .to(projects[1], { y: absY('travel', -80), opacity: .09, filter: 'blur(6px)', duration: 1.3, ease: GEOM }, ic + .27)
    .to(projects[2], { x: 0, y: absY('investing', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.2px)', opacity: .42, duration: 1.75, ease: GEOM }, ic + .3)
    .to(bars[2], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: 1.65, ease: GEOM }, ic + .3)
    .to(bars[2].querySelector('.chev'), { rotation: 0, duration: 1.2, ease: GEOM }, ic + .38)
    .to(projects[3], { x: -196, y: absY('clinical', card.clinical.top), width: 1392, height: card.clinical.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.9, ease: GEOM }, ic + .22)
    .to(bars[3], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.8, ease: GEOM }, ic + .22)
    .to(bars[3].querySelector('.chev'), { rotation: 180, duration: 1.3, ease: GEOM }, ic + .5)
    .to(cases[3], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: 1.25, ease: REVEAL }, ic + .9)
    .to(cases[3].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .95, ease: REVEAL }, ic + 1.06)
    .fromTo(cases[3].querySelector('.clinical-gallery img:first-child'), { x: -42, opacity: .45 }, { x: 0, opacity: 1, duration: 1.15, ease: REVEAL }, ic + 1.12)
    .fromTo(cases[3].querySelector('.clinical-gallery img:last-child'), { x: 48, opacity: .45 }, { x: 0, opacity: 1, duration: 1.2, ease: REVEAL }, ic + 1.16)
    .to(cases[3].querySelector('.case-visual'), { y: 0, opacity: 1, duration: 1.1, ease: REVEAL }, ic + 1.1)
    .to(cases[3].querySelector('.case-grid'), { y: 0, opacity: 1, duration: 1.0, ease: REVEAL }, ic + 1.3)
    .addLabel('clinical')
    .to(holds[3], { v: 1, duration: 1.4, ease: 'none' })
    .to(projects[3], { y: '-=92', scale: .992, filter: 'blur(3px)', opacity: .28, duration: 1.15, ease: GEOM })
    .to(projects[2], { y: '-=68', opacity: .08, filter: 'blur(7px)', duration: 1.1, ease: GEOM }, '<')
    .to('.chapter-arrow', { opacity: 0, duration: .8, ease: GEOM }, '<+.2');

  function updateActiveProject(progress) {
    if (!workTL) return;
    const labels = projectNames.map(name => ({ name, p: workTL.labels[name] / workTL.duration() }));
    let active = null;
    let dist = Infinity;
    labels.forEach(item => {
      const d = Math.abs(item.p - progress);
      if (d < dist) { dist = d; active = item.name; }
    });
    projects.forEach(project => project.classList.toggle('is-active', project.dataset.project === active && dist < .1));
  }

  // APPROACH — layered, controlled parallax; softer settling.
  const approachTL = gsap.timeline({
    scrollTrigger: {
      id: 'approachPin',
      trigger: '.approach-chapter',
      start: 'top top',
      end: '+=210%',
      pin: '.approach-viewport',
      scrub: 1.3,
      anticipatePin: 1,
      snap: {
        snapTo: [0, .58, 1],
        duration: { min: .9, max: 1.45 },
        delay: .32,
        ease: 'sine.inOut',
        inertia: false
      }
    }
  });

  approachTL
    .fromTo('.approach-mini', { y: 54 }, { y: 0, duration: 1.1, ease: GEOM }, 0)
    .fromTo('.approach-board-a', { y: 88, clipPath: 'inset(22% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: GEOM }, .05)
    .fromTo('.approach-board-b', { y: 126, clipPath: 'inset(32% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.55, ease: GEOM }, .12)
    .fromTo('.approach-copy', { y: 34, opacity: .5 }, { y: 0, opacity: 1, duration: 1.1, ease: REVEAL }, .16)
    .to(holds[4], { v: 1, duration: .9, ease: 'none' })
    .to('.approach-board-a', { y: -68, duration: 1.1, ease: GEOM })
    .to('.approach-board-b', { y: -36, duration: 1.1, ease: GEOM }, '<')
    .to('.approach-mini', { y: -92, opacity: .22, duration: 1.05, ease: GEOM }, '<')
    .to('.approach-copy', { x: 48, opacity: .24, filter: 'blur(3px)', duration: 1.0, ease: GEOM }, '<+.08');

  // TEAMS — editorial reveal with slower mask and image deceleration.
  const teamsTL = gsap.timeline({
    scrollTrigger: {
      id: 'teamsPin',
      trigger: '.teams-chapter',
      start: 'top top',
      end: '+=155%',
      pin: '.teams-viewport',
      scrub: 1.2,
      anticipatePin: 1
    }
  });

  teamsTL
    .fromTo('.teams-photo-wrap', { clipPath: 'inset(0 100% 0 0)', x: -36 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.35, ease: GEOM }, 0)
    .fromTo('.teams-photo', { scale: 1.065, x: -18 }, { scale: 1, x: 0, duration: 1.55, ease: GEOM }, 0)
    .fromTo('.teams-copy', { x: 58, opacity: .08 }, { x: 0, opacity: 1, duration: 1.15, ease: REVEAL }, .24)
    .fromTo('.contact', { y: 38, opacity: .08 }, { y: 0, opacity: 1, duration: 1.05, ease: REVEAL }, .42);

  function workLabelScroll(label) {
    const trigger = workTL.scrollTrigger;
    const t = workTL.labels[label];
    if (t == null || !trigger) return null;
    return trigger.start + (t / workTL.duration()) * (trigger.end - trigger.start);
  }

  function smoothScrollTo(y) {
    gsap.to(window, { scrollTo: y, duration: 1.45, ease: 'sine.inOut', overwrite: true });
  }

  function goWork(label) {
    const y = workLabelScroll(label);
    if (y != null) smoothScrollTo(y);
  }

  function goSection(name) {
    if (name === 'work') {
      const st = ScrollTrigger.getById('workPin');
      if (st) smoothScrollTo(st.start);
      return;
    }
    const id = name === 'hero' ? 'heroPin' : name === 'approach' ? 'approachPin' : name === 'teams' ? 'teamsPin' : null;
    const st = id && ScrollTrigger.getById(id);
    const y = st ? st.start : document.getElementById(name)?.offsetTop;
    if (y != null) smoothScrollTo(y);
  }

  document.addEventListener('click', event => {
    const project = event.target.closest('.js-project');
    if (project) {
      event.preventDefault();
      goWork(project.dataset.projectTarget);
      return;
    }

    const section = event.target.closest('.js-section');
    if (section) {
      event.preventDefault();
      goSection(section.dataset.section);
      return;
    }

    const step = event.target.closest('.js-work-step');
    if (step) {
      event.preventDefault();
      const labels = ['work', 'qualtrics', 'travel', 'investing', 'clinical'];
      const current = workTL.scrollTrigger.progress;
      const points = labels.map(label => workTL.labels[label] / workTL.duration());
      let nearest = 0;
      points.forEach((p, i) => { if (Math.abs(p - current) < Math.abs(points[nearest] - current)) nearest = i; });
      const next = nearest + Number(step.dataset.direction);
      if (next < 0) goSection('hero');
      else if (next >= labels.length) goSection('approach');
      else goWork(labels[next]);
    }
  });

  bars.forEach(bar => {
    const title = bar.querySelector('strong');
    const chev = bar.querySelector('.chev');

    bar.addEventListener('pointermove', event => {
      const r = bar.getBoundingClientRect();
      const nx = (event.clientX - r.left) / r.width - .5;
      gsap.to(title, { x: nx * 8, duration: .55, ease: 'power2.out', overwrite: true });
      gsap.to(chev, { x: nx * 5, duration: .55, ease: 'power2.out', overwrite: true });
    });

    bar.addEventListener('pointerleave', () => {
      gsap.to(title, { x: 0, duration: .85, ease: 'power2.out', overwrite: true });
      gsap.to(chev, { x: 0, duration: .85, ease: 'power2.out', overwrite: true });
    });
  });

  if (workStage) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const updatePointerParallax = () => {
      currentX += (targetX - currentX) * .065;
      currentY += (targetY - currentY) * .065;
      workStage.style.setProperty('--mx', currentX.toFixed(3));
      workStage.style.setProperty('--my', currentY.toFixed(3));
      requestAnimationFrame(updatePointerParallax);
    };
    requestAnimationFrame(updatePointerParallax);

    workStage.addEventListener('pointermove', event => {
      const r = workStage.getBoundingClientRect();
      targetX = ((event.clientX - r.left) / r.width - .5) * 2;
      targetY = ((event.clientY - r.top) / r.height - .5) * 2;
    });

    workStage.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });
  }

  window.addEventListener('resize', () => {
    scaleStages();
    ScrollTrigger.refresh();
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  ScrollTrigger.refresh();
})();
