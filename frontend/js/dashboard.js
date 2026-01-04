/**
 * Dashboard Logic
 * Handles all dashboard functionality and real-time updates
 */

let userData = null;
let statsData = null;
let questsData = [];
let skillsData = [];
let editingQuestId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initDashboard();

    // Setup event listeners
    setupEventListeners();
});

/**
 * Initialize Dashboard
 */
async function initDashboard() {
    try {
        await loadUserProfile();

        // Check for missing titles (retroactive unlock)
        try {
            // Title check is handled by backend on updates normally, simplified:
            // const titleCheck = await API.getTitles(); // Or just skip if not needed on generic update
            // Removing invalid call to nonexistent endpoint/method

            if (titleCheck.new_titles && titleCheck.new_titles.length > 0) {
                titleCheck.new_titles.forEach(title => {
                    showToast(`New Title Unlocked: ${title}!`, 'success');
                });
            }
        } catch (error) {
            console.log('Title check skipped:', error);
        }

        await loadQuests();
        await loadSkills();
        await loadTitles();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        if (error.message.includes('token') || error.message.includes('Authorization')) {
            removeToken();
            window.location.href = 'index.html';
        } else {
            showToast('Failed to load dashboard data', 'error');
        }
    }
}

/**
 * Load User Profile
 */
async function loadUserProfile() {
    try {
        const profile = await API.getProfile();
        userData = profile.user;
        statsData = profile.stats;

        updateUserDisplay();
        updateStatsDisplay();
    } catch (error) {
        throw error;
    }
}

/**
 * Update User Display
 */
function updateUserDisplay() {
    document.getElementById('headerUsername').textContent = userData.username;
    document.getElementById('userLevel').textContent = userData.level;

    // Update EXP bar
    const expPercent = (userData.exp / userData.exp_required) * 100;
    document.getElementById('expFill').style.width = `${expPercent}%`;
    document.getElementById('expText').textContent = `${userData.exp} / ${userData.exp_required}`;

    // Update skill points
    document.getElementById('skillPoints').textContent = userData.skill_points;
}

/**
 * Update Stats Display
 */
function updateStatsDisplay() {
    document.getElementById('statStrength').textContent = statsData.strength;
    document.getElementById('statAgility').textContent = statsData.agility;
    document.getElementById('statIntelligence').textContent = statsData.intelligence;

    // Show current/max stamina
    const maxStamina = statsData.max_stamina || 50;
    document.getElementById('statStamina').textContent = `${statsData.stamina}/${maxStamina}`;

    // Update health bar
    const healthPercent = (statsData.health / statsData.max_health) * 100;
    document.getElementById('healthFill').style.width = `${healthPercent}%`;
    document.getElementById('healthText').textContent = `${statsData.health} / ${statsData.max_health}`;
}

/**
 * Load Quests
 */
/**
 * Load Quests
 */
async function loadQuests() {
    try {
        const response = await API.getAvailableQuests();
        questsData = response.quests;
        displayQuests();
    } catch (error) {
        console.error('Failed to load quests:', error);
        // Fallback error display
        const errHtml = `
            <div class="loading" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="margin-bottom: 0.5rem;">⚠️ Unable to load quests</p>
                <p style="font-size: 0.9rem;">Make sure the backend server is running</p>
            </div>
        `;
        const pList = document.getElementById('physicalQuestsList');
        if (pList) pList.innerHTML = errHtml;
    }
}

/**
 * Display Quests (Split System)
 */
