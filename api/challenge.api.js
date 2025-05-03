const Challenge = require('../models/challenge.model');
const AuthModel = require('../models/auth.model');
const {
    sendBadRequest,
    sendCreated,
    sendServerError,
    sendSuccess,
    sendNotFound,
    sendUnauthorized,
    sendForbidden
} = require('../utils/base_response');

exports.addChallenge = async (req, res, next) => {
    const {
        challenge_name,
        sport_type,
        goal,
        duration_days,
        created_by,
        start_date,
        end_date
    } = req.body;

    const userId = req.userId;
    try {
        if (!challenge_name || !created_by) {
            return sendBadRequest(res, 'Challenge name and creator are required');
        }

        const creator = await AuthModel.findById(userId);
        if (!creator) {
            return sendNotFound(res, 'Creator not found');
        }
        

        let calculatedEndDate = end_date;
        if (!end_date && start_date && duration_days) {
            calculatedEndDate = new Date(start_date);
            calculatedEndDate.setDate(calculatedEndDate.getDate() + duration_days);
        }

        const newChallenge = new Challenge({
            challenge_name,
            sport_type,
            goal,
            duration_days,
            created_by,
            start_date: start_date ? new Date(start_date) : new Date(),
            end_date: calculatedEndDate,
            participants: [{
                user: created_by,
                progress: 0,
                joined_at: new Date()
            }]
        });

        const savedChallenge = await newChallenge.save();

        const populatedChallenge = await Challenge.findById(savedChallenge._id)
            .populate('created_by', 'username email')
            .populate('participants.user', 'username email');

        return sendCreated(res, 'Challenge created successfully', populatedChallenge);

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
};

exports.getChallengeByMe = async (req, res, next) => {
    const userId = req.userId;
    const { status } = req.query;

    try {
        // Check if user is authenticated
        if (!userId) {
            return sendUnauthorized(res, 'Authentication required');
        }

        // Find challenges where user is a participant (participants.user == userId)
        const challenges = await Challenge.find({ 'participants.user': userId,'participants.status': status })
            .populate('created_by', 'username email')
            .populate('participants.user', 'username email');

        // // Check if any challenges exist
        // if (!challenges || challenges.length === 0) {
        //     return sendNotFound(res, 'No challenges found for this user');
        // }

        // Prepare response data
        const challengeList = challenges.map(challenge => ({
            id: challenge._id,
            challenge_name: challenge.challenge_name,
            sport_type: challenge.sport_type,
            goal: challenge.goal,
            duration_days: challenge.duration_days,
            created_by: {
                id: challenge.created_by._id,
                username: challenge.created_by.username,
                email: challenge.created_by.email
            },
            start_date: challenge.start_date,
            end_date: challenge.end_date,
            participants: challenge.participants.map(participant => ({
                user: {
                    id: participant.user._id,
                    username: participant.user.username,
                    email: participant.user.email
                },
                progress: participant.progress,
                joined_at: participant.joined_at
            })),
            created_at: challenge.created_at,
            updated_at: challenge.updated_at,
        }));

        return sendSuccess(res, 'Challenges retrieved successfully', {
            total_challenges: challengeList.length,
            challenges: challengeList
        });

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
};

exports.getChallengeDetail = async (req, res, next) => {
    const { challengeId } = req.query; 
    try {
        if (!challengeId) {
            return sendBadRequest(res, 'Challenge ID is required');
        }

        const challenge = await Challenge.findById(challengeId)
            .populate('created_by', 'username email avatar')
            .populate('participants.user', 'username email avatar');

        if (!challenge) {
            return sendNotFound(res, 'Challenge not found');
        }

        const challengeDetails = {
            id: challenge._id,
            challenge_name: challenge.challenge_name,
            sport_type: challenge.sport_type,
            goal: challenge.goal,
            duration_days: challenge.duration_days,
            created_by: challenge.created_by,
            start_date: challenge.start_date,
            end_date: challenge.end_date,
            participants: challenge.participants.map(participant => ({
                user: participant.user,
                progress: participant.progress,
                joined_at: participant.joined_at
            })),
            created_at: challenge.created_at,
            updated_at: challenge.updated_at
        };

        return sendSuccess(res, 'Challenge details retrieved successfully', challengeDetails);

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
};

exports.getChallengeParticipants = async (req, res, next) => {
    const { challengeId } = req.query;

    try {
        if (!challengeId) {
            return sendBadRequest(res, 'Challenge ID is required');
        }

        const challenge = await Challenge.findById(challengeId)
            .populate('participants.user', 'username email avatar')
            .select('participants');

        if (!challenge) {
            return sendNotFound(res, 'Challenge not found');
        }

        const participants = challenge.participants.map(participant => ({
            user: {
                id: participant.user._id,
                username: participant.user.username,
                email: participant.user.email,
                avatar: participant.user.avatar,
            },
            progress: participant.progress,
            joined_at: participant.joined_at
        }));

        return sendSuccess(res, 'Participants retrieved successfully', {
            totalParticipants: participants.length,
            participants
        });

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
};

///todo: do it later
exports.joinChallenge = async (req, res, next) => {
    const { challengeId } = req.params;
    const userId = req.userId;

    try {
        if (!challengeId) {
            return sendBadRequest(res, 'Challenge ID is required');
        }

        if (!userId) {
            return sendUnauthorized(res, 'Authentication required');
        }

        const user = await AuthModel.findById(userId);
        if (!user) {
            return sendNotFound(res, 'User not found');
        }

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return sendNotFound(res, 'Challenge not found');
        }

        const isParticipant = challenge.participants.some(
            participant => participant.user.toString() === userId
        );
        if (isParticipant) {
            return sendBadRequest(res, 'User is already a participant');
        }

        challenge.participants.push({
            user: userId,
            progress: 0,
            joined_at: new Date()
        });

        await challenge.save();

        const populatedChallenge = await Challenge.findById(challengeId)
            .populate('participants.user', 'username email');

        const participants = populatedChallenge.participants.map(participant => ({
            user: {
                id: participant.user._id,
                username: participant.user.username,
                email: participant.user.email
            },
            progress: participant.progress,
            joined_at: participant.joined_at
        }));

        return sendSuccess(res, 'Successfully joined challenge', {
            challengeId,
            totalParticipants: participants.length,
            participants
        });

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
};