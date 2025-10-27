/**
 * UI.JS - Manipulation du DOM et gestion de l'interface utilisateur
 */

const UI = {
  // Éléments DOM
  elements: {},

  // État actuel de la vue
  currentView: 'today',

  // État du modal
  currentModalHabitId: null,

  // État du calendrier
  currentCalendarDate: new Date(),

  // Icônes disponibles
  availableIcons: ['star', 'water', 'book', 'running', 'meditation', 'sleep', 'apple', 'dumbbell', 'target', 'pencil', 'palette', 'music', 'laptop', 'coffee', 'heart', 'brain'],

  // Couleurs disponibles
  availableColors: ['#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#6366f1', '#8b5cf6', '#f43f5e'],

  /**
   * Initialise l'interface utilisateur
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.initializeTheme();
    this.renderTodayView();
    this.updateMotivationalQuote();

    // Écoute les changements de HabitManager
    HabitManager.addListener((event, data) => {
      this.handleHabitManagerEvent(event, data);
    });
  },

  /**
   * Met en cache les éléments DOM
   */
  cacheElements() {
    this.elements = {
      // Views
      viewToday: document.getElementById('view-today'),
      viewStats: document.getElementById('view-stats'),
      viewCalendar: document.getElementById('view-calendar'),
      viewArchived: document.getElementById('view-archived'),

      // Today view
      currentDate: document.getElementById('current-date'),
      completionCount: document.getElementById('completion-count'),
      dailyProgress: document.getElementById('daily-progress'),
      habitsList: document.getElementById('habits-list'),
      motivationalQuote: document.getElementById('motivational-quote'),

      // Stats view
      statsGrid: document.getElementById('stats-grid'),
      heatmapContainer: document.getElementById('heatmap-container'),
      habitsStatsList: document.getElementById('habits-stats-list'),

      // Modals
      modalHabit: document.getElementById('modal-habit'),
      modalSettings: document.getElementById('modal-settings'),

      // Buttons
      btnAddHabit: document.getElementById('btn-add-habit'),
      btnSettings: document.getElementById('btn-settings'),
      btnNotifications: document.getElementById('btn-notifications'),
      btnThemeToggle: document.getElementById('btn-theme-toggle'),

      // Modal Habit
      habitForm: document.getElementById('habit-form'),
      habitName: document.getElementById('habit-name'),
      habitIcon: document.getElementById('habit-icon'),
      habitColor: document.getElementById('habit-color'),
      emojiPicker: document.getElementById('emoji-picker'),
      colorPicker: document.getElementById('color-picker'),
      reminderTime: document.getElementById('reminder-time'),
      habitId: document.getElementById('habit-id'),
      btnSaveHabit: document.getElementById('btn-save-habit'),
      btnCancelHabit: document.getElementById('btn-cancel-habit'),
      modalHabitClose: document.getElementById('modal-habit-close'),
      modalHabitTitle: document.getElementById('modal-habit-title'),

      // Settings
      settingNotifications: document.getElementById('setting-notifications'),
      settingSounds: document.getElementById('setting-sounds'),
      settingDailyReminderTime: document.getElementById('setting-daily-reminder-time'),
      storageFill: document.getElementById('storage-fill'),
      storageText: document.getElementById('storage-text'),
      btnExportData: document.getElementById('btn-export-data'),
      btnImportData: document.getElementById('btn-import-data'),
      btnResetData: document.getElementById('btn-reset-data'),
      importFile: document.getElementById('import-file'),
      modalSettingsClose: document.getElementById('modal-settings-close'),

      // Toast
      toast: document.getElementById('toast'),
      toastIcon: document.getElementById('toast-icon'),
      toastMessage: document.getElementById('toast-message'),

      // Nav tabs
      navTabs: document.querySelectorAll('.nav-tab')
    };
  },

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Navigation tabs
    this.elements.navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Add habit button
    this.elements.btnAddHabit?.addEventListener('click', () => this.openHabitModal());

    // Settings button
    this.elements.btnSettings?.addEventListener('click', () => this.openSettingsModal());

    // Theme toggle
    this.elements.btnThemeToggle?.addEventListener('click', () => this.toggleTheme());

    // Notifications button
    this.elements.btnNotifications?.addEventListener('click', () => this.requestNotificationPermission());

    // Modal controls
    this.elements.btnSaveHabit?.addEventListener('click', () => this.saveHabit());
    this.elements.btnCancelHabit?.addEventListener('click', () => this.closeHabitModal());
    this.elements.modalHabitClose?.addEventListener('click', () => this.closeHabitModal());
    this.elements.modalSettingsClose?.addEventListener('click', () => this.closeSettingsModal());

    // Settings
    this.elements.btnExportData?.addEventListener('click', () => this.exportData());
    this.elements.btnImportData?.addEventListener('click', () => this.elements.importFile.click());
    this.elements.importFile?.addEventListener('change', (e) => this.importData(e));
    this.elements.btnResetData?.addEventListener('click', () => this.resetData());

    // Settings checkboxes
    this.elements.settingNotifications?.addEventListener('change', (e) => {
      Storage.updateSetting('notifications', e.target.checked);
    });
    this.elements.settingSounds?.addEventListener('change', (e) => {
      Storage.updateSetting('sounds', e.target.checked);
    });

    // Daily reminder time
    this.elements.settingDailyReminderTime?.addEventListener('change', (e) => {
      Storage.updateSetting('dailyReminderTime', e.target.value);
      Notifications.scheduleDailyReminder();
      this.showToast('Rappel quotidien mis à jour', '⏰');
    });

    // Emoji and color pickers
    this.initializeEmojiPicker();
    this.initializeColorPicker();

    // Frequency radio buttons
    const frequencyRadios = document.querySelectorAll('input[name="frequency"]');
    frequencyRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const daysSelector = document.getElementById('days-selector');
        if (e.target.value === 'specific') {
          daysSelector.style.display = 'grid';
          this.initializeDaysSelector();
        } else {
          daysSelector.style.display = 'none';
        }
      });
    });

    // Close modals on overlay click
    this.elements.modalHabit?.addEventListener('click', (e) => {
      if (e.target === this.elements.modalHabit) {
        this.closeHabitModal();
      }
    });

    this.elements.modalSettings?.addEventListener('click', (e) => {
      if (e.target === this.elements.modalSettings) {
        this.closeSettingsModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  },

  /**
   * Initialise le sélecteur d'icône
   */
  initializeEmojiPicker() {
    if (!this.elements.emojiPicker) return;

    this.elements.emojiPicker.innerHTML = '';
    this.elements.emojiPicker.className = 'icon-picker';

    this.availableIcons.forEach(iconName => {
      const option = document.createElement('div');
      option.className = 'icon-option';
      option.innerHTML = Icons.getHabitIcon(iconName);
      option.dataset.icon = iconName;
      option.addEventListener('click', (e) => {
        this.selectEmoji(iconName, e.currentTarget);
      });
      this.elements.emojiPicker.appendChild(option);
    });
  },

  /**
   * Sélectionne une icône
   */
  selectEmoji(iconName, element) {
    this.elements.habitIcon.value = iconName;
    document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
    if (element) {
      element.classList.add('selected');
    }
  },

  /**
   * Initialise le sélecteur de couleur
   */
  initializeColorPicker() {
    if (!this.elements.colorPicker) return;

    this.elements.colorPicker.innerHTML = '';

    this.availableColors.forEach(color => {
      const option = document.createElement('div');
      option.className = 'color-option';
      option.style.backgroundColor = color;
      option.addEventListener('click', () => {
        this.selectColor(color);
      });
      this.elements.colorPicker.appendChild(option);
    });
  },

  /**
   * Sélectionne une couleur
   */
  selectColor(color) {
    this.elements.habitColor.value = color;
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
  },

  /**
   * Initialise le sélecteur de jours
   */
  initializeDaysSelector() {
    const daysSelector = document.getElementById('days-selector');
    if (!daysSelector) return;

    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    daysSelector.innerHTML = '';

    days.forEach((day, index) => {
      const checkbox = document.createElement('div');
      checkbox.className = 'day-checkbox';
      checkbox.textContent = day;
      checkbox.dataset.day = day.toLowerCase();
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('selected');
      });
      daysSelector.appendChild(checkbox);
    });
  },

  /**
   * Change de vue
   */
  switchView(viewName) {
    this.currentView = viewName;

    // Met à jour les tabs
    this.elements.navTabs.forEach(tab => {
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Affiche la vue correspondante
    Object.entries(this.elements).forEach(([key, value]) => {
      if (key.startsWith('view')) {
        value?.classList.remove('active');
      }
    });

    const viewElement = this.elements[`view${viewName.charAt(0).toUpperCase()}${viewName.slice(1)}`];
    viewElement?.classList.add('active');

    // Render la vue
    switch (viewName) {
      case 'today':
        this.renderTodayView();
        break;
      case 'stats':
        this.renderStatsView();
        break;
      case 'calendar':
        this.renderCalendarView();
        break;
      case 'archived':
        this.renderArchivedView();
        break;
    }
  },

  /**
   * Rend la vue "Aujourd'hui"
   */
  renderTodayView() {
    // Met à jour la date
    if (this.elements.currentDate) {
      this.elements.currentDate.textContent = Utils.formatDateLong(new Date());
    }

    // Met à jour le compteur
    this.updateProgress();

    // Vérifie les streaks en danger
    this.checkStreaksInDanger();

    // Rend la liste des habitudes
    this.renderHabitsList();
  },

  /**
   * Vérifie et affiche les alertes pour les streaks en danger
   */
  checkStreaksInDanger() {
    const alert = document.getElementById('streak-danger-alert');
    const message = document.getElementById('streak-danger-message');

    if (!alert || !message) return;

    const habits = HabitManager.getTodayHabits();
    const dangerousHabits = habits.filter(h => {
      const streak = h.getCurrentStreak();
      const isCompleted = h.isCompletedOn(new Date());
      return streak >= 3 && !isCompleted;
    });

    if (dangerousHabits.length === 0) {
      alert.style.display = 'none';
      return;
    }

    // Construire le message
    const habitNames = dangerousHabits.map(h => {
      const streak = h.getCurrentStreak();
      return `<strong>${h.name}</strong> (${streak} jours)`;
    }).join(', ');

    message.innerHTML = `Vous avez ${dangerousHabits.length} habitude${dangerousHabits.length > 1 ? 's' : ''} avec un streak actif non complétée${dangerousHabits.length > 1 ? 's' : ''} aujourd'hui : ${habitNames}. Ne brisez pas votre série !`;

    // Afficher l'alerte seulement si elle n'a pas été fermée aujourd'hui
    const dismissedKey = 'streak-alert-dismissed-' + Utils.formatDate(new Date());
    if (!sessionStorage.getItem(dismissedKey)) {
      alert.style.display = 'flex';
    }
  },

  /**
   * Ferme l'alerte de streaks en danger
   */
  dismissStreakAlert() {
    const alert = document.getElementById('streak-danger-alert');
    if (alert) {
      alert.style.display = 'none';
      // Marquer comme fermée pour aujourd'hui
      const dismissedKey = 'streak-alert-dismissed-' + Utils.formatDate(new Date());
      sessionStorage.setItem(dismissedKey, 'true');
    }
  },

  /**
   * Met à jour la barre de progression
   */
  updateProgress() {
    const completed = HabitManager.getCompletedCount();
    const total = HabitManager.getTotalCount();
    const percentage = HabitManager.getCompletionPercentage();

    if (this.elements.completionCount) {
      this.elements.completionCount.textContent = `${completed}/${total} complétées aujourd'hui`;
    }

    if (this.elements.dailyProgress) {
      this.elements.dailyProgress.style.width = `${percentage}%`;
    }
  },

  /**
   * Rend la liste des habitudes
   */
  renderHabitsList() {
    if (!this.elements.habitsList) return;

    const habits = HabitManager.getTodayHabits();
    this.elements.habitsList.innerHTML = '';

    if (habits.length === 0) {
      this.elements.habitsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.getUIIcon('pencil')}</div>
          <h3 class="empty-state-title">Aucune habitude</h3>
          <p class="empty-state-text">Commencez par ajouter votre première habitude !</p>
        </div>
      `;
      return;
    }

    habits.forEach(habit => {
      const habitElement = this.createHabitElement(habit);
      this.elements.habitsList.appendChild(habitElement);
    });
  },

  /**
   * Crée un élément habitude
   */
  createHabitElement(habit) {
    const isCompleted = habit.isCompletedOn(new Date());
    const streak = habit.getCurrentStreak();
    const streakClass = habit.getStreakClass();
    const iconSvg = Icons.getHabitIcon(habit.icon);

    const habitItem = document.createElement('div');
    habitItem.className = `habit-item ${isCompleted ? 'completed' : ''}`;
    habitItem.dataset.habitId = habit.id;

    habitItem.innerHTML = `
      <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" data-habit-id="${habit.id}"></div>
      <div class="habit-icon-wrapper" style="background: ${habit.color}20; color: ${habit.color};">
        ${iconSvg}
      </div>
      <div class="habit-content">
        <p class="habit-name">${Utils.sanitizeHTML(habit.name)}</p>
      </div>
      ${streak > 0 ? `
        <div class="habit-streak ${streakClass}">
          ${Icons.getUIIcon('fire')}
          <span class="streak-count">${streak}</span>
        </div>
      ` : ''}
      <div class="habit-actions">
        <button class="habit-action-btn" data-action="edit" data-habit-id="${habit.id}" title="Modifier">
          ${Icons.getUIIcon('edit')}
        </button>
        <button class="habit-action-btn" data-action="archive" data-habit-id="${habit.id}" title="Archiver">
          ${Icons.getUIIcon('archive')}
        </button>
      </div>
    `;

    // Event listeners
    const checkbox = habitItem.querySelector('.habit-checkbox');
    checkbox.addEventListener('click', () => this.toggleHabit(habit.id));

    const editBtn = habitItem.querySelector('[data-action="edit"]');
    editBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openHabitModal(habit.id);
    });

    const archiveBtn = habitItem.querySelector('[data-action="archive"]');
    archiveBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.archiveHabit(habit.id);
    });

    return habitItem;
  },

  /**
   * Toggle une habitude
   */
  toggleHabit(habitId) {
    const isCompleted = HabitManager.toggleHabitCompletion(habitId);

    if (isCompleted) {
      const habit = HabitManager.getHabitById(habitId);
      const streak = habit?.getCurrentStreak();

      // Vibre sur mobile
      Utils.vibrate(200);

      // Vérifie les milestones
      if (streak && [7, 21, 30, 50, 100].includes(streak)) {
        Notifications.sendMilestone(habit, streak);
        this.showConfetti();
      }
    }

    this.updateProgress();
    this.renderHabitsList();
  },

  /**
   * Archive une habitude
   */
  archiveHabit(habitId) {
    if (confirm('Voulez-vous vraiment archiver cette habitude ?')) {
      HabitManager.archiveHabit(habitId);
      this.showToast('Habitude archivée', '📦');
    }
  },

  /**
   * Met à jour la citation motivationnelle
   */
  updateMotivationalQuote() {
    if (!this.elements.motivationalQuote) return;

    const quoteText = this.elements.motivationalQuote.querySelector('.quote-text');
    if (quoteText) {
      quoteText.textContent = Notifications.getRandomQuote();
    }
  },

  /**
   * Rend la vue statistiques
   */
  renderStatsView() {
    Charts.renderStatsCards(this.elements.statsGrid);
    Charts.renderHeatmap(this.elements.heatmapContainer);
    Charts.renderHabitsStats(this.elements.habitsStatsList);
  },

  /**
   * Rend la vue calendrier
   */
  renderCalendarView() {
    const container = this.elements.viewCalendar;
    if (!container) return;

    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const today = new Date();

    // Nom du mois
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Premier jour du mois et nombre de jours
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Dimanche

    // Ajuster pour commencer le lundi (0 = Lundi, 6 = Dimanche)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    container.innerHTML = `
      <div class="calendar-header">
        <button class="btn-icon btn-ghost" id="calendar-prev-month" aria-label="Mois précédent">
          ${Icons.getUIIcon('chevronLeft')}
        </button>
        <h2 class="calendar-title">${monthNames[month]} ${year}</h2>
        <button class="btn-icon btn-ghost" id="calendar-next-month" aria-label="Mois suivant">
          ${Icons.getUIIcon('chevronRight')}
        </button>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div class="calendar-weekday">Lun</div>
          <div class="calendar-weekday">Mar</div>
          <div class="calendar-weekday">Mer</div>
          <div class="calendar-weekday">Jeu</div>
          <div class="calendar-weekday">Ven</div>
          <div class="calendar-weekday">Sam</div>
          <div class="calendar-weekday">Dim</div>
        </div>

        <div class="calendar-days" id="calendar-days">
          <!-- Les jours seront générés ici -->
        </div>
      </div>

      <div id="calendar-day-details" style="display: none; margin-top: 1.5rem;">
        <!-- Détails du jour sélectionné -->
      </div>
    `;

    // Générer les jours
    const calendarDaysContainer = document.getElementById('calendar-days');

    // Jours vides avant le début du mois
    for (let i = 0; i < adjustedStartDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarDaysContainer.appendChild(emptyDay);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isFuture = date > today;

      // Calculer le nombre d'habitudes complétées ce jour
      const habitsForDay = HabitManager.getHabitsForDate(date);
      const completedCount = habitsForDay.filter(h => h.isCompletedOn(date)).length;
      const totalCount = habitsForDay.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      if (isToday) dayEl.classList.add('today');
      if (isPast) dayEl.classList.add('past');
      if (isFuture) dayEl.classList.add('future');
      if (completionRate === 100 && totalCount > 0) dayEl.classList.add('completed');
      if (completionRate > 0 && completionRate < 100) dayEl.classList.add('partial');

      dayEl.innerHTML = `
        <div class="calendar-day-number">${day}</div>
        ${totalCount > 0 ? `<div class="calendar-day-dots">${completedCount}/${totalCount}</div>` : ''}
      `;

      dayEl.dataset.date = date.toISOString();
      dayEl.addEventListener('click', () => this.showDayDetails(date));

      calendarDaysContainer.appendChild(dayEl);
    }

    // Event listeners pour navigation
    document.getElementById('calendar-prev-month').addEventListener('click', () => {
      this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
      this.renderCalendarView();
    });

    document.getElementById('calendar-next-month').addEventListener('click', () => {
      this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
      this.renderCalendarView();
    });
  },

  /**
   * Affiche les détails d'un jour dans le calendrier
   */
  showDayDetails(date) {
    const container = document.getElementById('calendar-day-details');
    if (!container) return;

    const today = new Date();
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    const canEdit = daysDiff >= 0 && daysDiff <= 7; // Modification max 7 jours en arrière

    const habits = HabitManager.getHabitsForDate(date);

    if (habits.length === 0) {
      container.style.display = 'block';
      container.innerHTML = `
        <div class="card">
          <h3 style="margin-top: 0;">${Utils.formatDateLong(date)}</h3>
          <p>Aucune habitude programmée pour ce jour.</p>
        </div>
      `;
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="card">
        <h3 style="margin-top: 0;">${Utils.formatDateLong(date)}</h3>
        ${!canEdit ? '<p class="text-warning" style="font-size: 0.875rem;">⚠️ Modification limitée aux 7 derniers jours</p>' : ''}
        <div class="calendar-day-habits">
          ${habits.map(habit => {
            const isCompleted = habit.isCompletedOn(date);
            const iconSvg = Icons.getHabitIcon(habit.icon);

            return `
              <div class="habit-item ${isCompleted ? 'completed' : ''} ${!canEdit ? 'disabled' : ''}"
                   data-habit-id="${habit.id}"
                   data-date="${date.toISOString()}">
                <div class="habit-checkbox ${isCompleted ? 'checked' : ''}"
                     ${canEdit ? `onclick="UI.toggleHabitOnDate('${habit.id}', '${date.toISOString()}')"` : ''}>
                </div>
                <div class="habit-icon-wrapper" style="background: ${habit.color}20; color: ${habit.color};">
                  ${iconSvg}
                </div>
                <div class="habit-content">
                  <p class="habit-name">${Utils.sanitizeHTML(habit.name)}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Toggle une habitude pour une date spécifique
   */
  toggleHabitOnDate(habitId, dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    // Vérifier la limite de 7 jours
    if (daysDiff < 0 || daysDiff > 7) {
      this.showToast('Modification limitée aux 7 derniers jours', '⚠️');
      return;
    }

    const habit = HabitManager.getHabitById(habitId);
    if (!habit) return;

    habit.toggle(date);
    Storage.saveHabits(HabitManager.habits);

    // Rafraîchir l'affichage
    this.renderCalendarView();
    this.showDayDetails(date);

    Utils.vibrate(100);
  },

  /**
   * Rend la vue archivées
   */
  renderArchivedView() {
    const container = document.getElementById('archived-list');
    if (!container) return;

    const archivedHabits = HabitManager.getArchivedHabits();
    container.innerHTML = '';

    if (archivedHabits.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.getUIIcon('archive')}</div>
          <h3 class="empty-state-title">Aucune habitude archivée</h3>
        </div>
      `;
      return;
    }

    archivedHabits.forEach(habit => {
      const card = document.createElement('div');
      card.className = 'card';
      const iconSvg = Icons.getHabitIcon(habit.icon);
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="habit-icon-wrapper" style="background: ${habit.color}20; color: ${habit.color};">
              ${iconSvg}
            </div>
            <div>
              <h3 style="margin: 0;">${habit.name}</h3>
              <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                ${habit.getTotalCompletions()} complétions
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="UI.unarchiveHabit('${habit.id}')">
              Restaurer
            </button>
            <button class="btn btn-secondary btn-sm" onclick="UI.deleteHabit('${habit.id}')">
              Supprimer
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  /**
   * Désarchive une habitude
   */
  unarchiveHabit(habitId) {
    HabitManager.unarchiveHabit(habitId);
    this.showToast('Habitude restaurée', '✓');
    this.renderArchivedView();
  },

  /**
   * Supprime une habitude
   */
  deleteHabit(habitId) {
    if (confirm('Voulez-vous vraiment supprimer définitivement cette habitude ? Cette action est irréversible.')) {
      HabitManager.deleteHabit(habitId);
      this.showToast('Habitude supprimée', '🗑️');
      this.renderArchivedView();
    }
  },

  /**
   * Ouvre le modal d'ajout/modification d'habitude
   */
  openHabitModal(habitId = null) {
    this.currentModalHabitId = habitId;

    if (habitId) {
      // Mode édition
      const habit = HabitManager.getHabitById(habitId);
      if (!habit) return;

      this.elements.modalHabitTitle.textContent = 'Modifier l\'habitude';
      this.elements.btnSaveHabit.textContent = 'Sauvegarder';
      this.elements.habitName.value = habit.name;
      this.elements.habitIcon.value = habit.icon;
      this.elements.habitColor.value = habit.color;
      this.elements.reminderTime.value = habit.reminderTime || '';
      this.elements.habitId.value = habit.id;

      // Sélectionne l'emoji et la couleur
      this.selectExistingEmoji(habit.icon);
      this.selectExistingColor(habit.color);
    } else {
      // Mode création
      this.elements.modalHabitTitle.textContent = 'Nouvelle habitude';
      this.elements.btnSaveHabit.textContent = 'Créer';
      this.elements.habitForm.reset();
      this.elements.habitIcon.value = 'star';
      this.elements.habitColor.value = '#3498db';
    }

    this.elements.modalHabit.style.display = 'flex';
  },

  /**
   * Sélectionne une icône existante
   */
  selectExistingEmoji(iconName) {
    document.querySelectorAll('.icon-option').forEach(el => {
      if (el.dataset.icon === iconName) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  },

  /**
   * Sélectionne une couleur existante
   */
  selectExistingColor(color) {
    document.querySelectorAll('.color-option').forEach(el => {
      if (el.style.backgroundColor === color || this.rgbToHex(el.style.backgroundColor) === color) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  },

  /**
   * Convertit RGB en HEX
   */
  rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;

    const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
  },

  /**
   * Ferme le modal d'habitude
   */
  closeHabitModal() {
    this.elements.modalHabit.style.display = 'none';
    this.currentModalHabitId = null;
    this.elements.habitForm.reset();
  },

  /**
   * Sauvegarde une habitude
   */
  saveHabit() {
    const name = this.elements.habitName.value.trim();
    const icon = this.elements.habitIcon.value;
    const color = this.elements.habitColor.value;
    const reminderTime = this.elements.reminderTime.value || null;

    // Fréquence
    const frequencyType = document.querySelector('input[name="frequency"]:checked')?.value;
    let frequency = 'daily';

    if (frequencyType === 'specific') {
      const selectedDays = Array.from(document.querySelectorAll('.day-checkbox.selected'))
        .map(el => el.dataset.day);

      if (selectedDays.length === 0) {
        this.showToast('Sélectionnez au moins un jour', '⚠️');
        return;
      }

      frequency = selectedDays;
    }

    const habitData = {
      name,
      icon,
      color,
      frequency,
      reminderTime
    };

    // Validation
    const validation = Habit.validate(habitData);
    if (!validation.valid) {
      this.showToast(validation.errors[0], '⚠️');
      return;
    }

    if (this.currentModalHabitId) {
      // Mise à jour
      HabitManager.updateHabit(this.currentModalHabitId, habitData);
      this.showToast('Habitude mise à jour', '✓');
    } else {
      // Création
      HabitManager.addHabit(habitData);
      this.showToast('Habitude créée', '✓');
    }

    this.closeHabitModal();
  },

  /**
   * Ouvre le modal de paramètres
   */
  openSettingsModal() {
    const settings = Storage.loadSettings();

    this.elements.settingNotifications.checked = settings.notifications;
    this.elements.settingSounds.checked = settings.sounds;
    this.elements.settingDailyReminderTime.value = settings.dailyReminderTime || '20:00';

    // Afficher l'espace de stockage
    this.updateStorageInfo();

    this.elements.modalSettings.style.display = 'flex';
  },

  /**
   * Met à jour l'affichage de l'espace de stockage
   */
  updateStorageInfo() {
    const stats = Storage.getStorageStats();
    const usedMB = (stats.used / 1024).toFixed(2);
    const totalMB = (stats.total / 1024).toFixed(0);
    const percentage = stats.percentage;

    if (this.elements.storageFill) {
      this.elements.storageFill.style.width = `${percentage}%`;
    }

    if (this.elements.storageText) {
      this.elements.storageText.textContent = `${usedMB} Ko / ${totalMB} Mo (${percentage}%)`;
    }

    // Warning si proche de la limite
    if (percentage > 80 && this.elements.storageFill) {
      this.elements.storageFill.style.background = 'linear-gradient(90deg, var(--error), var(--warning))';
    }
  },

  /**
   * Ferme le modal de paramètres
   */
  closeSettingsModal() {
    this.elements.modalSettings.style.display = 'none';
  },

  /**
   * Ferme tous les modals
   */
  closeAllModals() {
    this.closeHabitModal();
    this.closeSettingsModal();
  },

  /**
   * Exporte les données
   */
  exportData() {
    const data = HabitManager.exportData();
    const filename = `habitflow-backup-${Utils.formatDate(new Date())}.json`;
    Utils.downloadJSON(data, filename);
    this.showToast('Données exportées', '💾');
  },

  /**
   * Importe des données
   */
  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await Utils.readJSON(file);
      const result = HabitManager.importData(data);

      if (result.success) {
        this.showToast('Données importées', '✓');
        this.renderTodayView();
      } else {
        this.showToast(result.message, '⚠️');
      }
    } catch (error) {
      this.showToast('Erreur lors de l\'import', '❌');
    }

    event.target.value = '';
  },

  /**
   * Réinitialise les données
   */
  resetData() {
    if (confirm('Voulez-vous vraiment réinitialiser toutes les données ? Cette action est irréversible.')) {
      HabitManager.reset();
      this.showToast('Données réinitialisées', '🔄');
      this.renderTodayView();
    }
  },

  /**
   * Initialise le thème
   */
  initializeTheme() {
    const settings = Storage.loadSettings();
    let theme = settings.theme;

    if (theme === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeIcon(theme);
  },

  /**
   * Toggle le thème
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    Storage.updateSetting('theme', newTheme);
    this.updateThemeIcon(newTheme);
  },

  /**
   * Met à jour l'icône du thème
   */
  updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = theme === 'dark' ? Icons.getUIIcon('sun') : Icons.getUIIcon('moon');
    }
  },

  /**
   * Demande la permission pour les notifications
   */
  async requestNotificationPermission() {
    const permission = await Notifications.requestPermission();

    if (permission === 'granted') {
      this.showToast('Notifications activées', '🔔');
      Storage.updateSetting('notifications', true);
    } else {
      this.showToast('Notifications refusées', '🔕');
    }
  },

  /**
   * Affiche un toast
   */
  showToast(message, icon = '✓') {
    if (!this.elements.toast) return;

    this.elements.toastIcon.textContent = icon;
    this.elements.toastMessage.textContent = message;
    this.elements.toast.style.display = 'flex';
    this.elements.toast.classList.add('fade-in');

    setTimeout(() => {
      this.elements.toast.classList.add('hiding');
      setTimeout(() => {
        this.elements.toast.style.display = 'none';
        this.elements.toast.classList.remove('fade-in', 'hiding');
      }, 300);
    }, 3000);
  },

  /**
   * Affiche des confettis
   */
  showConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = Utils.randomChoice(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7']);
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }

    // Son de célébration
    const settings = Storage.loadSettings();
    if (settings.sounds) {
      Notifications.playCelebrationSound();
    }
  },

  /**
   * Gère les événements de HabitManager
   */
  handleHabitManagerEvent(event, data) {
    switch (event) {
      case 'add':
      case 'update':
      case 'delete':
      case 'toggle':
      case 'complete':
      case 'uncomplete':
        if (this.currentView === 'today') {
          this.renderTodayView();
        }
        break;
      case 'archive':
      case 'unarchive':
        if (this.currentView === 'today') {
          this.renderTodayView();
        } else if (this.currentView === 'archived') {
          this.renderArchivedView();
        }
        break;
    }
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
