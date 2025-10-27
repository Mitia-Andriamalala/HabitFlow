/**
 * APP.JS - Point d'entrée principal de l'application
 */

const App = {
  /**
   * Initialise l'application
   */
  async init() {
    console.log('🌟 HabitFlow - Initialisation...');

    try {
      // Vérifie la disponibilité du LocalStorage
      if (!Storage.isAvailable()) {
        this.showError('LocalStorage non disponible. L\'application ne peut pas fonctionner.');
        return;
      }

      // Initialise les modules
      await this.initializeModules();

      // Initialise l'interface utilisateur
      UI.init();

      // Démarre les notifications périodiques
      this.startPeriodicTasks();

      // Vérifie le premier lancement
      this.checkFirstLaunch();

      // Écoute les événements de storage (sync entre onglets)
      this.setupStorageSync();

      // Écoute les événements de quota dépassé
      window.addEventListener('storage-quota-exceeded', (e) => {
        UI.showToast('Espace de stockage presque plein', '⚠️');
      });

      console.log('✅ HabitFlow initialisé avec succès');

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      this.showError('Erreur lors du démarrage de l\'application');
    }
  },

  /**
   * Initialise les modules
   */
  async initializeModules() {
    // Storage est déjà initialisé automatiquement
    // HabitManager est déjà initialisé automatiquement

    // Initialise les notifications
    const notifSupported = await Notifications.init();
    if (!notifSupported) {
      console.warn('Notifications non supportées sur ce navigateur');
    }

    console.log('📦 Modules initialisés');
  },

  /**
   * Démarre les tâches périodiques
   */
  startPeriodicTasks() {
    // Démarre les vérifications périodiques de notifications
    Notifications.startPeriodicChecks();

    // Met à jour la date toutes les minutes
    setInterval(() => {
      const dateElement = document.getElementById('current-date');
      if (dateElement && UI.currentView === 'today') {
        dateElement.textContent = Utils.formatDateLong(new Date());
      }
    }, 60000);

    // Vérifie les changements de jour
    this.checkDayChange();

    console.log('⏰ Tâches périodiques démarrées');
  },

  /**
   * Vérifie le changement de jour
   */
  checkDayChange() {
    let currentDay = Utils.formatDate(new Date());

    setInterval(() => {
      const newDay = Utils.formatDate(new Date());

      if (newDay !== currentDay) {
        currentDay = newDay;
        console.log('📅 Nouveau jour détecté:', newDay);

        // Recharge la vue si on est sur "Aujourd'hui"
        if (UI.currentView === 'today') {
          UI.renderTodayView();
        }

        // Vérifie les streaks en danger
        Notifications.checkStreaksInDanger();

        // Met à jour la citation
        UI.updateMotivationalQuote();
      }
    }, 60000); // Vérifie toutes les minutes
  },

  /**
   * Vérifie si c'est le premier lancement
   */
  checkFirstLaunch() {
    const settings = Storage.loadSettings();

    if (settings.firstLaunch) {
      this.showWelcomeMessage();

      // Désactive le flag de premier lancement
      Storage.updateSetting('firstLaunch', false);
    }
  },

  /**
   * Affiche le message de bienvenue
   */
  showWelcomeMessage() {
    setTimeout(() => {
      UI.showToast('Bienvenue sur HabitFlow ! 🌟', '👋');

      // Demande la permission pour les notifications après un délai
      setTimeout(() => {
        if (Notification.permission === 'default') {
          if (confirm('Voulez-vous activer les notifications pour recevoir des rappels ?')) {
            Notifications.requestPermission();
          }
        }
      }, 2000);
    }, 1000);
  },

  /**
   * Configure la synchronisation entre onglets
   */
  setupStorageSync() {
    Storage.onStorageChange((change) => {
      console.log('🔄 Changement de storage détecté:', change.key);

      // Recharge les habitudes si elles ont changé dans un autre onglet
      if (change.key === Storage.KEYS.HABITS) {
        HabitManager.loadHabits();
        UI.renderTodayView();
      }

      // Recharge les paramètres si ils ont changé
      if (change.key === Storage.KEYS.SETTINGS) {
        UI.initializeTheme();
      }
    });
  },

  /**
   * Affiche une erreur critique
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ef4444;
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      z-index: 10000;
      max-width: 400px;
    `;
    errorDiv.innerHTML = `
      <h2 style="margin: 0 0 1rem 0;">❌ Erreur</h2>
      <p style="margin: 0;">${message}</p>
    `;
    document.body.appendChild(errorDiv);
  },

  /**
   * Nettoie les ressources avant de quitter
   */
  cleanup() {
    console.log('🧹 Nettoyage des ressources...');
    // Rien de spécial à nettoyer pour l'instant
  }
};

// Initialise l'application quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Cleanup avant de quitter
window.addEventListener('beforeunload', () => {
  App.cleanup();
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée:', event.reason);
});

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
