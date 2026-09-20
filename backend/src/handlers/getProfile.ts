import { createHandler } from '../utils/handler.ts';
import { profileController } from '../controllers/ProfileController.ts';

/**
 * GET  /profile → read the caller's PROFILE item (including their UPI ID).
 * PATCH /profile → update it. The user id always comes from the Cognito JWT.
 */
export const handler = createHandler(async ({ event, userId }) => {
    const method = event.httpMethod || '';
    if (method === 'PATCH') {
        return profileController.updateProfile(userId, event);
    }
    return profileController.getProfile(userId);
});