function displayQuests() {
    const physicalList = document.getElementById('physicalQuestsList');
    const systemList = document.getElementById('systemQuestsList');

    if (!physicalList || !systemList) return;

    // Helper to generate Card HTML
    const createQuestCard = (quest, styleColor) => `
        <div class="quest-card" data-quest-id="${quest.quest_id}" style="border-left: 3px solid ${styleColor}; animation: fadeIn 0.5s;">
            <div class="quest-header">
                <div>
                    <h3 class="quest-title" style="color: ${styleColor}">${quest.title}</h3>
                    <span class="quest-difficulty difficulty-${quest.difficulty}" style="border-color:${styleColor}; color:${styleColor}">${quest.difficulty}</span>
                </div>
            </div>
            <p class="quest-description">${quest.description}</p>
            <div class="quest-rewards">
                <div class="reward-item">
                    <span class="reward-icon">⭐</span>
                    <span>+${quest.exp_reward} EXP</span>
                </div>
                 ${Object.entries(quest.stat_rewards || {}).map(([stat, value]) => `
                    <div class="reward-item">
                        <span class="reward-icon">${getStatIcon(stat)}</span>
                        <span>+${value} ${capitalize(stat)}</span>
                    </div>
                `).join('')}
                <div class="reward-item">
                    <span class="reward-icon">⚡</span>
                    <span>-${quest.stamina_cost} SP</span>
                </div>
            </div>
            
            <div class="quest-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                 ${quest.is_custom ? `
                <button class="btn-icon delete-quest-btn" data-quest-id="${quest.quest_id}" title="Remove Quest" style="color: var(--status-danger);">
                    🗑️
                </button>
                ` : ''}
                <button class="btn btn-small btn-primary complete-quest-btn" data-quest-id="${quest.quest_id}">
                    COMPLETE
                </button>
            </div>
        </div>
    `;

    // Clear lists
    physicalList.innerHTML = '';
    systemList.innerHTML = '';

    // Check if empty
    if (questsData.length === 0) {
        systemList.innerHTML = '<div class="loading">No active quests.</div>';
        return;
    }

    // Filter and Render
    let hasPhysical = false;
    let hasSystem = false;

    questsData.forEach(quest => {
        // Determine category (default to system if missing)
        const isPhysical = quest.category === 'physical' || quest.quest_id.startsWith('physical_');

        if (isPhysical) {
            hasPhysical = true;
            physicalList.innerHTML += createQuestCard(quest, '#00ffaa');
        } else {
            hasSystem = true;
            systemList.innerHTML += createQuestCard(quest, 'var(--primary-cyan)');
        }
    });

    // Empty state messages
    if (!hasPhysical) physicalList.innerHTML = '<div class="empty-state">No physical training active.</div>';
    if (!hasSystem) systemList.innerHTML = '<div class="empty-state">No system missions active.</div>';

    attachQuestHandlers();
}

/**
 * Attach Event Handlers (Refactored)
 */
function attachQuestHandlers() {
    // Complete Handlers
    document.querySelectorAll('.complete-quest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const questId = btn.dataset.questId;
            completeQuest(questId);
        });
    });

    // Delete Handlers
    document.querySelectorAll('.delete-quest-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const questId = btn.dataset.questId;
            if (confirm('Remove this custom quest?')) {
                try {
                    await API.deleteQuest(questId);
                    showToast('Quest removed', 'success');
                    loadQuests();
                } catch (error) {
                    showToast('Failed to remove quest', 'error');
                }
            }
        });
    });
}

/**
 * Complete Quest
 */
async function completeQuest(questId) {
    try {
        const response = await API.completeQuest(questId);

        showToast(`Quest completed! +${response.exp_gained} EXP`, 'success');

        // Update user data
        userData = response.user;
        statsData = response.stats;

        updateUserDisplay();
        updateStatsDisplay();

        // Check for level up
        if (response.leveled_up) {
            showLevelUpModal(response.new_level, response.new_titles);
        }

        // Show new titles
        if (response.new_titles && response.new_titles.length > 0) {
            response.new_titles.forEach(title => {
                showToast(`New Title Earned: ${title}`, 'success');
            });
        }

        // Reload quests
        await loadQuests();
        await loadTitles();

    } catch (error) {
        showToast(error.message || 'Failed to complete quest', 'error');
    }
}

/**
 * Load Skills
 */
