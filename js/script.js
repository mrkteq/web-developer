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
    featuredImage.src = project.images.featured.src || featuredImage.src;
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
    img.src = project.images.thumb.src || '';
    img.alt = project.images.alt || project.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 280;
    img.height = 160;

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
      const res = await fetch('js/projects.json', { cache: 'no-store' });
      allProjects = await res.json();

      if (allProjects.length > 0) setFeatured(allProjects[0]);
      
      renderAllProjects();
    } catch (e) {
      console.error('Failed to load projects.json', e);
    }
  }

  init();
});