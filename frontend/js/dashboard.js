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
async function loadQuests() {
    try {
        const response = await API.getAvailableQuests();
        questsData = response.quests;
        displayQuests();
    } catch (error) {
        console.error('Failed to load quests:', error);
        document.getElementById('questsContainer').innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="margin-bottom: 0.5rem;">⚠️ Unable to load quests</p>
                <p style="font-size: 0.9rem;">Make sure the backend server is running</p>
            </div>
        `;
    }
}

/**
 * Display Quests
 */
function displayQuests() {
    const container = document.getElementById('questsContainer');

    if (questsData.length === 0) {
        container.innerHTML = '<div class="loading">No quests available. Try resting to restore stamina.</div>';
        return;
    }

    container.innerHTML = questsData.map(quest => `
        <div class="quest-card" data-quest-id="${quest.quest_id}">
            <div class="quest-header">
                <div>
                    <h3 class="quest-title">${quest.title}</h3>
                    <span class="quest-difficulty difficulty-${quest.difficulty}">${quest.difficulty}</span>
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
                    <span class="reward-icon">🔋</span>
                    <span>-${quest.stamina_cost} Stamina</span>
                </div>
            </div>
            
            ${quest.is_custom ? `
            <button class="delete-quest-btn" data-quest-id="${quest.quest_id}" title="Remove Quest">
                🗑️
            </button>
            ` : ''}
            
            <button class="edit-quest-btn" data-quest-id="${quest.quest_id}" title="Edit Quest">
                ✏️
            </button>

        </div>
    `).join('');

    // Add click handlers for Quest Card (Completion)
    document.querySelectorAll('.quest-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent triggering if delete button was clicked
            if (e.target.closest('.delete-quest-btn')) return;

            const questId = card.dataset.questId;
            completeQuest(questId);
        });
    });

    // Add click handlers for Delete Button
    document.querySelectorAll('.delete-quest-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Stop event bubbling to card click
            const questId = btn.dataset.questId;

            if (confirm('Are you sure you want to remove this quest?')) {
                try {
                    await API.deleteQuest(questId);
                    showToast('Quest removed successfully', 'success');
                    loadQuests(); // Reload list
                } catch (error) {
                    showToast(error.message || 'Failed to remove quest', 'error');
                }
            }
        });
    });

    // Add click handlers for Edit Button
    document.querySelectorAll('.edit-quest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const questId = btn.dataset.questId;
            openEditQuestModal(questId);
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