async function loadSkills() {
    try {
        const response = await API.getSkills();
        skillsData = response;
        displaySkills();
    } catch (error) {
        console.error('Failed to load skills:', error);
        document.getElementById('skillsContainer').innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="margin-bottom: 0.5rem;">⚠️ Unable to load skills</p>
                <p style="font-size: 0.9rem;">Server connection issue</p>
            </div>
        `;
    }
}

/**
 * Display Skills
 */
function displaySkills() {
    const container = document.getElementById('skillsContainer');

    const userSkills = skillsData.user_skills || [];
    const availableSkills = skillsData.available_skills || [];

    let html = '';

    // Section 1: Unlocked Skills
    html += '<div class="skills-section"><h4 class="section-title unlocked-title">⚡ Unlocked Skills</h4>';
    if (userSkills.length > 0) {
        html += '<div class="skills-grid">';
        html += userSkills.map(skill => `
            <div class="skill-card unlocked" data-skill-id="${skill.skill_id}">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-type type-${skill.type}">${skill.type}</span>
                </div>
                <p class="skill-description">
                    ${skill.description}
                    ${skill.type === 'active' ? `<br><small>Stamina Cost: ${skill.stamina_cost}</small>` : ''}
                </p>
                <div class="skill-progress">
                    <div class="skill-progress-bar" style="width: ${(skill.exp / skill.exp_required) * 100}%"></div>
                </div>
                ${skill.type === 'active' ? `
                <button class="btn btn-small btn-primary use-skill-btn" style="margin-top: 0.5rem; width: 100%;">
                    Use Skill
                </button>
                ` : ''}
            </div>
        `).join('');
        html += '</div>';
    } else {
        html += '<p class="empty-state">No skills unlocked yet.</p>';
    }
    html += '</div>';

    // Section 2: Locked Skills
    const lockedSkills = availableSkills.filter(skill =>
        !userSkills.some(us => us.skill_id === skill.skill_id)
    );

    html += '<div class="skills-section"><h4 class="section-title locked-title">🔒 Available to Unlock</h4>';
    if (lockedSkills.length > 0) {
        html += '<div class="skills-grid">';
        html += lockedSkills.map(skill => `
            <div class="skill-card locked" data-skill-id="${skill.skill_id}">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-type type-${skill.type}">${skill.type}</span>
                </div>
                <p class="skill-description">${skill.description}</p>
                <div class="cost-badge">Cost: ${skill.unlock_cost} SP</div>
                <button class="btn btn-small btn-primary unlock-skill-btn">
                    Unlock
                </button>
            </div>
        `).join('');
        html += '</div>';
    } else {
        html += '<p class="empty-state">All skills unlocked!</p>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Add unlock handlers
    document.querySelectorAll('.unlock-skill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const skillCard = e.target.closest('.skill-card');
            const skillId = skillCard.dataset.skillId;
            unlockSkill(skillId);
        });
    });

    // Add use skill handlers
    document.querySelectorAll('.use-skill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const skillCard = e.target.closest('.skill-card');
            const skillId = skillCard.dataset.skillId;
            useSkill(skillId);
        });
    });
}

/**
 * Use Active Skill
 */
async function useSkill(skillId) {
    try {
        const response = await API.useSkill(skillId);
        showToast(response.message, 'success');

        // Reload profile to update stats (Health/Stamina/EXP)
        await loadUserProfile();

    } catch (error) {
        showToast(error.message || 'Failed to use skill', 'error');
    }
}

/**
 * Unlock Skill
 */
async function unlockSkill(skillId) {
    try {
        const response = await API.unlockSkill(skillId);

        showToast(`Skill unlocked: ${response.skill_name}`, 'success');

        // Reload profile and skills
        await loadUserProfile();
        await loadSkills();

    } catch (error) {
        showToast(error.message || 'Failed to unlock skill', 'error');
    }
}

/**
 * Load Titles
 */
async function loadTitles() {
    try {
        const response = await API.getTitles();
        titlesData = response;
        displayTitles();
    } catch (error) {
        console.error('Failed to load titles:', error);
        document.getElementById('titlesContainer').innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="margin-bottom: 0.5rem;">⚠️ Unable to load titles</p>
                <p style="font-size: 0.9rem;">Server connection issue</p>
            </div>
        `;
    }
}

