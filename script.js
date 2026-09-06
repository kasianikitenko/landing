(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollToPlugin) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const projectNames = ['qualtrics', 'travel', 'investing', 'clinical'];
  const projects = projectNames.map(name => document.querySelector(`[data-project="${name}"]`));
  const bars = projects.map(project => project.querySelector('.project-bar'));
  const cases = projects.map(project => project.querySelector('.project-case'));
  const workStage = document.getElementById('workStage');
  const holds = [{v:0},{v:0},{v:0},{v:0},{v:0}];
  let workTL;

  function scaleStages() {
    const scale = Math.min(1, window.innerWidth / 1440, window.innerHeight / 900);
    gsap.set('.design-stage', { scale, transformOrigin: '50% 50%' });
  }

  scaleStages();

  gsap.to('.scroll-cta span', { y: 8, duration: .85, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--bottom', { y: 7, duration: .95, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.chapter-arrow--top', { y: -7, duration: .95, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  const heroTL = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'heroPin',
      trigger: '.hero-chapter',
      start: 'top top',
      end: '+=150%',
      pin: '.hero-viewport',
      scrub: .75,
      anticipatePin: 1
    }
  });

  heroTL
    .to('.hero-intro', { y: -75, opacity: .15, ease: 'power2.in' }, 0)
    .to('.hero-title span:first-child', { x: -130, y: -115, scale: 1.025, ease: 'power3.in' }, 0)
    .to('.hero-title span:last-child', { x: 115, y: -45, scale: 1.04, ease: 'power3.in' }, 0)
    .to('.hero-about', { y: 115, opacity: .18, filter: 'blur(5px)', ease: 'power2.in' }, .05)
    .to('.scroll-cta', { y: 70, opacity: 0, ease: 'power2.in' }, .08)
    .to('.hero-title', { filter: 'blur(7px)', opacity: .18, ease: 'power2.in' }, .42);

  gsap.set(cases, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
  gsap.set('.project-case > .case-lead, .project-case > .case-visual, .project-case > .case-grid', { opacity: 0, y: 34 });

  const card = {
    qualtrics: { top: 48, height: 723 },
    travel: { top: 126, height: 649 },
    investing: { top: 126, height: 754 },
    clinical: { top: 116, height: 764 }
  };
  const baseY = { qualtrics:405, travel:500, investing:595, clinical:690 };

  function absY(name, absoluteTop) {
    return absoluteTop - baseY[name];
  }

  function nearestWorkSnap(value) {
    if (!workTL) return value;
    const labels = ['work','qualtrics','travel','investing','clinical'];
    const points = labels.map(label => workTL.labels[label] / workTL.duration());
    return points.reduce((best, point) => Math.abs(point - value) < Math.abs(best - value) ? point : best, points[0]);
  }

  workTL = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      id: 'workPin',
      trigger: '.work-chapter',
      start: 'top top',
      end: '+=920%',
      pin: '.work-viewport',
      scrub: .8,
      anticipatePin: 1,
      snap: {
        snapTo: nearestWorkSnap,
        duration: { min: .28, max: .7 },
        delay: .14,
        ease: 'power3.inOut'
      },
      onUpdate: self => updateActiveProject(self.progress)
    }
  });

  workTL.addLabel('work', 0);

  // List -> Qualtrics. The first row becomes the card; the other rows physically make room.
  workTL
    .to('.work-heading', { y: -115, opacity: 0, filter: 'blur(7px)', duration: .72, ease: 'power3.in' }, 0)
    .to('.work-copy', { y: -85, opacity: 0, filter: 'blur(6px)', duration: .65, ease: 'power3.in' }, .05)
    .to(projects[0], { x: -196, y: absY('qualtrics', card.qualtrics.top), width: 1392, height: card.qualtrics.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.18, ease: 'expo.inOut' }, .04)
    .to(bars[0], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.08, ease: 'expo.inOut' }, .04)
    .to(bars[0].querySelector('.chev'), { rotation: 180, duration: .82, ease: 'back.out(1.8)' }, .32)
    .to(projects[1], { y: 285, filter: 'blur(2.2px)', opacity: .48, duration: 1.0 }, .06)
    .to(projects[2], { y: 247, filter: 'blur(2.2px)', opacity: .43, duration: 1.05 }, .08)
    .to(projects[3], { y: 210, filter: 'blur(2.2px)', opacity: .38, duration: 1.08 }, .1)
    .to(cases[0], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: .82, ease: 'power4.out' }, .35)
    .to(cases[0].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .58, ease: 'power3.out' }, .48)
    .to(cases[0].querySelector('.case-visual'), { y: 0, opacity: 1, duration: .76, ease: 'power4.out' }, .56)
    .to(cases[0].querySelector('.case-grid'), { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, .7)
    .addLabel('qualtrics')
    .to(holds[0], { v: 1, duration: .7 });

  // Qualtrics -> Travel. Content is pulled upward first, then the next row expands into the space.
  const qt = workTL.duration();
  workTL
    .to(cases[0].querySelector('.case-visual'), { y: -78, scale: 1.025, opacity: .18, duration: .48, ease: 'power3.in' }, qt)
    .to(cases[0].querySelector('.case-lead'), { y: -38, opacity: 0, duration: .35, ease: 'power2.in' }, qt + .04)
    .to(cases[0].querySelector('.case-grid'), { y: -42, opacity: 0, duration: .38, ease: 'power2.in' }, qt + .05)
    .to(cases[0], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: .55, ease: 'power3.inOut' }, qt + .18)
    .to(projects[0], { x: 0, y: absY('qualtrics', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.3px)', opacity: .4, duration: .92, ease: 'expo.inOut' }, qt + .18)
    .to(bars[0], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: .82, ease: 'expo.inOut' }, qt + .18)
    .to(bars[0].querySelector('.chev'), { rotation: 0, duration: .5 }, qt + .18)
    .to(projects[1], { x: -196, y: absY('travel', card.travel.top), width: 1392, height: card.travel.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.08, ease: 'expo.inOut' }, qt + .14)
    .to(bars[1], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.0, ease: 'expo.inOut' }, qt + .14)
    .to(bars[1].querySelector('.chev'), { rotation: 180, duration: .7, ease: 'back.out(1.7)' }, qt + .4)
    .to(projects[2], { y: 200, filter: 'blur(2.3px)', opacity: .45, duration: .95 }, qt + .18)
    .to(projects[3], { y: 165, filter: 'blur(2.3px)', opacity: .38, duration: .98 }, qt + .2)
    .to(cases[1], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: .72, ease: 'power4.out' }, qt + .48)
    .to(cases[1].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .5, ease: 'power3.out' }, qt + .56)
    .to(cases[1].querySelector('.case-visual'), { y: 0, opacity: 1, duration: .7, ease: 'power4.out' }, qt + .62)
    .to(cases[1].querySelector('.case-grid'), { y: 0, opacity: 1, duration: .55, ease: 'power3.out' }, qt + .74)
    .addLabel('travel')
    .to(holds[1], { v: 1, duration: .72 });

  // Travel -> Investing. The journey image wipes up; the phones arrive independently with staggered inertia.
  const ti = workTL.duration();
  workTL
    .to(cases[1].querySelector('.case-visual'), { y: -64, clipPath: 'inset(0 0 72% 0)', opacity: .15, duration: .48, ease: 'power3.in' }, ti)
    .to(cases[1].querySelector('.case-lead'), { y: -32, opacity: 0, duration: .32 }, ti + .03)
    .to(cases[1].querySelector('.case-grid'), { y: -40, opacity: 0, duration: .36 }, ti + .04)
    .to(cases[1], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: .5 }, ti + .16)
    .to(projects[0], { y: absY('qualtrics', -95), opacity: .08, filter: 'blur(8px)', duration: .7 }, ti + .12)
    .to(projects[1], { x: 0, y: absY('travel', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.4px)', opacity: .4, duration: .9, ease: 'expo.inOut' }, ti + .16)
    .to(bars[1], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: .82, ease: 'expo.inOut' }, ti + .16)
    .to(bars[1].querySelector('.chev'), { rotation: 0, duration: .5 }, ti + .16)
    .to(projects[2], { x: -196, y: absY('investing', card.investing.top), width: 1392, height: card.investing.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.08, ease: 'expo.inOut' }, ti + .12)
    .to(bars[2], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.0, ease: 'expo.inOut' }, ti + .12)
    .to(bars[2].querySelector('.chev'), { rotation: 180, duration: .7, ease: 'back.out(1.7)' }, ti + .38)
    .to(projects[3], { y: 115, filter: 'blur(2.3px)', opacity: .42, duration: .95 }, ti + .17)
    .to(cases[2], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: .72, ease: 'power4.out' }, ti + .44)
    .to(cases[2].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .48, ease: 'power3.out' }, ti + .52)
    .to(cases[2].querySelector('.case-visual'), { y: 0, opacity: 1, duration: .58, ease: 'power4.out' }, ti + .58)
    .fromTo(cases[2].querySelectorAll('.invest-gallery img'), { y: 72, rotation: 2.2 }, { y: 0, rotation: 0, duration: .55, stagger: .045, ease: 'power3.out' }, ti + .62)
    .to(cases[2].querySelector('.case-grid'), { y: 0, opacity: 1, duration: .52, ease: 'power3.out' }, ti + .72)
    .addLabel('investing')
    .to(holds[2], { v: 1, duration: .76 });

  // Investing -> Clinical. Phones peel away at slightly different speeds; the dashboard opens as one wide surface.
  const ic = workTL.duration();
  workTL
    .to(cases[2].querySelectorAll('.invest-gallery img'), { y: -85, opacity: .08, stagger: .035, duration: .42, ease: 'power3.in' }, ic)
    .to(cases[2].querySelector('.case-lead'), { y: -30, opacity: 0, duration: .32 }, ic + .04)
    .to(cases[2].querySelector('.case-grid'), { y: -38, opacity: 0, duration: .36 }, ic + .05)
    .to(cases[2], { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: .5 }, ic + .17)
    .to(projects[1], { y: absY('travel', -95), opacity: .07, filter: 'blur(8px)', duration: .68 }, ic + .12)
    .to(projects[2], { x: 0, y: absY('investing', 76), width: 1000, height: 72, backgroundColor: 'rgba(255,255,255,0)', filter: 'blur(2.4px)', opacity: .4, duration: .9, ease: 'expo.inOut' }, ic + .16)
    .to(bars[2], { paddingLeft: 0, paddingRight: 0, borderColor: '#000000', duration: .82, ease: 'expo.inOut' }, ic + .16)
    .to(bars[2].querySelector('.chev'), { rotation: 0, duration: .5 }, ic + .16)
    .to(projects[3], { x: -196, y: absY('clinical', card.clinical.top), width: 1392, height: card.clinical.height, backgroundColor: '#ffffff', filter: 'blur(0px)', opacity: 1, duration: 1.08, ease: 'expo.inOut' }, ic + .12)
    .to(bars[3], { paddingLeft: 196, paddingRight: 196, borderColor: 'rgba(0,0,0,0)', duration: 1.0, ease: 'expo.inOut' }, ic + .12)
    .to(bars[3].querySelector('.chev'), { rotation: 180, duration: .7, ease: 'back.out(1.7)' }, ic + .38)
    .to(cases[3], { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: .72, ease: 'power4.out' }, ic + .45)
    .to(cases[3].querySelector('.case-lead'), { y: 0, opacity: 1, duration: .48, ease: 'power3.out' }, ic + .53)
    .fromTo(cases[3].querySelector('.clinical-gallery img:first-child'), { x: -80 }, { x: 0, duration: .68, ease: 'power4.out' }, ic + .58)
    .fromTo(cases[3].querySelector('.clinical-gallery img:last-child'), { x: 95 }, { x: 0, duration: .72, ease: 'power4.out' }, ic + .6)
    .to(cases[3].querySelector('.case-visual'), { y: 0, opacity: 1, duration: .58, ease: 'power3.out' }, ic + .58)
    .to(cases[3].querySelector('.case-grid'), { y: 0, opacity: 1, duration: .52, ease: 'power3.out' }, ic + .72)
    .addLabel('clinical')
    .to(holds[3], { v: 1, duration: .82 })
    .to(projects[3], { y: '-=125', scale: .985, filter: 'blur(4px)', opacity: .22, duration: .7, ease: 'power3.in' })
    .to(projects[2], { y: '-=90', opacity: .06, filter: 'blur(9px)', duration: .62 }, '<')
    .to('.chapter-arrow', { opacity: 0, duration: .35 }, '<+.12');

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

  const approachTL = gsap.timeline({
    scrollTrigger: {
      id: 'approachPin',
      trigger: '.approach-chapter',
      start: 'top top',
      end: '+=170%',
      pin: '.approach-viewport',
      scrub: .8,
      anticipatePin: 1,
      snap: { snapTo: [0, .55, 1], duration: {min:.25,max:.6}, delay:.15, ease:'power3.inOut' }
    }
  });
  approachTL
    .fromTo('.approach-mini', { y: 78, rotate: -1.4 }, { y: 0, rotate: 0, duration: .8, ease: 'power4.out' }, 0)
    .fromTo('.approach-board-a', { y: 115, rotate: -.8, clipPath: 'inset(26% 0 0 0)' }, { y: 0, rotate: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.0, ease: 'power4.out' }, .05)
    .fromTo('.approach-board-b', { y: 170, rotate: .9, clipPath: 'inset(38% 0 0 0)' }, { y: 0, rotate: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.out' }, .12)
    .fromTo('.approach-copy', { y: 46, opacity: .35 }, { y: 0, opacity: 1, duration: .72, ease: 'power3.out' }, .12)
    .to(holds[4], { v: 1, duration: .55 })
    .to('.approach-board-a', { y: -95, rotate: .7, duration: .8, ease: 'power2.inOut' })
    .to('.approach-board-b', { y: -48, rotate: -.5, duration: .8, ease: 'power2.inOut' }, '<')
    .to('.approach-mini', { y: -135, opacity: .15, duration: .7, ease: 'power2.in' }, '<')
    .to('.approach-copy', { x: 70, opacity: .18, filter: 'blur(4px)', duration: .65, ease: 'power2.in' }, '<+.08');

  const teamsTL = gsap.timeline({
    scrollTrigger: {
      id: 'teamsPin',
      trigger: '.teams-chapter',
      start: 'top top',
      end: '+=120%',
      pin: '.teams-viewport',
      scrub: .8,
      anticipatePin: 1
    }
  });
  teamsTL
    .fromTo('.teams-photo-wrap', { clipPath: 'inset(0 100% 0 0)', x: -55 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: .9, ease: 'expo.out' }, 0)
    .fromTo('.teams-photo', { scale: 1.12, x: -30 }, { scale: 1, x: 0, duration: 1.05, ease: 'power3.out' }, 0)
    .fromTo('.teams-copy', { x: 85, opacity: 0 }, { x: 0, opacity: 1, duration: .72, ease: 'power3.out' }, .2)
    .fromTo('.contact', { y: 58, opacity: 0 }, { y: 0, opacity: 1, duration: .65, ease: 'power3.out' }, .34);

  function workLabelScroll(label) {
    const trigger = workTL.scrollTrigger;
    const t = workTL.labels[label];
    if (t == null || !trigger) return null;
    return trigger.start + (t / workTL.duration()) * (trigger.end - trigger.start);
  }

  function goWork(label) {
    const y = workLabelScroll(label);
    if (y == null) return;
    gsap.to(window, { scrollTo: y, duration: 1.05, ease: 'power4.inOut', overwrite: true });
  }

  function goSection(name) {
    if (name === 'work') {
      const st = ScrollTrigger.getById('workPin');
      if (st) gsap.to(window, { scrollTo: st.start, duration: 1.05, ease: 'power4.inOut', overwrite: true });
      return;
    }
    const id = name === 'hero' ? 'heroPin' : name === 'approach' ? 'approachPin' : name === 'teams' ? 'teamsPin' : null;
    const st = id && ScrollTrigger.getById(id);
    const y = st ? st.start : document.getElementById(name)?.offsetTop;
    if (y != null) gsap.to(window, { scrollTo: y, duration: 1.05, ease: 'power4.inOut', overwrite: true });
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
      const labels = ['work','qualtrics','travel','investing','clinical'];
      const current = workTL.scrollTrigger.progress;
      const points = labels.map(label => workTL.labels[label] / workTL.duration());
      let nearest = 0;
      points.forEach((p, i) => { if (Math.abs(p-current) < Math.abs(points[nearest]-current)) nearest = i; });
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
      gsap.to(title, { x: nx * 12, duration: .35, ease: 'power3.out', overwrite: true });
      gsap.to(chev, { x: nx * 8, duration: .35, ease: 'power3.out', overwrite: true });
    });
    bar.addEventListener('pointerleave', () => {
      gsap.to(title, { x: 0, duration: .55, ease: 'elastic.out(1,.45)' });
      gsap.to(chev, { x: 0, duration: .55, ease: 'elastic.out(1,.45)' });
    });
  });

  if (workStage) {
    workStage.addEventListener('pointermove', event => {
      const r = workStage.getBoundingClientRect();
      const mx = ((event.clientX - r.left) / r.width - .5) * 2;
      const my = ((event.clientY - r.top) / r.height - .5) * 2;
      workStage.style.setProperty('--mx', mx.toFixed(3));
      workStage.style.setProperty('--my', my.toFixed(3));
    });
    workStage.addEventListener('pointerleave', () => {
      workStage.style.setProperty('--mx', '0');
      workStage.style.setProperty('--my', '0');
    });
  }

  window.addEventListener('resize', () => {
    scaleStages();
    ScrollTrigger.refresh();
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  ScrollTrigger.refresh();
})();
