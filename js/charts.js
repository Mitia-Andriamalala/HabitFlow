/**
 * CHARTS.JS - Génération de graphiques et visualisations
 */

const Charts = {
  /**
   * Génère un graphique de progression sur N jours
   * @param {HTMLElement} container
   * @param {number} days
   */
  renderProgressChart(container, days = 30) {
    const data = Stats.getProgressChartData(days);
    if (!container) return;

    const maxValue = 100;
    const width = container.offsetWidth || 800;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Crée le SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'progress-chart');

    // Crée les axes
    this.createAxis(svg, padding, chartWidth, chartHeight, data, maxValue);

    // Crée la courbe
    this.createLine(svg, padding, chartWidth, chartHeight, data, maxValue);

    // Crée les points
    this.createPoints(svg, padding, chartWidth, chartHeight, data, maxValue);

    // Vide le container et ajoute le SVG
    container.innerHTML = '';
    container.appendChild(svg);
  },

  /**
   * Crée les axes du graphique
   */
  createAxis(svg, padding, width, height, data, maxValue) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'axis');

    // Axe Y (pourcentages)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (height * i / 4);
      const value = maxValue - (maxValue * i / 4);

      // Ligne horizontale
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', padding.left + width);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'var(--border-color)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '2,2');
      g.appendChild(line);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', 'var(--text-tertiary)');
      text.setAttribute('font-size', '12');
      text.textContent = `${value}%`;
      g.appendChild(text);
    }

    svg.appendChild(g);
  },

  /**
   * Crée la ligne du graphique
   */
  createLine(svg, padding, width, height, data, maxValue) {
    if (data.length < 2) return;

    const points = data.map((d, i) => {
      const x = padding.left + (width * i / (data.length - 1));
      const y = padding.top + height - (height * d.percentage / maxValue);
      return `${x},${y}`;
    }).join(' ');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', 'var(--primary)');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(polyline);
  },

  /**
   * Crée les points sur la courbe
   */
  createPoints(svg, padding, width, height, data, maxValue) {
    data.forEach((d, i) => {
      const x = padding.left + (width * i / (data.length - 1));
      const y = padding.top + height - (height * d.percentage / maxValue);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', 'var(--primary)');
      circle.setAttribute('stroke', 'var(--bg-primary)');
      circle.setAttribute('stroke-width', '2');

      // Tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${d.date}: ${d.completed}/${d.total} (${d.percentage}%)`;
      circle.appendChild(title);

      svg.appendChild(circle);
    });
  },

  /**
   * Génère la heatmap annuelle
   * @param {HTMLElement} container
   * @param {number} year
   */
  renderHeatmap(container, year = new Date().getFullYear()) {
    if (!container) return;

    const heatmapData = Stats.getHeatmapData(year);
    const maxCount = Math.max(...Object.values(heatmapData), 1);

    container.innerHTML = '';

    // Crée une grille de 53 semaines x 7 jours
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Trouve le premier lundi
    let currentDate = new Date(startDate);
    while (currentDate.getDay() !== 1) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const weeks = [];
    let currentWeek = [];

    while (currentDate <= endDate || currentWeek.length > 0) {
      if (currentDate.getDay() === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      const dateStr = Utils.formatDate(currentDate);
      const count = heatmapData[dateStr] || 0;
      const level = Stats.getHeatmapLevel(count, maxCount);

      currentWeek.push({
        date: dateStr,
        dateObj: new Date(currentDate),
        count,
        level,
        inYear: currentDate.getFullYear() === year
      });

      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > endDate && currentWeek.length >= 7) {
        weeks.push(currentWeek);
        break;
      }
    }

    // Génère le HTML
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.setAttribute('data-level', day.level);
        cell.setAttribute('data-date', day.date);

        if (!day.inYear) {
          cell.style.opacity = '0.3';
        }

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.textContent = `${day.date}: ${day.count} habitude(s)`;
        cell.appendChild(tooltip);

        // Highlight aujourd'hui
        if (Utils.isSameDay(day.dateObj, new Date())) {
          cell.classList.add('today');
        }

        grid.appendChild(cell);
      });
    });

    container.appendChild(grid);

    // Légende
    const legend = this.createHeatmapLegend();
    container.appendChild(legend);
  },

  /**
   * Crée la légende de la heatmap
   */
  createHeatmapLegend() {
    const legend = document.createElement('div');
    legend.className = 'heatmap-legend';
    legend.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; font-size: 0.75rem; color: var(--text-tertiary);';

    legend.innerHTML = `
      <span>Moins</span>
      <div class="heatmap-cell" data-level="0" style="width: 12px; height: 12px;"></div>
      <div class="heatmap-cell" data-level="1" style="width: 12px; height: 12px;"></div>
      <div class="heatmap-cell" data-level="2" style="width: 12px; height: 12px;"></div>
      <div class="heatmap-cell" data-level="3" style="width: 12px; height: 12px;"></div>
      <div class="heatmap-cell" data-level="4" style="width: 12px; height: 12px;"></div>
      <span>Plus</span>
    `;

    return legend;
  },

  /**
   * Génère un graphique en barres hebdomadaire
   * @param {HTMLElement} container
   */
  renderWeeklyChart(container) {
    if (!container) return;

    const data = Stats.getWeeklyChartData();
    container.innerHTML = '';

    const chart = document.createElement('div');
    chart.className = 'weekly-chart';
    chart.style.cssText = 'display: flex; align-items: flex-end; gap: 0.5rem; height: 150px; padding: 1rem;';

    data.forEach(day => {
      const bar = document.createElement('div');
      bar.className = 'weekly-bar';
      bar.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      `;

      const barFill = document.createElement('div');
      barFill.style.cssText = `
        width: 100%;
        height: ${day.percentage}%;
        background: var(--primary);
        border-radius: 0.25rem;
        transition: height 0.3s ease;
      `;

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 0.75rem; color: var(--text-secondary);';
      label.textContent = day.dayName;

      bar.appendChild(barFill);
      bar.appendChild(label);
      chart.appendChild(bar);
    });

    container.appendChild(chart);
  },

  /**
   * Génère des cartes de statistiques
   * @param {HTMLElement} container
   */
  renderStatsCards(container) {
    if (!container) return;

    const stats = Stats.getGlobalStats();
    container.innerHTML = '';

    const cards = [
      {
        icon: 'chart',
        value: `${stats.averageSuccessRate}%`,
        label: 'Taux de réussite',
        className: 'success'
      },
      {
        icon: 'target',
        value: stats.totalCompletions,
        label: 'Complétions totales',
        className: ''
      },
      {
        icon: 'fire',
        value: stats.currentStreak,
        label: 'Meilleur streak actuel',
        className: 'warning'
      },
      {
        icon: 'trophy',
        value: stats.bestStreak,
        label: 'Record absolu',
        className: 'error'
      }
    ];

    cards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `stat-card ${card.className}`;

      cardEl.innerHTML = `
        <div class="stat-icon">${Icons.getUIIcon(card.icon)}</div>
        <div class="stat-value">${card.value}</div>
        <div class="stat-label">${card.label}</div>
      `;

      container.appendChild(cardEl);
    });
  },

  /**
   * Génère des graphiques pour chaque habitude
   * @param {HTMLElement} container
   */
  renderHabitsStats(container) {
    if (!container) return;

    const habits = HabitManager.getActiveHabits();
    container.innerHTML = '';

    habits.forEach(habit => {
      const stats = Stats.getHabitStats(habit.id);
      if (!stats) return;

      const card = document.createElement('div');
      card.className = 'card habit-stat-card';
      card.style.marginBottom = '1rem';
      const iconSvg = Icons.getHabitIcon(habit.icon);

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
          <div class="habit-icon-wrapper" style="background: ${habit.color}20; color: ${habit.color};">
            ${iconSvg}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0; font-size: 1rem;">${habit.name}</h3>
          </div>
          <div class="habit-streak">
            <span class="streak-fire">${Icons.getUIIcon('fire')}</span>
            <span class="streak-count">${stats.currentStreak}</span>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-label">
            <span>Taux de réussite</span>
            <span>${stats.successRate}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.successRate}%"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem; font-size: 0.875rem;">
          <div style="text-align: center;">
            <div style="color: var(--text-tertiary);">Meilleur</div>
            <div style="font-weight: 600;">${stats.bestStreak}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--text-tertiary);">Total</div>
            <div style="font-weight: 600;">${stats.totalCompletions}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--text-tertiary);">7 jours</div>
            <div style="font-weight: 600;">${stats.successRate7Days}%</div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Charts;
}