/**
 * Display Titles
 */
function displayTitles() {
    const container = document.getElementById('titlesContainer');

    const earnedTitles = titlesData.earned_titles || [];
    const allTitles = titlesData.available_titles || [];

    let html = '';

    // Show earned titles
    if (earnedTitles.length > 0) {
        html += '<h4 style="color: var(--accent-color); margin-bottom: 1rem;">Earned Titles</h4>';
        html += earnedTitles.map(title => `
            <div class="title-card earned">
                <h4 class="title-name">🏆 ${title.name}</h4>
                <p class="title-description">${title.description}</p>
            </div>
        `).join('');
    }

    // Show locked titles
    const lockedTitles = allTitles.filter(title =>
        !earnedTitles.some(et => et.title_id === title.title_id)
    );

    if (lockedTitles.length > 0) {
        html += '<h4 style="color: var(--text-secondary); margin: 1.5rem 0 1rem;">Locked Titles</h4>';
        html += lockedTitles.map(title => `
            <div class="title-card">
                <h4 class="title-name">🔒 ${title.name}</h4>
                <p class="title-description">${title.description}</p>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
                    Requirement: ${title.requirement}
                </p>
            </div>
        `).join('');
    }

    container.innerHTML = html || '<div class="loading">No titles available</div>';
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        removeToken();
        window.location.href = 'index.html';
    });

    // Profile button (Event Delegation)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'profileBtn') {
            const modal = document.getElementById('profileModal');
            if (modal && userData) {
                document.getElementById('profileName').textContent = userData.username;
                document.getElementById('profileEmail').textContent = userData.email;
                document.getElementById('profileLevel').textContent = userData.level;
                document.getElementById('profileImage').src = userData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;
                modal.classList.add('active');
            } else if (!userData) {
                console.error("Profile data not ready");
                alert("Profile data loading...");
            }
        }
    });

    // Profile Image Upload
    const profileUploadInput = document.getElementById('profileUploadInput');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const profileImageWrapper = document.getElementById('profileImage')?.parentElement;

    if (profileImageWrapper && uploadOverlay) {
        profileImageWrapper.addEventListener('mouseenter', () => uploadOverlay.style.opacity = '1');
        profileImageWrapper.addEventListener('mouseleave', () => uploadOverlay.style.opacity = '0');

        uploadOverlay.addEventListener('click', () => {
            profileUploadInput.click();
        });
    }

    if (profileUploadInput) {
        profileUploadInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    showToast('Uploading image...', 'info');
                    const response = await API.uploadProfileImage(formData);

                    // Update image source immediate
                    userData.profile_image = response.image_url;
                    document.getElementById('profileImage').src = response.image_url;
                    showToast('Profile image updated!', 'success');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        });
    }

    // Refresh quests button
    document.getElementById('refreshQuestsBtn')?.addEventListener('click', loadQuests);

    // Rest button
    document.getElementById('restBtn')?.addEventListener('click', async () => {
        try {
            const response = await API.restoreStamina(20);
            showToast('Stamina restored!', 'success');
            statsData.stamina = response.stamina;
            updateStatsDisplay();
            await loadQuests();
        } catch (error) {
            showToast(error.message || 'Failed to restore stamina', 'error');
        }
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });

    // Close level up modal
    document.getElementById('closeLevelUpModal')?.addEventListener('click', () => {
        document.getElementById('levelUpModal').classList.remove('active');
    });

    // Open Add Quest Modal (Event Delegation)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'addQuestBtn') {
            editingQuestId = null;
            document.querySelector('#addQuestModal h2').textContent = 'Create Custom Quest';
            const submitBtn = document.querySelector('#addQuestForm button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Create Quest';
            document.getElementById('addQuestForm')?.reset();
            document.getElementById('addQuestModal').classList.add('active');
        }
    });

    // Close Modals
    document.querySelectorAll('.close-modal, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
            editingQuestId = null;
        });
    });

    // Add Quest Form Submit
    document.getElementById('addQuestForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('questTitle').value;
        const description = document.getElementById('questDescription').value;
        const difficulty = document.getElementById('questDifficulty').value;
        const expReward = parseInt(document.getElementById('questExp').value);
        const staminaCost = parseInt(document.getElementById('questStamina').value);

        const questData = {
            title,
            description,
            difficulty,
            exp_reward: expReward,
            stamina_cost: staminaCost
        };

        try {
            if (editingQuestId) {
                // Edit Mode
                questData.quest_id = editingQuestId;
                await API.editQuest(questData);
                showToast('Quest updated successfully!', 'success');
            } else {
                // Add Mode
                await API.addQuest(questData);
                showToast('Custom quest created successfully!', 'success');
            }

            document.getElementById('addQuestModal').classList.remove('active');
            document.getElementById('addQuestForm').reset();
            editingQuestId = null;
            loadQuests(); // Reload list
        } catch (error) {
            showToast(error.message || 'Failed to save quest', 'error');
        }
    });
}

