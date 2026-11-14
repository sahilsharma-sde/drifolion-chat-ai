import { Schema, model, Types } from "mongoose";

/* Message Model */

const messageSchema = new Schema(
    {
        conversationId: {
            type: Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        role: {
            type: String,
            enum: [
                'user',
                'assistant'
            ],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },

        // Which specialist agent produced this reply. Only set on assistant
        // messages - lets the UI show a route badge ("Answered by Coding
        // Agent") without re-deriving it or leaking the router's raw
        // classification output into the message content itself.
        route: {
            type: String,
            enum: ['coding', 'rag', 'general'],
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Message = model('Message', messageSchema);