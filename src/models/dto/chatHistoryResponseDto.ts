export interface ChatHistoryResponseDto {
    chat: {
        sender: string;
        content: string;
    }[];
    totalPages: number;
    currentPage: number;
}
