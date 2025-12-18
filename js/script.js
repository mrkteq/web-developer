document.addEventListener('DOMContentLoaded', () => {

  const featuredImage = document.getElementById('featured-project');
  const projectTitle = document.querySelector('.project-content h3');
  const projectDescription = document.querySelector('.project-content p');
  const liveButton = document.querySelector('.project-content .button-group a:first-child');
  const sourceButton = document.querySelector('.project-content .button-group a:last-child');
  const grid = document.getElementById('project-grid');

  let allProjects = [];

  function setFeatured(project) {
    if (!project) return;
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
      featuredImage.setAttribute('tabindex', '-1');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      try { featuredImage.focus({ preventScroll: true }); } catch (_) { featuredImage.focus(); }
    });
    return button;
  }

  function renderAllProjects() {
    grid.innerHTML = '';
    allProjects.forEach(p => grid.appendChild(createGridItem(p)));
  }

  async function init() {
    try {
      // Try to load responsive image map if built
      let imageMap = {};
      try {
        const mapRes = await fetch('/js/images-map.json', { cache: 'no-store' });
        if (mapRes.ok) imageMap = await mapRes.json();
      } catch (_) {}

      const res = await fetch('/js/projects.json', { cache: 'no-store' });
      allProjects = await res.json();

      // Merge imageMap into projects by slug
      allProjects = allProjects.map(p => {
        const slug = p.slug || '';
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

      if (allProjects.length > 0) setFeatured(allProjects[0]);
      
      renderAllProjects();
    } catch (e) {
      console.error('Failed to load projects.json', e);
    }
  }

  init();
});