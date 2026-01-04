# 🦅 **EVOLVEX SYSTEM** (Solo Leveling)

> *"The System will help the Player grow."*

**EvolveX** is a gamified task management and self-improvement system inspired by *Solo Leveling*. It tracks your real-life progress as an RPG, allowing you to level up, earn skills, and complete daily quests.

---

## 🌐 **Live Demo**

**The project is deployed and live on Render!**

🔗 **Access the System:** [https://evolvexsystem-tcz2.onrender.com/](https://evolvexsystem-tcz2.onrender.com/)

---

## 📝 **Registration Rules**

When creating a new account, please follow these guidelines:

### **Username**
- Must be unique (not already taken by another user)
- Required field

### **Email**
- Must be a valid email format (e.g., `player@example.com`)
- Must be unique (one account per email)
- Required field

### **Password**
- Required field
- Passwords are securely hashed using bcrypt encryption
- Choose a strong password for better security

> ⚠️ **Note:** Both username and email must be unique across the system. If registration fails, try a different username or email.

---

## ⚡ **Key Features (v4.0 - EGO Update)**

### 🧠 **System Intelligence (The "EGO")**
The System is now "Aware" of your actions and stats:
-   **Weakness Exposure:** Detects stat imbalances (e.g., Low Agility) and warns you.
-   **Recommendation Engine:** Suggests specific quests (e.g., "10km Run") to fix weaknesses.
-   **Burnout Prediction:** Warns you if Stamina drops below 20% to prevent overtraining.
-   **Identity Tokens:** Automatically awards titles like **"Night Owl"** or **"Early Riser"** based on your behavior.
-   **Streak Protection:** Login streaks now **Decay** (-1 day) instead of resetting after 24h inactivity.

### 📜 **Quest System 2.0**
-   **Physical Training:** Dedicated section for "The Daily Quest" (Push-ups, Sit-ups, Running).
-   **System Missions:** Separate section for Productivity (Coding, Reading) and Custom Goals.
-   **Visuals:** Color-coded cards (Green for Physical, Cyan for System).

### 🎮 **Player Status**
-   **Leveling System:** Earn EXP from quests to level up.
-   **Stats:** Track Strength, Agility, Intelligence, Stamina.
-   **Titles:** Behavior-based & Achievement-based titles.

### ⚔️ **Skills & Abilities**
-   **Real-World Skills:** Pomodoro Timer, Focus Music, Breathing Exercises.
-   **Unlock System:** Use Skill Points (SP) to unlock productivity tools.

### 👤 **Profile HUD**
-   **Hunter ID Card:** View your generated avatar, rank, and "System Notices".
-   **Customization:** Upload your own profile picture.

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