function openEditQuestModal(questId) {
    const quest = questsData.find(q => q.quest_id === questId);
    if (!quest) return;

    editingQuestId = questId;

    // Fill form
    document.getElementById('questTitle').value = quest.title;
    document.getElementById('questDescription').value = quest.description;
    document.getElementById('questDifficulty').value = quest.difficulty;
    document.getElementById('questExp').value = quest.exp_reward;
    document.getElementById('questStamina').value = quest.stamina_cost;

    // Update UI
    document.querySelector('#addQuestModal h2').textContent = 'Edit Quest';
    document.querySelector('#addQuestForm button[type="submit"]').textContent = 'Save Changes';

    document.getElementById('addQuestModal').classList.add('active');
}

/**
 * Show Level Up Modal
 */
function showLevelUpModal(newLevel, newTitles = []) {
    const modal = document.getElementById('levelUpModal');
    document.getElementById('newLevelText').textContent = `Level ${newLevel}`;

    const rewardsList = document.getElementById('levelUpRewardsList');
    rewardsList.innerHTML = `
        <li>+1 Skill Point</li>
        <li>+2 Strength</li>
        <li>+2 Agility</li>
        <li>+2 Intelligence</li>
        <li>+3 Stamina</li>
        <li>+10 Max Health</li>
        ${newTitles.map(title => `<li>New Title: ${title}</li>`).join('')}
    `;

    modal.classList.add('active');
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Utility Functions
 */
function getStatIcon(stat) {
    const icons = {
        'strength': '💪',
        'agility': '⚡',
        'intelligence': '🧠',
        'stamina': '🔋',
        'health': '❤️'
    };
    return icons[stat] || '⭐';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* === DUNGEON SYSTEM LOGIC === */
let activeDungeon = null;
let dungeonTimerInterval = null;
let selectedRank = null;

// Initialize Dungeon Buttons (Call this in initDashboard if possible, or add trigger)
function initDungeonSystem() {
    // Add "Gate" button to dashboard if not present
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('dungeonGateBtn')) {
        const gateBtn = document.createElement('button');
        gateBtn.id = 'dungeonGateBtn';
        gateBtn.className = 'btn btn-small';
        gateBtn.innerHTML = '⛩️ GATE';
        gateBtn.style.background = 'linear-gradient(45deg, #ff0055, #660022)';
        gateBtn.style.border = '1px solid #ff99aa';

        gateBtn.addEventListener('click', () => {
            document.getElementById('dungeonGateModal').classList.add('active');
        });

        headerRight.appendChild(gateBtn);
    }

    // Enter Dungeon Button (Handled via onclick in HTML)
    // document.getElementById('enterDungeonBtn')?.addEventListener('click', startDungeon);

    // Dungeon Controls (Handled via onclick)
    // document.getElementById('attackBossBtn')?.addEventListener('click', strikeBoss);
    // document.getElementById('fleeDungeonBtn')?.addEventListener('click', fleeDungeon);
}

// Global scope for select function
window.selectDungeon = function (rank) {
    selectedRank = rank;
    const infoPanel = document.getElementById('selectedDungeonInfo');
    const details = document.getElementById('dungeonDetails');

    infoPanel.classList.remove('hidden');

    // Update visuals based on rank
    document.querySelectorAll('.dungeon-rank-card').forEach(c => c.style.borderColor = 'rgba(255,255,255,0.1)');
    document.querySelector(`.rank-${rank.toLowerCase()}`).style.borderColor = '#ff0055';

    if (rank === 'E') details.textContent = "E-Rank | 25 Minutes | Noob Friendly";
    if (rank === 'C') details.textContent = "C-Rank | 60 Minutes | Major Project";
    if (rank === 'S') details.textContent = "S-Rank | 4 Hours | GOD LEVEL FOCUS";
};

window.startDungeon = async function () {
    if (!selectedRank) {
        showToast("Please select a rank first!", "warning");
        return;
    }

    try {
        const response = await API.startDungeon(selectedRank);

        // Setup Active Session
        activeDungeon = {
            id: response.dungeon_id,
            endTime: new Date(response.end_time).getTime(),
            maxHp: response.boss_hp,
            currentHp: response.boss_hp
        };

        // UI Transition
        document.getElementById('dungeonGateModal').classList.remove('active');
        document.getElementById('dungeonOverlay').classList.remove('hidden');

        updateBossUI();
        startTimer();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

function startTimer() {
    if (dungeonTimerInterval) clearInterval(dungeonTimerInterval);

    dungeonTimerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = activeDungeon.endTime - now;

        if (distance < 0) {
            // Out of time = Fail (or maybe auto-success if we want lenient?)
            // Usually dungeon timer end = fail
            clearInterval(dungeonTimerInterval);
            document.getElementById('dungeonTimerDisplay').textContent = "BREACHED";
            showToast("Time expired! Keeping dungeon open for manual finish...", 'warning');
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('dungeonTimerDisplay').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    }, 1000);
}

async function strikeBoss() {
    if (!activeDungeon) return;

    // Visual hit
    const btn = document.getElementById('attackBossBtn');
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 200);

    // Logic: standard click = minimal damage, completed task = big damage?
    // For now, simulate progress: 5% damage per click/task complete
    const damage = Math.ceil(activeDungeon.maxHp * 0.05);

    try {
        const res = await API.damageBoss(activeDungeon.id, damage);
        activeDungeon.currentHp = res.boss_hp;
        updateBossUI();

        if (activeDungeon.currentHp <= 0) {
            victory();
        }

    } catch (error) {
        console.error(error);
    }
}

function updateBossUI() {
    const pct = (activeDungeon.currentHp / activeDungeon.maxHp) * 100;
    document.getElementById('bossHpFill').style.width = `${pct}%`;
    document.getElementById('bossHpText').textContent = `${activeDungeon.currentHp} / ${activeDungeon.maxHp}`;
}

async function victory() {
    clearInterval(dungeonTimerInterval);
    try {
        const res = await API.completeDungeon(activeDungeon.id);

        document.getElementById('dungeonTimerDisplay').style.color = '#00ffaa';
        document.getElementById('dungeonTimerDisplay').textContent = "DUNGEON CLEARED";
        showToast(`Victory! +${res.exp_gained} EXP`, 'success');

        setTimeout(async () => {
            document.getElementById('dungeonOverlay').classList.add('hidden');
            activeDungeon = null;
            await loadUserProfile(); // Refresh stats
            if (res.leveled_up) showLevelUpModal(res.new_level);
        }, 3000);

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function fleeDungeon() {
    if (confirm("Are you sure? You will take damage!")) {
        try {
            const res = await API.failDungeon(activeDungeon.id);
            clearInterval(dungeonTimerInterval);
            document.getElementById('dungeonOverlay').classList.add('hidden');
            activeDungeon = null;
            showToast(`Escaped... took ${res.health_lost} damage.`, 'error');
            await loadUserProfile(); // Update health
        } catch (error) {
            console.error(error);
        }
    }
}

// Hook into initialization
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDungeonSystem, 1000); // Delay slightly to ensure header exists
});

