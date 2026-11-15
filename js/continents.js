    document.querySelectorAll(".photos-scroll-wrapper").forEach(wrapper => {
      const container = wrapper.querySelector(".photos-container");
      const prevBtn = wrapper.querySelector(".prev-btn");
      const nextBtn = wrapper.querySelector(".next-btn");

      prevBtn.addEventListener("click", () => {
        const step = container.querySelector("figure").offsetWidth + 20;
        container.scrollBy({ left: -step, behavior: "smooth" });
      });

      nextBtn.addEventListener("click", () => {
        const step = container.querySelector("figure").offsetWidth + 20;
        container.scrollBy({ left: step, behavior: "smooth" });
      });
    });