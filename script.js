const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const announcement = document.querySelector('.announcement');

const updateHeader = () => {
  if (!header || !announcement) return;
  const shouldStick = window.scrollY > announcement.offsetHeight + 100;
  header.classList.toggle('sticky', shouldStick);
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-carousel-nav]').forEach((navigation) => {
  const carousel = document.getElementById(navigation.dataset.carouselTarget);
  if (!carousel) return;

  const items = [...carousel.children];
  const previous = navigation.querySelector('[data-carousel-prev]');
  const next = navigation.querySelector('[data-carousel-next]');
  const current = navigation.querySelector('[data-carousel-current]');
  const total = navigation.querySelector('[data-carousel-total]');

  total.textContent = String(items.length).padStart(2, '0');

  const getCurrentIndex = () => {
    const carouselLeft = carousel.getBoundingClientRect().left;
    return items.reduce((closest, item, index) => {
      const distance = Math.abs(item.getBoundingClientRect().left - carouselLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;
  };

  const updateCarouselNav = () => {
    const index = getCurrentIndex();
    current.textContent = String(index + 1).padStart(2, '0');
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
  };

  const goToItem = (offset) => {
    const index = Math.max(0, Math.min(items.length - 1, getCurrentIndex() + offset));
    const item = items[index];
    carousel.scrollTo({
      left: item.offsetLeft - ((carousel.clientWidth - item.clientWidth) / 2),
      behavior: 'smooth'
    });
  };

  previous.addEventListener('click', () => goToItem(-1));
  next.addEventListener('click', () => goToItem(1));
  carousel.addEventListener('scroll', updateCarouselNav, { passive: true });
  window.addEventListener('resize', updateCarouselNav, { passive: true });
  updateCarouselNav();
});

const pricingFinder = document.querySelector('[data-pricing-finder]');

if (pricingFinder) {
  const pricing = {
    maternity: {
      label: 'Maternity',
      outdoor: ['From LKR 15,000', 'A relaxed outdoor session celebrating your growing family.'],
      indoor: ['From LKR 15,000*', 'A polished indoor maternity session. Studio rental is quoted separately.']
    },
    newborn: {
      label: 'Newborn & Baby',
      outdoor: ['From LKR 15,000', 'A gentle outdoor baby or milestone session.'],
      indoor: ['From LKR 20,000*', 'A calm indoor newborn session. Studio rental is quoted separately.']
    },
    family: {
      label: 'Family & Couple',
      outdoor: ['From LKR 15,000', 'Natural outdoor photographs filled with connection and movement.'],
      indoor: ['From LKR 25,000*', 'A thoughtfully directed indoor family or couple session. Studio rental is separate.']
    },
    birthday: {
      label: 'Birthday',
      outdoor: ['From LKR 20,000', 'An outdoor portrait session for a birthday or milestone celebration.'],
      indoor: ['From LKR 15,000*', 'An indoor birthday portrait session. Studio rental is quoted separately.']
    },
    graduation: {
      label: 'Graduation',
      outdoor: ['From LKR 10,000', 'An individual graduation portrait session marking your achievement.'],
      indoor: ['From LKR 15,000', 'A graduation portrait session designed for a couple.']
    }
  };

  let selectedSession = 'maternity';
  let selectedSetting = 'outdoor';
  const settingQuestion = pricingFinder.querySelector('[data-setting-question]');
  const settingButtons = [...pricingFinder.querySelectorAll('[data-setting-choice]')];
  const resultTitle = pricingFinder.querySelector('[data-result-title]');
  const resultPrice = pricingFinder.querySelector('[data-result-price]');
  const resultNote = pricingFinder.querySelector('[data-result-note]');
  const resultLink = pricingFinder.querySelector('[data-result-link]');

  const updateFinder = () => {
    const isGraduation = selectedSession === 'graduation';
    settingQuestion.textContent = isGraduation ? 'Who is the session for?' : 'Where would you like the session?';
    settingButtons[0].textContent = isGraduation ? 'Individual' : 'Outdoor';
    settingButtons[1].textContent = isGraduation ? 'Couple' : 'Indoor';

    const [price, note] = pricing[selectedSession][selectedSetting];
    const settingLabel = isGraduation
      ? (selectedSetting === 'outdoor' ? 'Individual' : 'Couple')
      : (selectedSetting === 'outdoor' ? 'Outdoor' : 'Indoor');

    resultTitle.textContent = `${pricing[selectedSession].label} · ${settingLabel}`;
    resultPrice.textContent = price;
    resultNote.textContent = note;
    const message = `Hi Sky High Photography, I'm interested in the ${settingLabel.toLowerCase()} ${pricing[selectedSession].label.toLowerCase()} session.`;
    resultLink.href = `https://wa.me/94766538612?text=${encodeURIComponent(message)}`;
  };

  pricingFinder.querySelectorAll('[data-session-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSession = button.dataset.sessionChoice;
      pricingFinder.querySelectorAll('[data-session-choice]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateFinder();
    });
  });

  settingButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedSetting = button.dataset.settingChoice;
      settingButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateFinder();
    });
  });
}

const priceFilters = document.querySelectorAll('[data-price-filter]');

priceFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.priceFilter;
    priceFilters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('[data-price-kind]').forEach((card) => {
      card.hidden = filter !== 'all' && !card.dataset.priceKind.split(' ').includes(filter);
      card.querySelectorAll('[data-price-line]').forEach((line) => {
        line.hidden = filter !== 'all' && line.dataset.priceLine !== filter;
      });
    });
  });
});
