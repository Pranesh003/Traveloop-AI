import { AiConversation } from '../../config/database/mongodb/models/AiConversation';
import { AiRecommendation } from '../../config/database/mongodb/models/System';
import { geminiService } from './gemini.service';
import { openaiService } from './openai.service';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { env } from '../../config/env';

export type AiModel = 'gemini' | 'openai';
export type AgentType = 'trip_planner' | 'budget' | 'packing' | 'weather' | 'destination' | 'assistant';

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  trip_planner: 'You are an expert AI trip planner for Traveloop AI. Create detailed, personalized travel itineraries. Always consider budget, travel style, and user preferences. Format responses clearly and practically.',
  budget: 'You are a travel budget expert for Traveloop AI. Help users plan and track travel expenses. Provide accurate cost estimates for different destinations and travel styles.',
  packing: 'You are a packing specialist for Traveloop AI. Create comprehensive, destination-specific packing lists. Consider weather, activities, duration, and travel style.',
  weather: 'You are a travel weather expert for Traveloop AI. Provide detailed weather information and travel timing advice for destinations worldwide.',
  destination: 'You are a destination expert for Traveloop AI. Provide deep insights about travel destinations, including culture, food, attractions, safety, and practical tips.',
  assistant: 'You are Traveloop AI, a comprehensive travel assistant. Help users with all aspects of travel planning, from destination research to itinerary building, budgeting, and travel tips.',
};

export const aiService = {
  async chat(params: {
    userId: string;
    message: string;
    conversationId?: string;
    agentType?: AgentType;
    model?: AiModel;
    tripId?: string;
  }) {
    const { userId, message, conversationId, agentType = 'assistant', model = 'gemini', tripId } = params;

    // Load or create conversation
    let conversation = conversationId
      ? await AiConversation.findOne({ _id: conversationId, userId })
      : null;

    if (!conversation) {
      conversation = new AiConversation({
        userId,
        tripId,
        agentType,
        aiModel: model,
        title: message.substring(0, 60),
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build message history for AI
    const systemPrompt = SYSTEM_PROMPTS[agentType];
    let aiResponse: string;

    try {
      if (model === 'openai' && env.OPENAI_API_KEY) {
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...conversation.messages.slice(-20).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ];
        aiResponse = await openaiService.chat(messages);
      } else {
        // Default to Gemini
        const history = conversation.messages.slice(-20, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })) as { role: 'user' | 'model'; parts: { text: string }[] }[];

        aiResponse = await geminiService.chat(
          [...history, { role: 'user', parts: [{ text: message }] }],
          systemPrompt,
        );
      }
    } catch (error) {
      logger.error('AI service error:', error);
      throw AppError.internal('AI service temporarily unavailable. Please try again.');
    }

    // Save AI response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await conversation.save();

    return {
      conversationId: conversation._id,
      response: aiResponse,
      agentType,
      model: conversation.aiModel,
    };
  },

  async generateItinerary(params: {
    userId: string;
    destination: string;
    days: number;
    budget: number;
    currency?: string;
    travelStyle?: string;
    groupSize?: number;
    interests?: string[];
    tripId?: string;
  }) {
    const { userId, tripId, ...itineraryParams } = params;

    const responseText = await geminiService.generateItinerary({
      destination: itineraryParams.destination,
      days: itineraryParams.days,
      budget: itineraryParams.budget,
      currency: itineraryParams.currency ?? 'USD',
      travelStyle: itineraryParams.travelStyle ?? 'mid-range',
      groupSize: itineraryParams.groupSize ?? 1,
      interests: itineraryParams.interests ?? ['sightseeing', 'food', 'culture'],
    });

    // Parse JSON response
    let itinerary: unknown;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText];
      itinerary = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      itinerary = { rawResponse: responseText };
    }

    // Save as conversation
    await AiConversation.create({
      userId,
      tripId,
      agentType: 'trip_planner',
      aiModel: 'gemini',
      title: `Itinerary: ${itineraryParams.destination} (${itineraryParams.days} days)`,
      messages: [
        { role: 'user', content: `Generate itinerary for ${itineraryParams.destination}`, timestamp: new Date() },
        { role: 'assistant', content: responseText, timestamp: new Date() },
      ],
    });

    return itinerary;
  },

  async estimateBudget(params: {
    userId: string;
    destinations: string[];
    days: number;
    travelers: number;
    style: 'budget' | 'mid-range' | 'luxury';
  }) {
    const responseText = await geminiService.estimateBudget({
      destinations: params.destinations,
      days: params.days,
      travelers: params.travelers,
      style: params.style,
    });

    let budget: unknown;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText];
      budget = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      budget = { rawResponse: responseText };
    }

    return budget;
  },

  async generatePackingList(params: {
    userId: string;
    destination: string;
    days: number;
    weather: string;
    activities: string[];
    travelType: string;
  }) {
    const { userId, ...packingParams } = params;
    const responseText = await geminiService.generatePackingList(packingParams);

    let list: unknown;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText];
      list = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      list = { rawResponse: responseText };
    }

    return list;
  },

  async analyzeRisk(destination: string, travelDate: string) {
    const responseText = await geminiService.analyzeRisk(destination, travelDate);

    let analysis: unknown;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText];
      analysis = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      analysis = { rawResponse: responseText };
    }

    return analysis;
  },

  async suggestDestinations(params: {
    userId: string;
    interests: string[];
    budget: number;
    duration: number;
    currentLocation?: string;
    season: string;
  }) {
    const { userId, ...suggestionParams } = params;
    const responseText = await geminiService.suggestDestinations(suggestionParams);

    let destinations: unknown;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText];
      destinations = JSON.parse(jsonMatch[1] ?? responseText);
    } catch {
      destinations = { rawResponse: responseText };
    }

    // Save recommendation
    if (Array.isArray(destinations)) {
      await AiRecommendation.create({
        userId,
        type: 'destination',
        recommendations: (destinations as any[]).map((d: any, i: number) => ({
          id: `rec_${i}`,
          name: d.destination,
          reason: d.whyRecommended,
          score: 10 - i,
          metadata: d,
        })),
        aiModel: 'gemini',
      });
    }

    return destinations;
  },

  async getConversations(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
      AiConversation.find({ userId, isArchived: false })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-messages'),
      AiConversation.countDocuments({ userId, isArchived: false }),
    ]);
    return { conversations, total };
  },

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await AiConversation.findOne({ _id: conversationId, userId });
    if (!conversation) throw AppError.notFound('Conversation');
    return conversation;
  },

  async deleteConversation(conversationId: string, userId: string) {
    const result = await AiConversation.deleteOne({ _id: conversationId, userId });
    if (result.deletedCount === 0) throw AppError.notFound('Conversation');
  },
};
