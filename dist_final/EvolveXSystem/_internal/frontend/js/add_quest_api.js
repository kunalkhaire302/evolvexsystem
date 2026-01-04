// Add Quest endpoint to API
API.addQuest = async function (questData) {
    return await this.request('/quests/add', 'POST', questData);
};
