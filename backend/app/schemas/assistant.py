from pydantic import BaseModel


class AssistantChatRequest(BaseModel):
    message: str


class AssistantChatResponse(BaseModel):
    message: str