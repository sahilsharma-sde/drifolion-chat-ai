import { HumanMessage, AIMessage } from "@langchain/core/messages";

export function mapMessages(message: any[]){
    return message.map((msg) => {
        if(msg.role === 'user'){
            return new HumanMessage(msg.content);
        }

        return new AIMessage(msg.content);
    });
}

// This converts MongoDB messages into LangChain-compatible messages.