/* === BACKGROUND MUSIC SYSTEM === */
let isBgmPlaying = false;
let hasInteracted = false;

function initBGM() {
    const bgmPlayer = document.getElementById('bgmPlayer');
    const toggleBtn = document.getElementById('bgmToggleBtn');
    const volumeSlider = document.getElementById('bgmVolumeSlider');

    if (!bgmPlayer || !toggleBtn) return;

    // Set initial volume
    bgmPlayer.volume = 0.3;

    // Toggle Play/Pause
    toggleBtn.addEventListener('click', () => {
        if (bgmPlayer.paused) {
            bgmPlayer.play().then(() => {
                isBgmPlaying = true;
                toggleBtn.classList.add('bgm-playing');
                volumeSlider.classList.remove('hidden');
                showToast("🔊 BGM SYSTEM: ONLINE", "info");
            }).catch(e => console.log("Audio play failed:", e));
        } else {
            bgmPlayer.pause();
            isBgmPlaying = false;
            toggleBtn.classList.remove('bgm-playing');
            volumeSlider.classList.add('hidden');
            showToast("🔇 BGM SYSTEM: OFFLINE", "info");
        }
    });

    // Volume Control
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            bgmPlayer.volume = e.target.value;
        });
    }

    // Auto-start on first interaction
    document.addEventListener('click', () => {
        if (!hasInteracted && bgmPlayer.paused && !isBgmPlaying) {
            bgmPlayer.play().then(() => {
                isBgmPlaying = true;
                toggleBtn.classList.add('bgm-playing');
                volumeSlider.classList.remove('hidden');
                hasInteracted = true;
            }).catch(() => { });
        }
    }, { once: true });
}

