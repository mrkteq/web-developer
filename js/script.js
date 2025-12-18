document.addEventListener('DOMContentLoaded', () => {
  console.log('[INIT] DOMContentLoaded fired');

  const featuredImage = document.getElementById('featured-project');
  const projectTitle = document.querySelector('.project-content h3');
  const projectDescription = document.querySelector('.project-content p');
  const liveButton = document.querySelector('.project-content .button-group a:first-child');
  const sourceButton = document.querySelector('.project-content .button-group a:last-child');
  const grid = document.getElementById('project-grid');
  const loadMoreBtn = document.getElementById('load-more-projects');

  console.log('[INIT] DOM elements found:', {
    featuredImage: !!featuredImage,
    projectTitle: !!projectTitle,
    projectDescription: !!projectDescription,
    liveButton: !!liveButton,
    sourceButton: !!sourceButton,
    grid: !!grid,
    loadMoreBtn: !!loadMoreBtn
  });

  // Pagination settings
  const PAGE_SIZE = 10;
  let allProjects = [];
  let visibleProjects = [];
  let currentPage = 0;
  let totalPages = 0;
  let activeGroup = 'All';

  const GROUP_MAP = {
    // Apps & demos
    'background-generator': 'Apps & Demos',
    'countries-api': 'Apps & Demos',
    'quote-generator': 'Apps & Demos',
    'recipe-finder': 'Apps & Demos',
    'responsive-layout': 'Apps & Demos',
    'robo-friend': 'Apps & Demos',
    'robo-friends': 'Apps & Demos',
    'smart-brain': 'Apps & Demos',
    'starwars-api': 'Apps & Demos',
    'sign-up': 'Apps & Demos',
    'website-startup': 'Apps & Demos',
    'pure-html-and-css': 'Apps & Demos',
    'bed-and-breakfast': 'Apps & Demos',
    'coastal-calm': 'Apps & Demos',
    'heiko-reformas': 'Apps & Demos',
    'it-handyman': 'Apps & Demos',
    'paws-and-hearts': 'Apps & Demos',
    'trusted-house-and-pet-sitters': 'Apps & Demos',
    'reviews-aggregator': 'Apps & Demos',
    'prank': 'Apps & Demos'
    // Everything else falls back to Client Sites
  };

  function getGroupForSlug(slug) {
    return GROUP_MAP[slug] || 'Client Sites';
  }

  function setFeatured(project) {
    if (!project) {
      console.warn('[SET_FEATURED] No project provided');
      return;
    }
    console.log('[SET_FEATURED]', project.slug);
    
    if (project.images && project.images.featured && project.images.featured.srcset) {
      featuredImage.src = project.images.featured.fallback || featuredImage.src;
      featuredImage.srcset = project.images.featured.srcset;
      featuredImage.sizes = '(max-width: 767px) 100vw, 640px';
    } else {
      featuredImage.src = project.images.featured?.src || project.images.thumb?.src || featuredImage.src;
      featuredImage.removeAttribute('srcset');
      featuredImage.removeAttribute('sizes');
    }
    featuredImage.alt = project.images.alt || project.title || featuredImage.alt;
    projectTitle.textContent = project.title || '';
    projectDescription.textContent = project.description || '';
    liveButton.href = project.liveUrl || '#';
    sourceButton.href = project.sourceUrl || '#';
    liveButton.style.display = project.liveUrl ? 'inline-block' : 'none';
    sourceButton.style.display = project.sourceUrl ? 'inline-block' : 'none';
  }

  function createGridItem(project) {
    const button = document.createElement('button');
    button.className = 'project-card';
    button.type = 'button';
    button.setAttribute('aria-label', `View ${project.title}`);

    const img = document.createElement('img');
    img.className = 'project-card-thumb';
    img.alt = project.images.alt || project.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 280;
    img.height = 160;
    if (project.images && project.images.thumb && project.images.thumb.srcset) {
      img.src = project.images.thumb.fallback || '';
      img.srcset = project.images.thumb.srcset;
      img.sizes = '(max-width: 767px) 45vw, (max-width: 1199px) 30vw, 220px';
    } else {
      img.src = project.images.thumb?.src || '';
    }

    const caption = document.createElement('span');
    caption.className = 'project-card-title';
    caption.textContent = project.title;

    button.appendChild(img);
    button.appendChild(caption);

    button.addEventListener('click', () => {
      setFeatured(project);
      const featuredSection = document.querySelector('.featured-project');
      // Ensure the featured image can receive focus for accessibility
      featuredImage.setAttribute('tabindex', '-1');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Move keyboard focus to the featured image without an extra jump
      try { featuredImage.focus({ preventScroll: true }); } catch (_) { featuredImage.focus(); }
    });
    return button;
  }

  function renderPage() {
    console.log('[RENDER_PAGE] Page:', currentPage, 'of', totalPages);
    grid.innerHTML = '';
    const start = currentPage * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, visibleProjects.length);
    const pageItems = visibleProjects.slice(start, end);
    console.log('[RENDER_PAGE] Rendering', pageItems.length, 'items');
    pageItems.forEach(p => grid.appendChild(createGridItem(p)));

    // Update pagination controls
    const prevBtn = document.getElementById('prev-projects');
    if (prevBtn) prevBtn.style.display = currentPage > 0 ? 'inline-block' : 'none';
    if (loadMoreBtn) loadMoreBtn.style.display = currentPage < totalPages - 1 ? 'inline-block' : 'none';

    renderDots();
  }

  function renderDots() {
    let dots = document.getElementById('project-dots');
    const actions = document.querySelector('.project-grid-actions');
    if (!actions) return;

    const nextBtn = loadMoreBtn;
    const prevBtn = document.getElementById('prev-projects');
    if (!dots) {
      dots = document.createElement('div');
      dots.id = 'project-dots';
      dots.className = 'project-dots';
      dots.setAttribute('role', 'tablist');
      // Place dots between prev and next buttons
      actions.insertBefore(dots, nextBtn || null);
    } else if (dots.nextSibling !== nextBtn) {
      // Keep dots positioned before the Next button
      actions.insertBefore(dots, nextBtn || null);
    }
    // Also ensure prev stays on the left when present
    if (prevBtn && prevBtn.nextSibling !== dots) {
      actions.insertBefore(prevBtn, dots);
    }

    dots.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => {
        currentPage = i;
        renderPage();
      });
      dots.appendChild(dot);
    }
  }

  function buildFilters() {
    console.log('[BUILD_FILTERS] Building filter UI');
    const showcase = document.querySelector('.project-showcase');
    if (!showcase) return;
    const container = showcase.querySelector('.container') || showcase;
    let filterBar = document.getElementById('project-filters');
    if (!filterBar) {
      filterBar = document.createElement('div');
      filterBar.id = 'project-filters';
      filterBar.className = 'project-filters';
      filterBar.setAttribute('role', 'toolbar');
      container.insertBefore(filterBar, document.getElementById('project-grid'));
    }

    const groups = new Set(['All']);
    allProjects.forEach(p => groups.add(getGroupForSlug(p.slug || '')));
    console.log('[BUILD_FILTERS] Groups:', Array.from(groups));

    filterBar.innerHTML = '';
    groups.forEach(group => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip';
      btn.textContent = group;
      btn.setAttribute('aria-pressed', group === activeGroup ? 'true' : 'false');
      btn.addEventListener('click', () => {
        activeGroup = group;
        applyFilter();
        buildFilters();
      });
      filterBar.appendChild(btn);
    });
  }

  function applyFilter() {
    console.log('[APPLY_FILTER] Active group:', activeGroup);
    visibleProjects = activeGroup === 'All'
      ? [...allProjects]
      : allProjects.filter(p => getGroupForSlug(p.slug || '') === activeGroup);
    console.log('[APPLY_FILTER] Visible projects:', visibleProjects.length);
    currentPage = 0;
    totalPages = Math.ceil(visibleProjects.length / PAGE_SIZE) || 1;
    if (visibleProjects.length > 0) setFeatured(visibleProjects[0]);
    renderPage();
  }

  async function init() {
    console.log('[INIT] Starting initialization');
    try {
      // Try to load responsive image map if built
      let imageMap = {};
      try {
        console.log('[INIT] Fetching images-map.json');
        const mapRes = await fetch('/js/images-map.json', { cache: 'no-store' });
        console.log('[INIT] images-map.json response status:', mapRes.status);
        if (mapRes.ok) {
          imageMap = await mapRes.json();
          console.log('[INIT] images-map.json loaded, keys:', Object.keys(imageMap).length);
        }
      } catch (err) {
        console.warn('[INIT] Could not load images-map.json:', err.message);
      }

      console.log('[INIT] Fetching projects.json');
      const res = await fetch('/js/projects.json', { cache: 'no-store' });
      console.log('[INIT] projects.json response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      allProjects = await res.json();
      console.log('[INIT] Loaded projects:', allProjects.length);

      // Merge imageMap into projects by slug
      allProjects = allProjects.map(p => {
        const slug = p.slug || '';
        // Handle renamed/mismatched slugs between data and generated images
        const aliasSlug = slug === 'background-generator' ? 'background-gen' : slug;
        const map = imageMap[aliasSlug];
        if (map) {
          p.images = p.images || {};
          p.images.thumb = {
            ...(p.images.thumb || {}),
            srcset: map.thumb?.srcset,
            fallback: map.thumb?.fallback
          };
          p.images.featured = {
            ...(p.images.featured || {}),
            srcset: map.hero?.srcset,
            fallback: map.hero?.fallback
          };
        }
        return p;
      });

      if (allProjects.length > 0) {
        console.log('[INIT] Setting first project as featured');
        setFeatured(allProjects[0]);
      } else {
        console.warn('[INIT] No projects loaded');
      }

      // Setup pagination controls
      totalPages = Math.ceil(allProjects.length / PAGE_SIZE);
      console.log('[INIT] Total pages:', totalPages);
      
      if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Next';
        loadMoreBtn.setAttribute('aria-label', 'Load next page of projects');
      }
      const actions = document.querySelector('.project-grid-actions');
      if (actions && !document.getElementById('prev-projects')) {
        const prevBtn = document.createElement('button');
        prevBtn.id = 'prev-projects';
        prevBtn.className = 'button blue';
        prevBtn.textContent = 'Previous';
        prevBtn.setAttribute('aria-label', 'Load previous page of projects');
        prevBtn.style.display = 'none';
        actions.insertBefore(prevBtn, loadMoreBtn || null);

        prevBtn.addEventListener('click', () => {
          if (currentPage > 0) {
            currentPage -= 1;
            renderPage();
          }
        });
      }

      // Build filters and apply default
      visibleProjects = [...allProjects];
      buildFilters();
      applyFilter();
      
      console.log('[INIT] Initialization complete');
    } catch (e) {
      console.error('[INIT] Failed to load projects:', e);
      if (grid) {
        grid.innerHTML = '<p style="color:red;padding:20px;">Failed to load projects. Check console for details.</p>';
      }
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (currentPage < totalPages - 1) {
        currentPage += 1;
        renderPage();
      }
    });
  }
  
  init();
});