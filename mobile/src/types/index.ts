// TypeScript types for the EvolveX mobile app

export interface User {
    id: string;
    username: string;
    email: string;
    level: number;
    exp: number;
    exp_to_next_level: number;
    stats: {
        strength: number;
        agility: number;
        intelligence: number;
        stamina: number;
        max_stamina: number;
    };
    health: number;
    max_health: number;
    skill_points: number;
    profile_image?: string;
    titles: string[];
    created_at: string;
}

export interface Quest {
    id: string;
    _id?: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    exp_reward: number;
    stamina_cost: number;
    is_custom: boolean;
    is_daily: boolean;
    completed?: boolean;
    stat_bonus?: {
        type: string;
        amount: number;
    };
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    type: 'active' | 'passive';
    level: number;
    max_level: number;
    unlocked: boolean;
    cost: number;
    effect: string;
    icon: string;
}

export interface Title {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    requirement: string;
    bonus?: string;
}

export interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    data?: T;
}

export interface LoginResponse {
    token?: string;
    access_token?: string;
    message: string;
    user?: Partial<User>;
}

export interface ProfileResponse extends User { }

export interface QuestsResponse {
    quests: Quest[];
}

export interface SkillsResponse {
    skills: Skill[];
    unlocked_skills: string[];
}

export interface TitlesResponse {
    titles: Title[];
}

export interface CompleteQuestResponse {
    message: string;
    exp_gained: number;
    new_exp: number;
    new_level: number;
    leveled_up: boolean;
    stat_increase?: {
        stat: string;
        amount: number;
    };
    skill_points_gained?: number;
}