// Call initBGM on load
document.addEventListener('DOMContentLoaded', initBGM);

/* === REAL WORLD UTILITIES === */
window.handleSkillEffect = function (effect) {
    if (!effect) return;

    if (effect.type === 'breathing') {
        const overlay = document.getElementById('breathingOverlay');
        const text = document.getElementById('breathingText');

        if (overlay) overlay.classList.remove('hidden');
        if (text) text.textContent = "Breathe In...";
    }

    if (effect.type === 'audio') {
        const player = document.getElementById('skillAudioPlayer');
        if (player) {
            if (player.src !== effect.src) {
                player.src = effect.src;
            }
            if (player.paused) {
                player.play();
                showToast(`🎵 Playing: ${effect.label}`, 'info');
            } else {
                player.pause();
                showToast("⏸️ Audio Paused", 'info');
            }
        }
    }
}

window.stopBreathing = function () {
    document.getElementById('breathingOverlay').classList.add('hidden');
}

// Update useSkill to use the global effect handler
const originalUseSkill = window.useSkill;
window.useSkill = async function (skillId) {
    try {
        const response = await API.useSkill(skillId);
        showToast(response.message, 'success');

        if (response.real_world_effect) {
            window.handleSkillEffect(response.real_world_effect);
        }

        await loadUserProfile();
        setTimeout(loadSkills, 500); // Slight delay for refresh
    } catch (error) {
        showToast(error.message, 'error');
    }
};

/* === FEEDBACK SYSTEM === */
window.toggleFeedbackModal = function () {
    const modal = document.getElementById('feedbackModal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

window.submitFeedback = async function (e) {
    e.preventDefault();

    const category = document.getElementById('fbCategory').value;
    const rating = document.getElementById('fbRating').value;
    const message = document.getElementById('fbMessage').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API.baseUrl}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category, rating, message })
        });

        const data = await response.json();

        if (data.success) {
            showToast("✅ " + data.message, "success");
            toggleFeedbackModal();
            document.getElementById('feedbackForm').reset();
        } else {
            showToast("⚠️ " + data.message, "warning");
        }
    } catch (error) {
        showToast("❌ SYSTEM ERROR: REPORT FAILED", "error");
    }
}
