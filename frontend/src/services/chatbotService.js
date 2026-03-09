import chatData from "../data/chatData.json";

class ChatbotService {
  constructor() {
    this.data = chatData;
  }

  // Get greeting message
  getGreeting() {
    return this.data.greeting;
  }

  // Get bot name
  getBotName() {
    return this.data.botName;
  }

  // Get quick questions
  getQuickQuestions() {
    return this.data.quickQuestions;
  }

  // Find answer for a question
  findAnswer(questionId) {
    return this.data.responses[questionId.toString()];
  }

  // Search for answer based on user input
  searchAnswer(userInput) {
    if (!userInput || userInput.trim() === "") {
      return this.getRandomFallback();
    }

    const input = userInput.toLowerCase().trim();

    // Try to match with quick questions keywords
    for (const question of this.data.quickQuestions) {
      const matchesKeyword = question.keywords.some((keyword) =>
        input.includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        return this.findAnswer(question.id);
      }
    }

    // No match found, return fallback
    return this.getRandomFallback();
  }

  // Get random fallback message
  getRandomFallback() {
    const fallbacks = this.data.fallbackResponses;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Check if a message is one of fallback responses
  isFallbackResponse(text) {
    if (!text) return false;
    const fallbacks = this.data.fallbackResponses || [];
    return fallbacks.includes(text);
  }

  // Get random closing message
  getRandomClosing() {
    const closings = this.data.closingMessages;
    return closings[Math.floor(Math.random() * closings.length)];
  }
}

export default new ChatbotService();
