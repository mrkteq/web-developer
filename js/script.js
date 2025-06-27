document.addEventListener('DOMContentLoaded', () => {
  const featured = document.getElementById('featured-project');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const slider = document.querySelector('.project-slider');
  const prevBtn = document.querySelector('.slider-nav.prev');
  const nextBtn = document.querySelector('.slider-nav.next');
  const projectTitle = document.querySelector('.project-content h3');
  const projectDescription = document.querySelector('.project-content p');
  const liveButton = document.querySelector('.project-content .button-group a:first-child');
  const sourceButton = document.querySelector('.project-content .button-group a:last-child');

  // Handle thumbnail clicks
  thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
          // Update featured image
          featured.src = thumb.src;
          featured.alt = thumb.alt;

          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');

          // Update project details
          projectTitle.textContent = thumb.dataset.title;
          projectDescription.textContent = thumb.dataset.description;

          // Update button URLs
          liveButton.href = thumb.dataset.liveUrl || '#';
          sourceButton.href = thumb.dataset.sourceUrl || '#';

          // Optionally hide buttons if URLs aren't provided
          liveButton.style.display = thumb.dataset.liveUrl ? 'inline-block' : 'none';
          sourceButton.style.display = thumb.dataset.sourceUrl ? 'inline-block' : 'none';
      });
  });

  // Handle slider navigation
  prevBtn.addEventListener('click', () => {
      slider.scrollBy({
          left: -200,
          behavior: 'smooth'
      });
  });

  nextBtn.addEventListener('click', () => {
      slider.scrollBy({
          left: 200,
          behavior: 'smooth'
      });
  });

  // Ensure correct active thumbnail on load
  const setActiveThumbnailOnLoad = () => {
    const featuredSrc = featured.src;
    let found = false;
    thumbnails.forEach(thumb => {
      if (thumb.src === featuredSrc && !found) {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        // Optionally update project details/buttons as if clicked
        projectTitle.textContent = thumb.dataset.title;
        projectDescription.textContent = thumb.dataset.description;
        liveButton.href = thumb.dataset.liveUrl || '#';
        sourceButton.href = thumb.dataset.sourceUrl || '#';
        liveButton.style.display = thumb.dataset.liveUrl ? 'inline-block' : 'none';
        sourceButton.style.display = thumb.dataset.sourceUrl ? 'inline-block' : 'none';
        found = true;
      }
    });
  };

  setActiveThumbnailOnLoad();
});