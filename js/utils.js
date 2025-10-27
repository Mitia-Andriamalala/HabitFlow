/**
 * UTILS.JS - Fonctions utilitaires
 */

const Utils = {
  /**
   * Génère un ID unique
   * @returns {string}
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Formate une date en string YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Parse une date string YYYY-MM-DD vers Date
   * @param {string} dateString
   * @returns {Date}
   */
  parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  },

  /**
   * Formate une date en format lisible (ex: "Dimanche 26 Octobre 2025")
   * @param {Date} date
   * @param {string} locale
   * @returns {string}
   */
  formatDateLong(date = new Date(), locale = 'fr-FR') {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Formate une date en format court (ex: "26/10/2025")
   * @param {Date} date
   * @param {string} locale
   * @returns {string}
   */
  formatDateShort(date = new Date(), locale = 'fr-FR') {
    return date.toLocaleDateString(locale);
  },

  /**
   * Capitalise la première lettre
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Obtient le jour de la semaine (0 = Dimanche, 1 = Lundi, etc.)
   * @param {Date} date
   * @returns {number}
   */
  getDayOfWeek(date = new Date()) {
    return date.getDay();
  },

  /**
   * Obtient le nom du jour de la semaine
   * @param {Date} date
   * @param {string} locale
   * @returns {string}
   */
  getDayName(date = new Date(), locale = 'fr-FR') {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  },

  /**
   * Vérifie si deux dates sont le même jour
   * @param {Date} date1
   * @param {Date} date2
   * @returns {boolean}
   */
  isSameDay(date1, date2) {
    return this.formatDate(date1) === this.formatDate(date2);
  },

  /**
   * Ajoute des jours à une date
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Obtient le nombre de jours entre deux dates
   * @param {Date} date1
   * @param {Date} date2
   * @returns {number}
   */
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffMs = Math.abs(date2 - date1);
    return Math.floor(diffMs / oneDay);
  },

  /**
   * Obtient le début du mois
   * @param {Date} date
   * @returns {Date}
   */
  startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  /**
   * Obtient la fin du mois
   * @param {Date} date
   * @returns {Date}
   */
  endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },

  /**
   * Obtient tous les jours d'un mois
   * @param {Date} date
   * @returns {Date[]}
   */
  getDaysInMonth(date = new Date()) {
    const start = this.startOfMonth(date);
    const end = this.endOfMonth(date);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  },

  /**
   * Sanitize HTML pour prévenir XSS
   * @param {string} str
   * @returns {string}
   */
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  /**
   * Génère un nombre aléatoire entre min et max
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Sélectionne un élément aléatoire dans un tableau
   * @param {Array} array
   * @returns {*}
   */
  randomChoice(array) {
    return array[this.random(0, array.length - 1)];
  },

  /**
   * Débounce une fonction
   * @param {Function} func
   * @param {number} wait
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle une fonction
   * @param {Function} func
   * @param {number} limit
   * @returns {Function}
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Formate un pourcentage
   * @param {number} value
   * @param {number} total
   * @param {number} decimals
   * @returns {string}
   */
  formatPercentage(value, total, decimals = 0) {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
  },

  /**
   * Calcule un pourcentage
   * @param {number} value
   * @param {number} total
   * @returns {number}
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  /**
   * Tronque un texte
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  },

  /**
   * Deep clone un objet
   * @param {Object} obj
   * @returns {Object}
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Vérifie si un objet est vide
   * @param {Object} obj
   * @returns {boolean}
   */
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },

  /**
   * Crée un élément DOM avec des attributs
   * @param {string} tag
   * @param {Object} attributes
   * @param {string|Node} content
   * @returns {HTMLElement}
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Node) {
      element.appendChild(content);
    }

    return element;
  },

  /**
   * Scroll smooth vers un élément
   * @param {string|HTMLElement} element
   */
  scrollTo(element) {
    const target = typeof element === 'string'
      ? document.querySelector(element)
      : element;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  /**
   * Attends un certain délai (Promise)
   * @param {number} ms
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Télécharge un fichier JSON
   * @param {Object} data
   * @param {string} filename
   */
  downloadJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Lit un fichier JSON
   * @param {File} file
   * @returns {Promise<Object>}
   */
  readJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Vérifie si on est sur mobile
   * @returns {boolean}
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Vérifie si on est en mode standalone (PWA installée)
   * @returns {boolean}
   */
  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  /**
   * Copie du texte dans le clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  },

  /**
   * Vibre le device (si supporté)
   * @param {number|number[]} pattern
   */
  vibrate(pattern = 200) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  /**
   * Obtient les données de taille du stockage
   * @returns {Object}
   */
  getStorageInfo() {
    let total = 0;
    let used = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // LocalStorage max is typically 5MB (5 * 1024 * 1024 bytes)
    total = 5 * 1024 * 1024;

    return {
      used,
      total,
      available: total - used,
      usedMB: (used / (1024 * 1024)).toFixed(2),
      totalMB: (total / (1024 * 1024)).toFixed(2),
      percentage: Math.round((used / total) * 100)
    };
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
