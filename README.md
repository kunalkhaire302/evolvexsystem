# 🦅 **EVOLVEX SYSTEM** (Solo Leveling)

> *"The System will help the Player grow."*

**EvolveX** is a gamified task management and self-improvement system inspired by *Solo Leveling*. It tracks your real-life progress as an RPG, allowing you to level up, earn skills, and complete daily quests.

---

## ⚡ **Key Features**

### 🎮 **Player Status**
- **Leveling System:** Earn EXP from quests to level up.
- **Stats:** Track Strength, Agility, Intelligence, Stamina.
- **Health:** HP mechanics (future combat features).
- **Titles:** Unlock titles like "Wolf Slayer" or "Shadow Monarch".

### 📜 **Quests**
- **Daily Quests:** "Player! Do 100 Pushups!" (System generated).
- **Custom Quests:** Create your own tasks (Standard/Hard/Boss).
- **Quest Overrides:** Edit system quests for your personal goals without affecting others.

### ⚔️ **Skills & Abilities**
- **Unlock Skills:** Use Skill Points (SP) gained from leveling.
- **Active Skills:** Sprint, Stealth.
- **Passive Skills:** Quick Learner, Iron Body.
- **Inactivity Penalty:** Lose 1 Level if you don't login for 48 hours! ⚠️

### 👤 **Profile**
- **Hunter ID Card:** View your generated avatar, rank, and job class.
- **Customization:** Upload your own profile picture.

---

## 🚀 **Quick Start**

### **Prerequisites**
1.  **Python 3.8+**
2.  **MongoDB** (running locally on port 27017)

### **Installation**
1.  **Install Dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

### **Run the System**
Simply double-click **`start.bat`** (Windows) or run:
```bash
python start.py
```
This script automates:
1.  Starting the MongoDB backend.
2.  Serving the frontend.
3.  Launching the Dashboard in your browser.

---

## 📂 **Project Structure**

- **`backend/`**: Flask API & Database logic.
    - `simple_app.py`: Main application core.
- **`frontend/`**: The Hunter Interface.
    - `dashboard.html`: Main HUD.
    - `css/style.css`: Glassmorphism UI styles.
    - `js/dashboard.js`: Client-side logic.
- **`uploads/`**: Stores user profile images.

---

## 🛠️ **Troubleshooting**

- **"Unable to load quests":** Make sure your MongoDB is running.
- **Login fails:** Check credentials. If 2 days passed, check if you lost a level!

---

*System Designer: Antigravity*
