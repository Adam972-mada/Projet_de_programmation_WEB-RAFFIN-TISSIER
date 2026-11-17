    document.addEventListener("DOMContentLoaded", () => {
  // 1. Gestion du carrousel horizontal (boutons de défilement)
  const wrappers = document.querySelectorAll(".photos-scroll-wrapper");

  wrappers.forEach(wrapper => {
    const container = wrapper.querySelector(".photos-container");
    const prevBtn = wrapper.querySelector(".prev-btn");
    const nextBtn = wrapper.querySelector(".next-btn");

    if (!container || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener("click", () => {
      const firstFigure = container.querySelector("figure");
      const step = firstFigure ? firstFigure.offsetWidth + 20 : 350;
      container.scrollBy({ left: -step, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      const firstFigure = container.querySelector("figure");
      const step = firstFigure ? firstFigure.offsetWidth + 20 : 350;
      container.scrollBy({ left: step, behavior: "smooth" });
    });
  });

  // 2. Gestion de la visionneuse (affichage de la photo en grand au clic)
  // Création dynamique de la structure HTML de la modale dans la page
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightbox");
  lightbox.innerHTML = `
    <span class="lightbox-close">×</span>
    <img src="" alt="Agrandissement">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  // Écoute le clic sur toutes les images à l'intérieur des carrousels
  document.querySelectorAll(".photos-container figure img").forEach(img => {
    img.addEventListener("click", (e) => {
      e.stopPropagation(); // Évite les conflits de clic
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    });
  });

  // Fermer la modale au clic sur la croix ou sur le fond sombre
  const closeLightbox = () => {
    lightbox.style.display = "none";
    lightboxImg.src = "";
  };

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", closeLightbox);
});