const modal = document.getElementById('callback-modal');
  const openBtn = document.getElementById('open-form');
  const closeBtn = document.getElementById('close-form');
  const submitBtn = document.getElementById('submit-btn');
  const closeAfterSubmitBtn = document.getElementById('close-after-submit');
  const form = document.getElementById('callback-form');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const phoneInput = document.getElementById('phone-input');
  const phoneError = document.getElementById('phone-error');

  function showResult(title, message) {
    form.style.display = "none";
    document.querySelector('.modal-header').style.display = "none";

    modalTitle.style.display = "block";
    modalTitle.textContent = title;

    modalMessage.style.display = "block";
    modalMessage.textContent = message;

    submitBtn.style.display = "none";
    closeAfterSubmitBtn.style.display = "block";
    if (modal.classList.contains('show')) closeAfterSubmitBtn.focus();
  }

  // Открытие
  openBtn.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.classList.add("modal-open");

    modalTitle.style.display = "none";
    modalMessage.style.display = "none";
    form.style.display = "";
    phoneError.style.display = "none";
    phoneInput.classList.remove("input-error");
    submitBtn.style.display = "block";
    closeAfterSubmitBtn.style.display = "none";
    document.querySelector('.modal-header').style.display = "";

    setTimeout(() => {
      if (modal.classList.contains('show')) document.getElementById("name-field").focus();
    }, 150);
  });

  function closeModal() {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    openBtn.focus();
  }

  // Закрытие
  closeBtn.addEventListener('click', () => {
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Мягкая валидация телефона
  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7; // Не слишком строго, но от спама спасает
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const phone = phoneInput.value.trim();
    if (!isValidPhone(phone)) {
        phoneError.textContent = "Укажите корректный номер телефона";
        phoneError.style.display = "block";
        phoneInput.classList.add("input-error");

        modalMessage.style.display = "none"; // скрыть верхнее сообщение
        return;
    }

    // Телефон валиден — очищаем ошибку
    phoneError.style.display = "none";
    phoneInput.classList.remove("input-error");

    const formData = new FormData(form);

    const original = submitBtn.textContent;
    submitBtn.textContent = "Отправляется...";
    submitBtn.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
          showResult("Готово!", "Спасибо! Я перезвоню вам в ближайшее время.");
      } else {
          showResult("Ошибка", "Извините, не получилось отправить сообщение.");
      }

    } catch (err) {
      showResult("Ошибка", "Извините, не получилось отправить сообщение.");
    } finally {
      submitBtn.textContent = original;
      submitBtn.disabled = false;
    }
  });

  closeAfterSubmitBtn.addEventListener('click', () => {
    closeModal();

    form.reset();
    form.style.display = "";

    modalTitle.style.display = "none";
    modalMessage.style.display = "none";

    submitBtn.style.display = "block";
    closeAfterSubmitBtn.style.display = "none";

    document.querySelector('.modal-header').style.display = "flex";

    phoneError.style.display = "none";
    phoneInput.classList.remove("input-error");
  });


  function updateHeaderOffset() {
    const header = document.querySelector('header');
    const inner = header.querySelector('.header-inner');
    const brand = header.querySelector('.brand');
    const gap = parseFloat(getComputedStyle(inner).rowGap) || 0;
    const hiddenHeight = window.matchMedia('(max-width:700px)').matches
      ? brand.offsetHeight + gap : 0;
    document.documentElement.style.setProperty('--mobile-header-top', -hiddenHeight + 'px');
    document.documentElement.style.setProperty('--header-offset', (header.offsetHeight - hiddenHeight + 16) + 'px');
  }

  updateHeaderOffset();

  window.addEventListener('resize', updateHeaderOffset);
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeaderOffset).observe(document.querySelector('header'));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('show')) closeBtn.click();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button, input:not([type="hidden"]), textarea')]
      .filter(control => !control.disabled && control.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

// Full-size photographs; links still open the source image without JavaScript.
const photoLinks = [...document.querySelectorAll('a[data-gallery]')];
const viewer = document.getElementById('photo-viewer');
if (viewer && photoLinks.length) {
  if (photoLinks.length < 2) viewer.querySelector('.viewer-navigation').hidden = true;
  let photoIndex = 0;
  let photoTrigger = null;
  function displayPhoto(index) {
    photoIndex = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[photoIndex];
    const image = document.getElementById('photo-full');
    image.src = link.href;
    image.alt = link.dataset.caption;
    document.getElementById('photo-caption').textContent = link.dataset.caption;
    document.getElementById('photo-count').textContent = `${photoIndex + 1} / ${photoLinks.length}`;
  }
  photoLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (!viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      photoTrigger = link;
      displayPhoto(index);
      viewer.showModal();
      document.body.classList.add('image-open');
    });
  });
  document.getElementById('photo-close').addEventListener('click', () => viewer.close());
  document.getElementById('photo-prev').addEventListener('click', () => displayPhoto(photoIndex - 1));
  document.getElementById('photo-next').addEventListener('click', () => displayPhoto(photoIndex + 1));
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(photoIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(photoIndex + 1); }
  });
  viewer.addEventListener('click', (event) => {
    const rect = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('image-open');
    photoTrigger?.focus();
  });

}
